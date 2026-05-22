const STYLES = new Set(["quick_brief", "key_points", "deep_dive", "simple_explainer"])

export function run(input = {}) {
  const article = normalizeArticle(input.article)
  const memory = normalizeReadingMemory(input.reading_memory)
  const signals = []
  const scores = { quick_brief: 0, key_points: 0, deep_dive: 0, simple_explainer: 0 }

  if (memory.preferred_summary_style !== "unknown") {
    scores[memory.preferred_summary_style] += 3
    signals.push(`Preferred summary style: ${memory.preferred_summary_style}`)
  }
  if (memory.average_read_time_seconds && memory.average_read_time_seconds < 45) {
    scores.quick_brief += 2
    scores.key_points += 1
    signals.push("Short average read time")
  }
  if (memory.average_scroll_depth && memory.average_scroll_depth < 45) {
    scores.simple_explainer += 2
    scores.key_points += 1
    signals.push("Low average scroll depth")
  }
  if (memory.finish_rate >= 0.72 && memory.average_read_time_seconds >= 180) {
    scores.deep_dive += 3
    signals.push("Often finishes longer reads")
  }
  if (memory.finish_rate && memory.finish_rate < 0.35) {
    scores.simple_explainer += 2
    scores.key_points += 1
    signals.push("Often drops early")
  }
  if (memory.preferred_article_length === "long") {
    scores.deep_dive += 2
    signals.push("Prefers long articles")
  }
  if (memory.preferred_article_length === "short") {
    scores.quick_brief += 2
    signals.push("Prefers short articles")
  }
  if (topicMatches(article.topic, memory.preferred_topics) || topicMatches(article.topic, memory.repeat_topics)) {
    scores.deep_dive += 1
    scores.key_points += 1
    signals.push(`Topic match: ${article.topic || "article topic"}`)
  }
  if (topicMatches(article.topic, memory.skipped_topics)) {
    scores.quick_brief += 2
    scores.simple_explainer += 1
    scores.deep_dive -= 2
    signals.push(`Usually skips this topic: ${article.topic}`)
  }
  if (!signals.length) {
    scores.key_points += 1
    signals.push("Not enough approved reading memory")
  }

  const summaryStyle = bestStyle(scores)
  return {
    summary_style: summaryStyle,
    overview: buildOverview(summaryStyle, article),
    why_this_style: buildWhy(summaryStyle, signals),
    follow_up_suggestions: buildFollowUps(summaryStyle, article),
    confidence: confidenceFor(signals, article, memory),
    signals_used: signals
  }
}

function normalizeArticle(article = {}) {
  const body = clean(article.body)
  const excerpt = clean(article.excerpt) || firstSentence(body)
  return {
    title: clean(article.title) || "Untitled article",
    body,
    excerpt,
    topic: clean(article.topic),
    source: clean(article.source),
    estimated_read_time_minutes: Number(article.estimated_read_time_minutes || 0)
  }
}

function normalizeReadingMemory(memory = {}) {
  const style = clean(memory.preferred_summary_style)
  return {
    average_read_time_seconds: Number(memory.average_read_time_seconds || 0),
    average_scroll_depth: Number(memory.average_scroll_depth || 0),
    finish_rate: Number(memory.finish_rate || 0),
    preferred_topics: array(memory.preferred_topics),
    skipped_topics: array(memory.skipped_topics),
    preferred_article_length: clean(memory.preferred_article_length) || "unknown",
    preferred_summary_style: STYLES.has(style) ? style : "unknown",
    repeat_topics: array(memory.repeat_topics)
  }
}

function bestStyle(scores) {
  return Object.entries(scores).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0][0]
}

function buildOverview(style, article) {
  const mainIdea = article.excerpt || firstSentence(article.body) || "This article needs more text before Memact can create a useful overview."
  const topic = article.topic ? ` on ${article.topic}` : ""
  if (style === "quick_brief") return `Quick brief: ${article.title}${topic}. Main idea: ${mainIdea}`
  if (style === "deep_dive") return `Deep dive: ${article.title}${topic}. Start with the main idea, then explain the background, tradeoffs, and what to watch next. Main idea: ${mainIdea}`
  if (style === "simple_explainer") return `Simple explainer: ${article.title}${topic}. In plain terms: ${mainIdea}`
  return `Key points: ${article.title}${topic}. 1) ${mainIdea} 2) Check the source and topic before reading deeper. 3) Look for what changed or what matters next.`
}

function buildWhy(style, signals) {
  if (signals.includes("Not enough approved reading memory")) {
    return `Used ${style} because there was not enough approved reading memory, so the feature fell back to the article itself.`
  }
  return `Used ${style} because ${signals.slice(0, 3).join(", ").toLowerCase()}.`
}

function buildFollowUps(style, article) {
  const topic = article.topic || "this topic"
  if (style === "deep_dive") return [`Compare this with another source on ${topic}.`, "Show background before recommendations."]
  if (style === "quick_brief") return ["Keep the summary short.", "Offer a deeper view only if the user expands it."]
  if (style === "simple_explainer") return [`Define key terms around ${topic}.`, "Start with why this matters."]
  return ["Show bullets first.", `Add a source trail for ${topic}.`]
}

function confidenceFor(signals, article, memory) {
  if (!article.excerpt && !article.body) return "low"
  const memorySignals = signals.filter((signal) => signal !== "Not enough approved reading memory").length
  if (memorySignals >= 3 && (memory.preferred_topics.length || memory.repeat_topics.length)) return "high"
  if (memorySignals >= 2) return "medium"
  return "low"
}

function topicMatches(topic, values = []) {
  const cleanTopic = clean(topic).toLowerCase()
  return Boolean(cleanTopic && values.some((value) => clean(value).toLowerCase() === cleanTopic))
}

function firstSentence(value) {
  return clean(value).split(/(?<=[.!?])\s+/)[0] || ""
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim()
}

function array(value) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : []
}
