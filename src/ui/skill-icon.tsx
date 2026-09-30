import {
  Briefcase,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Rocket,
  Shield,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  code: Code2,
  cpu: Cpu,
  database: Database,
  layers: Layers,
  shield: Shield,
  rocket: Rocket,
  globe: Globe,
  terminal: Terminal,
  briefcase: Briefcase,
};

export function SkillIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
