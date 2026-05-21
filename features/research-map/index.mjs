export function run(input = {}) {
  const packets = Array.isArray(input.schema_packets) ? input.schema_packets.filter(Boolean) : []
  const clusters = new Map()
  const sources = []

  for (const packet of packets) {
    const theme = inferTheme(packet)
    const cluster = clusters.get(theme) || {
      theme,
      packet_count: 0,
      confidence: 0,
      topics: new Set(),
      sources: []
    }
    cluster.packet_count += 1
    cluster.confidence += Number(packet.confidence || 0)
    addTopics(cluster.topics, packet)
    addSources(cluster.sources, packet.sources)
    addSources(sources, packet.sources)
    clusters.set(theme, cluster)
  }

  const mappedClusters = [...clusters.values()].map((cluster) => ({
    theme: cluster.theme,
    packet_count: cluster.packet_count,
    confidence: cluster.packet_count ? round(cluster.confidence / cluster.packet_count) : 0,
    topics: [...cluster.topics].slice(0, 8),
    sources: cluster.sources.slice(0, 8)
  })).sort((a, b) => b.packet_count - a.packet_count || b.confidence - a.confidence)

  return {
    themes: mappedClusters.map((cluster) => cluster.theme),
    sources: dedupeSources(sources).slice(0, 12),
    clusters: mappedClusters,
    open_questions: buildOpenQuestions(mappedClusters),
    next_steps: buildNextSteps(mappedClusters)
  }
}

function inferTheme(packet = {}) {
  const attributes = packet.attributes && typeof packet.attributes === "object" ? packet.attributes : {}
  return clean(attributes.theme || attributes.topic || packet.schema_type || packet.category) || "research"
}

function addTopics(target, packet = {}) {
  const attributes = packet.attributes && typeof packet.attributes === "object" ? packet.attributes : {}
  for (const value of [attributes.topic, attributes.theme, attributes.subject, packet.schema_type, packet.category]) {
    const topic = clean(value)
    if (topic) target.add(topic)
  }
}

function addSources(target, sources = []) {
  for (const source of Array.isArray(sources) ? sources : []) {
    const id = clean(source.id || source.source_id || source.url || source.title || source)
    if (!id || target.some((existing) => existing.id === id)) continue
    target.push({
      id,
      title: clean(source.title) || id,
      url: clean(source.url),
      type: clean(source.type)
    })
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  return sources.filter((source) => {
    if (seen.has(source.id)) return false
    seen.add(source.id)
    return true
  })
}

function buildOpenQuestions(clusters) {
  if (!clusters.length) return ["No research trail is available yet."]
  return clusters.slice(0, 3).map((cluster) => `What should the app do next with ${cluster.theme}?`)
}

function buildNextSteps(clusters) {
  if (!clusters.length) return ["Capture or import research activity before running this feature."]
  return ["Show grouped sources.", "Let the user confirm useful themes.", "Avoid acting on weak clusters without confirmation."]
}

function clean(value) {
  return typeof value === "string" ? value.trim() : ""
}

function round(value) {
  return Math.round(value * 100) / 100
}
