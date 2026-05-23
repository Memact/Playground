const DEFAULT_LIMIT = 5

export async function run(input = {}) {
  const userMemory = normalizeMemory(input.user_memory || input.memory || {})
  const channels = normalizeChannels(input.server?.channels || input.channels || [])
  const activity = normalizeActivity(input.recent_server_activity || [])

  if (!channels.length) {
    return {
      recommended_channels: [],
      channels_to_avoid: [],
      personalization_notes: ["No server channels were provided."],
      setup_steps: defaultSetupSteps(),
      confidence: "low",
      signals_used: []
    }
  }

  const scored = channels.map((channel) => scoreChannel(channel, userMemory, activity))
    .sort((a, b) => b.score - a.score)

  const recommended = scored
    .filter((item) => item.score > 0)
    .slice(0, Number(input.limit || DEFAULT_LIMIT))
    .map((item) => ({
      channel_id: item.channel.id,
      name: item.channel.name,
      reason: item.reason,
      confidence: item.score >= 5 ? "high" : item.score >= 3 ? "medium" : "low"
    }))

  const avoid = channels
    .filter((channel) => userMemory.muted_topics.some((topic) => includesTerm(channelText(channel), topic)))
    .map((channel) => ({ channel_id: channel.id, name: channel.name, reason: "Matches a muted or skipped topic." }))

  return {
    recommended_channels: recommended,
    channels_to_avoid: avoid,
    personalization_notes: buildNotes(recommended, userMemory),
    setup_steps: defaultSetupSteps(),
    confidence: recommended.some((item) => item.confidence === "high") ? "high" : recommended.length ? "medium" : "low",
    signals_used: buildSignals(userMemory, activity)
  }
}

function scoreChannel(channel, memory, activity) {
  const text = channelText(channel)
  let score = 0
  const reasons = []

  for (const topic of memory.interests) {
    if (includesTerm(text, topic)) {
      score += 3
      reasons.push(`matches ${topic}`)
    }
  }
  for (const topic of memory.preferred_topics) {
    if (includesTerm(text, topic)) {
      score += 2
      reasons.push(`preferred topic: ${topic}`)
    }
  }
  for (const topic of memory.muted_topics) {
    if (includesTerm(text, topic)) {
      score -= 4
      reasons.push(`muted topic: ${topic}`)
    }
  }
  const channelActivity = activity.find((item) => item.channel_id && String(item.channel_id) === String(channel.id))
  if (channelActivity?.summary && memory.interests.some((topic) => includesTerm(channelActivity.summary, topic))) {
    score += 1
    reasons.push("recent channel activity matches approved memory")
  }

  return {
    channel,
    score,
    reason: reasons.length ? reasons.join("; ") : "No strong approved memory match."
  }
}

function normalizeMemory(memory) {
  return {
    interests: normalizeList(memory.interests || memory.preferred_interests || memory.topics),
    preferred_topics: normalizeList(memory.preferred_topics || memory.repeat_topics),
    muted_topics: normalizeList(memory.muted_topics || memory.skipped_topics || memory.avoid_topics),
    communication_style: String(memory.communication_style || memory.preferred_communication_style || "").trim()
  }
}

function normalizeChannels(channels) {
  return channels
    .map((channel, index) => ({
      id: String(channel.id || channel.channel_id || `channel_${index}`),
      name: String(channel.name || channel.title || "").trim(),
      topic: String(channel.topic || channel.description || "").trim(),
      tags: normalizeList(channel.tags || channel.categories)
    }))
    .filter((channel) => channel.name)
}

function normalizeActivity(items) {
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    channel_id: item.channel_id ? String(item.channel_id) : "",
    summary: String(item.summary || item.description || "").trim()
  }))
}

function channelText(channel) {
  return [channel.name, channel.topic, ...channel.tags].join(" ").toLowerCase()
}

function includesTerm(text, term) {
  const clean = String(term || "").toLowerCase().trim()
  return clean.length > 1 && text.includes(clean)
}

function normalizeList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
}

function buildNotes(recommended, memory) {
  if (!recommended.length) return ["No channel recommendation was strong enough from the approved memory provided."]
  const style = memory.communication_style ? `Preferred communication style: ${memory.communication_style}.` : ""
  return ["Use these as suggestions, not automatic channel changes.", style].filter(Boolean)
}

function buildSignals(memory, activity) {
  return [
    memory.interests.length ? `interests: ${memory.interests.join(", ")}` : "",
    memory.preferred_topics.length ? `preferred topics: ${memory.preferred_topics.join(", ")}` : "",
    memory.muted_topics.length ? `muted topics: ${memory.muted_topics.join(", ")}` : "",
    activity.length ? "recent allowed server activity summaries" : ""
  ].filter(Boolean)
}

function defaultSetupSteps() {
  return [
    "User connects Memact and consents to the Discord app using selected Wiki memory.",
    "Server bot sends allowed channel names/topics, not private messages by default.",
    "Feature returns channel suggestions the bot can show before applying anything."
  ]
}
