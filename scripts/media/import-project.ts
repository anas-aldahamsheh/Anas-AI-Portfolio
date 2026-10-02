/**
 * Turns a folder of raw captures (PNG screenshots + MP4 screen recordings) into web-ready
 * project media and its showcase manifest.
 *
 *   pnpm media:import -- <capture-folder> <slug> [--captions <file.md>]
 *
 * Writes:
 *   public/images/projects/<slug>/NN.webp (+ NN@2x.webp for desktop shots)
 *   public/images/projects/<slug>/demo-N.mp4, demo-N.webp (poster), demo-N-preview.mp4
 *   src/content/projects/<slug>/showcase.json
 *
 * Screenshots wider than tall are "desktop", the rest "mobile". Captions are read from lines of
 * the captions file that mention the source file name ("01-home.png: The dashboard ...").
 * Existing Arabic captions in showcase.json are kept when the same source file is re-imported.
 * Needs ffmpeg/ffprobe on PATH for videos.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = process.cwd();
const DESKTOP_WIDTH = 1440;
const DESKTOP_LARGE_WIDTH = 2560;
const MOBILE_WIDTH = 780;
const VIDEO_MAX_WIDTH = 1600;
const PREVIEW_WIDTH = 640;
const PREVIEW_SECONDS = 8;

interface ManifestItem {
  kind: "image" | "video";
  device: "desktop" | "mobile";
  src: string;
  srcLarge?: string;
  poster?: string;
  preview?: string;
  width: number;
  height: number;
  duration?: number;
  caption: { en: string; ar: string };
  source: string;
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function positional(): string[] {
  const out: string[] = [];
  for (let i = 2; i < process.argv.length; i++) {
    const value = process.argv[i]!;
    if (value === "--") continue;
    if (value.startsWith("--")) {
      i++;
      continue;
    }
    out.push(value);
  }
  return out;
}

/** "01-home.png: The dashboard" / "- `01-home.png` — The dashboard" → caption per file name. */
export function parseCaptions(markdown: string, files: string[]): Map<string, string> {
  const captions = new Map<string, string>();
  const lines = markdown.split(/\r?\n/);
  for (const file of files) {
    const stem = file.replace(/\.[^.]+$/, "");
    for (const line of lines) {
      const at = line.indexOf(file) >= 0 ? line.indexOf(file) : line.indexOf(stem);
      if (at < 0) continue;
      const matched = line.indexOf(file) >= 0 ? file : stem;
      let rest = line.slice(at + matched.length);
      // Table rows: take the next non-empty cell.
      if (line.trim().startsWith("|")) {
        const cells = rest.split("|").map((c) => c.trim());
        rest = cells.find((c) => c.replace(/[`*_]/g, "").trim()) ?? "";
      }
      const text = rest
        .replace(/^[\s`*_)\]]*(\.[a-z0-9]+)?[\s`*_)\]]*[:—–\-|]*\s*/i, "")
        // A leading technical note such as "(48 s, 1440x900, H.264)" is not part of the caption.
        .replace(/^\([^)]*\)\s*[:—–\-|]*\s*/, "")
        .replace(/[`*_]+/g, "")
        .replace(/\s*\|\s*$/, "")
        .trim();
      if (text) {
        captions.set(file, text);
        break;
      }
    }
  }
  return captions;
}

async function probe(file: string) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height:format=duration",
    "-of",
    "json",
    file,
  ]);
  const info = JSON.parse(stdout) as {
    streams: { width: number; height: number }[];
    format: { duration?: string };
  };
  const stream = info.streams[0];
  if (!stream) throw new Error(`${file}: no video stream`);
  return {
    width: stream.width,
    height: stream.height,
    duration: Number(info.format.duration ?? 0),
  };
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

async function importImage(file: string, outDir: string, publicBase: string, index: number) {
  const image = sharp(file);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new Error(`${file}: unreadable image`);
  const device = meta.width >= meta.height ? "desktop" : "mobile";
  const name = String(index).padStart(2, "0");
  const width = Math.min(meta.width, device === "desktop" ? DESKTOP_WIDTH : MOBILE_WIDTH);
  const height = Math.round((meta.height * width) / meta.width);
  await sharp(file)
    .resize({ width })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(path.join(outDir, `${name}.webp`));
  let srcLarge = "";
  if (device === "desktop" && meta.width > DESKTOP_WIDTH * 1.2) {
    await sharp(file)
      .resize({ width: Math.min(meta.width, DESKTOP_LARGE_WIDTH) })
      .webp({ quality: 78, effort: 6, smartSubsample: true })
      .toFile(path.join(outDir, `${name}@2x.webp`));
    srcLarge = `${publicBase}/${name}@2x.webp`;
  }
  return {
    kind: "image" as const,
    device: device as ManifestItem["device"],
    src: `${publicBase}/${name}.webp`,
    ...(srcLarge ? { srcLarge } : {}),
    width,
    height,
  };
}

