const LOW_CONFIDENCE = "low"
const MEDIUM_CONFIDENCE = "medium"
const HIGH_CONFIDENCE = "high"

export async function run(input = {}) {
  const communityActivity = normalizeList(input.approved_community_activity || input.community_activity)
  const wikiContext = normalizeList(input.allowed_wiki_context || input.wiki_context)
  const topicSignals = normalizeList(input.topic_signals || input.topics)
  const source = input.platform || input.source || input.platform_metadata || {}

  const topicScores = new Map()
  const styleScores = new Map()
  const collaborationSignals = []
  const sourceTrail = []

  for (const item of [...communityActivity, ...wikiContext, ...topicSignals]) {
    for (const topic of extractTopics(item)) addScore(topicScores, topic, 1)
    const style = extractStyle(item)
    if (style) addScore(styleScores, style, 1)
    const collaboration = extractCollaboration(item)
    if (collaboration) collaborationSignals.push(collaboration)
    const sourceLabel = extractSourceLabel(item)
    if (sourceLabel) sourceTrail.push(sourceLabel)
  }

  const topics = topEntries(topicScores, 5)
  const responseStyle = topEntries(styleScores, 1)[0] || "clear and concise"
  const confidence = confidenceFromSignals(communityActivity.length + wikiContext.length + topicSignals.length, topics.length)

  return {
    topics_engaged_with: topics,
    preferred_response_style: responseStyle,
    community_interests: topics.slice(0, 3),
    collaboration_signals: unique(collaborationSignals).slice(0, 4),
    moderation_safe_notes: [
      "Uses approved summaries only.",
      "Does not expose raw private messages.",
      "Does not classify sensitive traits."
    ],
    confidence,
    signals_used: buildSignalsUsed({ communityActivity, wikiContext, topicSignals, source }),
    source_trail_summary: summarizeSourceTrail(sourceTrail, source)
  }
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function extractTopics(item) {
  const raw = [
    item?.topic,
    item?.category,
    item?.channel_topic,
    item?.community_topic,
    ...(Array.isArray(item?.topics) ? item.topics : []),
    ...(Array.isArray(item?.interests) ? item.interests : [])
  ]
  return raw.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
}

function extractStyle(item) {
  const value = String(item?.preferred_response_style || item?.response_style || item?.communication_style || "").trim().toLowerCase()
  if (!value) return ""
  if (/brief|short|concise/.test(value)) return "clear and concise"
  if (/detail|deep|long/.test(value)) return "detailed when asked"
  if (/friendly|casual/.test(value)) return "friendly and casual"
  if (/formal|direct/.test(value)) return "direct and structured"
  return value
}

function extractCollaboration(item) {
  const value = String(item?.collaboration_signal || item?.collaboration || item?.role || "").trim()
  if (value) return value
  const text = `${item?.summary || ""} ${item?.note || ""}`.toLowerCase()
  if (/help|support|question/.test(text)) return "asks for support"
  if (/build|project|ship|debug/.test(text)) return "project-focused"
  if (/learn|study|docs|tutorial/.test(text)) return "learning-focused"
  return ""
}

function extractSourceLabel(item) {
  return String(item?.source || item?.app || item?.platform || item?.channel || item?.name || "").trim()
}

function addScore(map, key, amount) {
  if (!key) return
  map.set(key, (map.get(key) || 0) + amount)
}

function topEntries(map, limit) {
  return [...map.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, limit)
    .map(([key]) => key)
}

function confidenceFromSignals(signalCount, topicCount) {
  if (signalCount >= 5 && topicCount >= 3) return HIGH_CONFIDENCE
  if (signalCount >= 2 && topicCount >= 1) return MEDIUM_CONFIDENCE
  return LOW_CONFIDENCE
}

function buildSignalsUsed({ communityActivity, wikiContext, topicSignals, source }) {
  return [
    communityActivity.length ? `${communityActivity.length} approved community summaries` : "",
    wikiContext.length ? `${wikiContext.length} allowed Wiki entries` : "",
    topicSignals.length ? `${topicSignals.length} topic signals` : "",
    source?.platform ? `platform: ${source.platform}` : ""
  ].filter(Boolean)
}

function summarizeSourceTrail(sourceTrail, source) {
  const labels = unique(sourceTrail).slice(0, 4)
  if (!labels.length && source?.platform) return `Approved ${source.platform} context.`
  if (!labels.length) return "No detailed source trail was provided."
  return `Used approved summaries from ${labels.join(", ")}.`
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
}
