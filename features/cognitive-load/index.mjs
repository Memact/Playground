export function run(input = {}) {
  const packets = normalize(input.schema_packets)
  const events = normalize(input.events)
  const records = [...packets, ...events]

  if (!records.length) {
    return {
      level: "unknown",
      score: 0,
      reasons: ["Not enough permitted activity."],
      suggestions: ["Ask for a narrower time window or more relevant categories."],
      disclaimer: "This is an app workload signal, not a medical or clinical diagnosis."
    }
  }

  const signal = records.reduce((total, record) => total + scoreRecord(record), 0)
  const score = Math.min(1, Math.round((signal / Math.max(records.length, 1)) * 100) / 100)
  const level = score >= 0.72 ? "high" : score >= 0.42 ? "medium" : "low"
  const reasons = buildReasons(records, score)

  return {
    level,
    score,
    reasons,
    suggestions: buildSuggestions(level),
    contributing_items: records.slice(0, 8).map((record) => ({
      id: record.packet_id || record.event_id || record.record_id || "",
      category: record.category || "general",
      label: record.schema_type || record.event_type || record.label || "activity",
      confidence: Number(record.confidence || record.meaningful_score || 0) || undefined
    })),
    disclaimer: "This is an app workload signal, not a medical or clinical diagnosis."
  }
}

function scoreRecord(record = {}) {
  const text = JSON.stringify(record).toLowerCase()
  let score = 0.2
  if (/deadline|urgent|overdue|blocked|debug|error|issue|conflict/.test(text)) score += 0.35
  if (/switch|multi|tab|meeting|notification|interrupt/.test(text)) score += 0.2
  if (/attention|focus|productivity|work|developer/.test(text)) score += 0.15
  score += Math.min(0.2, Number(record.confidence || record.meaningful_score || 0) * 0.2)
  return Math.min(1, score)
}

function buildReasons(records, score) {
  const reasons = [`${records.length} permitted item${records.length === 1 ? "" : "s"} reviewed.`]
  if (score >= 0.72) reasons.push("Several signals suggest interruption, urgency, or dense task switching.")
  else if (score >= 0.42) reasons.push("Some signals suggest active work or moderate task load.")
  else reasons.push("Signals look light or low-pressure.")
  return reasons
}

function buildSuggestions(level) {
  if (level === "high") return ["Prefer shorter flows.", "Avoid adding extra prompts unless necessary.", "Let the user defer non-urgent actions."]
  if (level === "medium") return ["Keep actions grouped.", "Show the next useful step clearly."]
  return ["Normal interaction is likely fine.", "Keep personalization subtle."]
}

function normalize(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : []
}
