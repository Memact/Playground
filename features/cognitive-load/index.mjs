export function run(input = {}) {
  const packets = Array.isArray(input.schema_packets || input.events) ? (input.schema_packets || input.events) : []
  const count = packets.length
  return {
    level: count >= 8 ? "high" : count >= 3 ? "medium" : count > 0 ? "low" : "unknown",
    reasons: count ? [`${count} permitted context item${count === 1 ? "" : "s"}`] : ["not enough permitted context"],
    disclaimer: "This is an app-context signal, not a medical or clinical diagnosis."
  }
}
