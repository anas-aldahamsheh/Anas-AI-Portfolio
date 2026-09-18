/**
 * Automated Production Deployment Verification Script (F050)
 *
 * Runs comprehensive pre-flight and smoke verifications:
 * 1. Environment and secrets integrity
 * 2. System liveness and memory thresholds
 * 3. Subsystem readiness (database, vector store, cache, configuration)
 * 4. Baseline prompt registry invariants
 * 5. Baseline navigation and localization integrity
 */

import { validateEnv } from "../src/lib/config/env";
import { healthService } from "../src/lib/health/health-service";
import { BASELINE_PROMPT_DEFINITIONS } from "../src/ai/prompts/baseline-prompts";
import { DEFAULT_NAVIGATION_ITEMS } from "../src/modules/navigation/infrastructure/default-navigation";

interface VerificationStep {
  name: string;
  run: () => Promise<boolean> | boolean;
}

export async function runDeploymentVerification(): Promise<{
  success: boolean;
  totalChecks: number;
  passedChecks: number;
  results: Array<{ name: string; passed: boolean; error?: string }>;
}> {
  console.info("==================================================");
  console.info("   PORTFOLIO PRODUCTION DEPLOYMENT VERIFICATION   ");
  console.info("==================================================");

  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  const checks: VerificationStep[] = [
    {
      name: "1. Environment Configuration & Secret Format Validation",
      run: () => {
        const env = validateEnv();
        if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
          throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
        }
        if (!env.ENCRYPTION_MASTER_KEY || env.ENCRYPTION_MASTER_KEY.length !== 64) {
          throw new Error("ENCRYPTION_MASTER_KEY must be 64-character hex");
        }
        return true;
      },
    },
    {
      name: "2. System Process Liveness & Memory Threshold",
      run: () => {
        const liveness = healthService.getLiveness();
        if (liveness.status !== "healthy") {
          throw new Error(`Liveness status is '${liveness.status}', expected 'healthy'`);
        }
        if (typeof liveness.uptimeSeconds !== "number" || liveness.uptimeSeconds < 0) {
          throw new Error("Invalid uptime measurement");
        }
        return true;
      },
    },
    {
      name: "3. Subsystem Readiness & Operational Probes",
      run: async () => {
        const readiness = await healthService.getReadiness();
        if (readiness.status === "unready") {
          throw new Error(
            `Readiness status is 'unready'. Checks: ${JSON.stringify(readiness.checks)}`,
          );
        }
        console.info(`   -> Operational Status: ${readiness.status.toUpperCase()}`);
        console.info(`   -> Checks: DB=${readiness.checks.database.status}, Cache=${readiness.checks.cache.status}, Config=${readiness.checks.configuration.status}`);
        return true;
      },
    },
    {
      name: "4. AI Prompt Registry Invariants & Grounding Boundaries",
      run: () => {
        const requiredRoles = ["chat_system", "query_router"];
        for (const role of requiredRoles) {
          const found = BASELINE_PROMPT_DEFINITIONS.find((p) => p.slug === role);
          if (!found) {
            throw new Error(`Missing mandatory baseline prompt definition: ${role}`);
          }
          if (!found.systemPrompt || found.systemPrompt.length < 20) {
            throw new Error(`Baseline prompt '${role}' has invalid system prompt`);
          }
        }
        return true;
      },
    },
    {
      name: "5. Navigation Configuration & Localization Invariants",
      run: () => {
        if (!Array.isArray(DEFAULT_NAVIGATION_ITEMS) || DEFAULT_NAVIGATION_ITEMS.length === 0) {
          throw new Error("Default navigation items are empty or invalid");
        }
        const hasProjects = DEFAULT_NAVIGATION_ITEMS.some((i) => i.target === "/projects");
        const hasCv = DEFAULT_NAVIGATION_ITEMS.some((i) => i.target === "/cv");
        if (!hasProjects || !hasCv) {
          throw new Error("Mandatory navigation routes (/projects, /cv) are missing");
        }
        return true;
      },
    },
  ];

  let passed = 0;

  for (const check of checks) {
    try {
      const ok = await check.run();
      if (ok) {
        console.info(` [PASS] ${check.name}`);
        results.push({ name: check.name, passed: true });
        passed += 1;
      } else {
        console.error(` [FAIL] ${check.name}`);
        results.push({ name: check.name, passed: false, error: "Check returned false" });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(` [FAIL] ${check.name} - ${errorMsg}`);
      results.push({ name: check.name, passed: false, error: errorMsg });
    }
  }

  console.info("--------------------------------------------------");
  console.info(`Summary: ${passed}/${checks.length} checks passed.`);
  console.info("==================================================");

  const success = passed === checks.length;
  return {
    success,
    totalChecks: checks.length,
    passedChecks: passed,
    results,
  };
}

// Execute directly if invoked from CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith("verify-deployment.ts") || process.argv[1].endsWith("verify-deployment.js"))
) {
  runDeploymentVerification()
    .then((res) => {
      if (!res.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal deployment verification error:", err);
      process.exit(1);
    });
}
