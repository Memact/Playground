import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadFeature, runFeature } from "../src/index.mjs"

const root = path.dirname(fileURLToPath(import.meta.url))
const feature = await loadFeature(path.join(root, "..", "features", "adaptive-article-overview"))
console.log(await runFeature(feature, {
  article: {
    title: "Example article",
    excerpt: "A short article excerpt.",
    topic: "technology"
  },
  reading_memory: {
    preferred_summary_style: "key_points",
    preferred_topics: ["technology"]
  },
  recent_events: []
}))
