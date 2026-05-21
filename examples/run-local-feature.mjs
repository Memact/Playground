import path from "node:path"
import { fileURLToPath } from "node:url"
import { loadFeature, runFeature } from "../src/index.mjs"

const root = path.dirname(fileURLToPath(import.meta.url))
const feature = await loadFeature(path.join(root, "..", "features", "user-context-wiki"))
console.log(await runFeature(feature, { schema_packets: [] }))
