import test from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createFeatureRegistry, listLocalFeatures, loadFeature, runFeature, validateFeatureManifest } from "../src/index.mjs"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

test("valid and invalid manifests are handled", () => {
  assert.equal(validateFeatureManifest({
    schema_version: "memact.feature_manifest.v0",
    feature_id: "x",
    name: "X",
    description: "X",
    required_scopes: [],
    required_schema_types: []
  }).ok, true)
  assert.equal(validateFeatureManifest({ feature_id: "x" }).ok, false)
})

test("listLocalFeatures finds examples", async () => {
  const features = await listLocalFeatures(path.join(root, "features"))
  const registry = createFeatureRegistry(features)
  assert.equal(registry.length, 3)
})

test("default features run", async () => {
  const wiki = await loadFeature(path.join(root, "features", "user-context-wiki"))
  const wikiResult = await runFeature(wiki, { schema_packets: [{ category: "research", schema_type: "source" }] })
  assert.equal(wikiResult.status, "ok")
  assert.ok(wikiResult.output.groups["research:source"])

  const load = await loadFeature(path.join(root, "features", "cognitive-load"))
  assert.equal((await runFeature(load, { schema_packets: [] })).output.level, "unknown")

  const map = await loadFeature(path.join(root, "features", "research-map"))
  assert.deepEqual((await runFeature(map, { schema_packets: [] })).output.clusters, [])
})
