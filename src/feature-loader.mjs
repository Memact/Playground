import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { validateFeatureManifest } from "./manifest-validator.mjs"

export async function loadFeature(featurePath) {
  const manifestPath = path.join(featurePath, "manifest.json")
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))
  const validation = validateFeatureManifest(manifest)
  if (!validation.ok) throw new Error(`Invalid feature manifest: ${validation.errors.join(", ")}`)
  const module = await import(pathToFileURL(path.join(featurePath, "index.mjs")).href)
  return { manifest, run: module.run }
}

export async function listLocalFeatures(featuresDir) {
  const entries = await fs.readdir(featuresDir, { withFileTypes: true })
  const features = []
  for (const entry of entries.filter((item) => item.isDirectory() && !item.name.startsWith("_"))) {
    features.push(await loadFeature(path.join(featuresDir, entry.name)))
  }
  return features
}
