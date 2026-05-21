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
  const wikiResult = await runFeature(wiki, { schema_packets: [{ category: "research", schema_type: "source", confidence: 0.8, attributes: { summary: "API docs" } }] })
  assert.equal(wikiResult.status, "ok")
  assert.equal(wikiResult.output.sections[0].id, "research:source")
  assert.deepEqual(wikiResult.output.sections[0].highlights, ["API docs"])

  const load = await loadFeature(path.join(root, "features", "cognitive-load"))
  assert.equal((await runFeature(load, { schema_packets: [] })).output.level, "unknown")
  assert.equal((await runFeature(load, { schema_packets: [{ category: "developer_work", confidence: 1, attributes: { note: "urgent debug error" } }] })).output.level, "high")

  const map = await loadFeature(path.join(root, "features", "research-map"))
  assert.deepEqual((await runFeature(map, { schema_packets: [] })).output.clusters, [])
  const mapResult = await runFeature(map, {
    schema_packets: [{ category: "research", schema_type: "api", confidence: 0.9, sources: [{ url: "https://example.com/docs", title: "Docs" }] }]
  })
  assert.equal(mapResult.output.clusters[0].theme, "api")
  assert.equal(mapResult.output.sources[0].title, "Docs")
})