async function importVideo(file: string, outDir: string, publicBase: string, index: number) {
  const info = await probe(file);
  const device = info.width >= info.height ? "desktop" : "mobile";
  const name = `demo-${index}`;
  const scale = `scale='min(${VIDEO_MAX_WIDTH},iw)':-2:flags=lanczos`;
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    file,
    "-an",
    "-vf",
    `${scale},fps='min(30,source_fps)',format=yuv420p`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "27",
    "-profile:v",
    "high",
    "-movflags",
    "+faststart",
    path.join(outDir, `${name}.mp4`),
  ]);
  // The preview loop and the poster come from the middle of the run, where the results are,
  // rather than from the empty start screen.
  const previewStart = Math.max(0, Math.min(info.duration * 0.4, info.duration - PREVIEW_SECONDS));
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-ss",
    previewStart.toFixed(2),
    "-t",
    String(PREVIEW_SECONDS),
    "-i",
    file,
    "-an",
    "-vf",
    `scale='min(${PREVIEW_WIDTH},iw)':-2:flags=lanczos,fps=24,format=yuv420p`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "31",
    "-movflags",
    "+faststart",
    path.join(outDir, `${name}-preview.mp4`),
  ]);
  const at = Math.max(0, info.duration * 0.6);
  const frame = path.join(outDir, `${name}.png`);
  await run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-ss",
    String(at),
    "-i",
    file,
    "-frames:v",
    "1",
    frame,
  ]);
  await sharp(frame)
    .resize({ width: Math.min(info.width, DESKTOP_WIDTH) })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, `${name}.webp`));
  await rm(frame);
  const out = await probe(path.join(outDir, `${name}.mp4`));
  return {
    kind: "video" as const,
    device: device as ManifestItem["device"],
    src: `${publicBase}/${name}.mp4`,
    poster: `${publicBase}/${name}.webp`,
    preview: `${publicBase}/${name}-preview.mp4`,
    width: even(out.width),
    height: even(out.height),
    duration: Math.round(info.duration * 10) / 10,
  };
}

async function main() {
  const [inputDir, slug] = positional();
  if (!inputDir || !slug || !/^[a-z0-9-]+$/.test(slug)) {
    console.error("Usage: pnpm media:import -- <capture-folder> <slug> [--captions <file.md>]");
    process.exitCode = 1;
    return;
  }
  // Media may sit in the folder itself or one level down (e.g. screenshots/, video/).
  const entries: string[] = [];
  for (const name of await readdir(inputDir, { withFileTypes: true })) {
    if (name.isFile()) entries.push(name.name);
    else if (name.isDirectory() && !name.name.startsWith(".")) {
      for (const child of await readdir(path.join(inputDir, name.name))) {
        entries.push(path.join(name.name, child));
      }
    }
  }
  entries.sort((a, b) => path.basename(a).localeCompare(path.basename(b), "en", { numeric: true }));
  // Files starting with "_" are drafts the capture left behind.
  const media = entries.filter((f) => !path.basename(f).startsWith("_"));
  const images = media.filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  const videos = media.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  if (images.length === 0 && videos.length === 0) throw new Error(`${inputDir}: no media found`);

  const captionsFile = arg("captions") ?? path.join(inputDir, "project.md");
  const captions = existsSync(captionsFile)
    ? parseCaptions(
        await readFile(captionsFile, "utf8"),
        [...videos, ...images].map((f) => path.basename(f)),
      )
    : new Map<string, string>();

  const outDir = path.join(ROOT, "public", "images", "projects", slug);
  const manifestDir = path.join(ROOT, "src", "content", "projects", slug);
  const manifestFile = path.join(manifestDir, "showcase.json");
  const previous: ManifestItem[] = existsSync(manifestFile)
    ? (JSON.parse(await readFile(manifestFile, "utf8")) as ManifestItem[])
    : [];
  const previousAr = new Map(previous.map((item) => [item.source, item.caption.ar]));

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(manifestDir, { recursive: true });

  const publicBase = `/images/projects/${slug}`;
  const items: ManifestItem[] = [];
  for (const [i, file] of videos.entries()) {
    const media = await importVideo(path.join(inputDir, file), outDir, publicBase, i + 1);
    items.push({
      ...media,
      caption: {
        en: captions.get(path.basename(file)) ?? "",
        ar: previousAr.get(path.basename(file)) ?? "",
      },
      source: path.basename(file),
    });
    console.info(
      `video ${file} → ${media.src} (${media.width}x${media.height}, ${media.duration}s)`,
    );
  }
  for (const [i, file] of images.entries()) {
    const media = await importImage(path.join(inputDir, file), outDir, publicBase, i + 1);
    items.push({
      ...media,
      caption: {
        en: captions.get(path.basename(file)) ?? "",
        ar: previousAr.get(path.basename(file)) ?? "",
      },
      source: path.basename(file),
    });
    console.info(`image ${file} → ${media.src} (${media.device})`);
  }
  await writeFile(manifestFile, `${JSON.stringify(items, null, 2)}\n`);

  const { stdout } = await run("du", ["-sh", outDir]);
  const missing = items.filter((item) => !item.caption.en).map((item) => item.source);
  console.info(
    `\n${items.length} items, ${stdout.trim().split("\t")[0]} on disk → ${manifestFile}`,
  );
  if (missing.length) console.warn(`No caption found for: ${missing.join(", ")}`);
}

// Run only as a command (the caption parser is also imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
