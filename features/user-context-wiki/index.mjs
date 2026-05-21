export function run(input = {}) {
  const packets = normalizePackets(input.schema_packets)
  const groups = new Map()

  for (const packet of packets) {
    const category = clean(packet.category) || "general"
    const schemaType = clean(packet.schema_type) || "memory"
    const key = `${category}:${schemaType}`
    const group = groups.get(key) || {
      id: key,
      title: titleCase(`${category} ${schemaType}`),
      category,
      schema_type: schemaType,
      item_count: 0,
      confidence: 0,
      highlights: [],
      source_count: 0,
      source_trail: [],
      updated_at: packet.created_at || null
    }

    group.item_count += 1
    group.confidence += Number(packet.confidence || 0)
    group.updated_at = latestDate(group.updated_at, packet.created_at)
    addHighlights(group.highlights, packet)
    addSources(group.source_trail, packet.sources)
    group.source_count = group.source_trail.length
    groups.set(key, group)
  }

  const sections = [...groups.values()]
    .map((group) => ({
      ...group,
      confidence: group.item_count ? round(group.confidence / group.item_count) : 0,
      highlights: group.highlights.slice(0, 5),
      source_trail: group.source_trail.slice(0, 8)
    }))
    .sort((a, b) => b.item_count - a.item_count || b.confidence - a.confidence)

  return {
    summary: sections.length
      ? `Built ${sections.length} memory section${sections.length === 1 ? "" : "s"} from ${packets.length} permitted schema packet${packets.length === 1 ? "" : "s"}.`
      : "No permitted schema packets were provided.",
    sections,
    empty: sections.length === 0
  }
}

function normalizePackets(value) {
  return Array.isArray(value) ? value.filter((packet) => packet && typeof packet === "object") : []
}

function addHighlights(target, packet) {
  const attributes = packet.attributes && typeof packet.attributes === "object" ? packet.attributes : {}
  const candidates = [
    attributes.summary,
    attributes.preference,
    attributes.topic,
    attributes.goal,
    attributes.note,
    packet.subject,
    packet.label
  ]
  for (const candidate of candidates) {
    const text = clean(candidate)
    if (text && !target.includes(text)) target.push(text)
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

function clean(value) {
  return typeof value === "string" ? value.trim() : ""
}

function titleCase(value) {
  return value.replace(/[_:-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function latestDate(left, right) {
  if (!right) return left
  if (!left) return right
  return new Date(right).getTime() > new Date(left).getTime() ? right : left
}

function round(value) {
  return Math.round(value * 100) / 100
}
