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

test("listLocalFeatures finds local features", async () => {
  const features = await listLocalFeatures(path.join(root, "features"))
  const registry = createFeatureRegistry(features)
  assert.equal(registry.length, 6)
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

  const article = await loadFeature(path.join(root, "features", "adaptive-article-overview"))
  const articleResult = await runFeature(article, {
    article: {
      title: "New AI policy rules",
      excerpt: "The article explains new policy rules for AI systems.",
      topic: "ai policy",
      source: "Example News",
      estimated_read_time_minutes: 8
    },
    reading_memory: {
      average_read_time_seconds: 260,
      average_scroll_depth: 88,
      finish_rate: 0.82,
      preferred_topics: ["ai policy"],
      skipped_topics: ["celebrity"],
      preferred_article_length: "long",
      preferred_summary_style: "deep_dive",
      repeat_topics: ["ai policy"]
    },
    recent_events: []
  })
  assert.equal(articleResult.output.summary_style, "deep_dive")
  assert.match(articleResult.output.overview, /New AI policy rules/)
  assert.equal(articleResult.output.confidence, "high")

  const discord = await loadFeature(path.join(root, "features", "discord-channel-personalizer"))
  const discordResult = await runFeature(discord, {
    user_memory: {
      interests: ["memact", "developer tools"],
      preferred_topics: ["api"],
      muted_topics: ["memes"],
      communication_style: "concise updates"
    },
    server: {
      channels: [
        { id: "1", name: "memact-api", topic: "SDK, API, and feature support" },
        { id: "2", name: "memes", topic: "off-topic jokes" }
      ]
    },
    recent_server_activity: []
  })
  assert.equal(discordResult.output.recommended_channels[0].name, "memact-api")
  assert.equal(discordResult.output.channels_to_avoid[0].name, "memes")

  const community = await loadFeature(path.join(root, "features", "community-context-brief"))
  const communityResult = await runFeature(community, {
    platform: { platform: "discord" },
    approved_community_activity: [
      { channel: "docs", topics: ["api", "support"], summary: "User asks support questions about API setup." },
      { channel: "build", topics: ["projects", "debugging"], summary: "Project-focused debugging discussion." }
    ],
    allowed_wiki_context: [
      { source: "Memact Wiki", interests: ["api"], communication_style: "concise updates" }
    ]
  })
  assert.equal(communityResult.output.preferred_response_style, "clear and concise")
  assert.ok(communityResult.output.topics_engaged_with.includes("api"))
  assert.ok(communityResult.output.moderation_safe_notes.length)
})
