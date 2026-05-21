export function run(input = {}) {
  const packets = Array.isArray(input.schema_packets) ? input.schema_packets : []
  const groups = {}
  for (const packet of packets) {
    const key = `${packet.category || "general"}:${packet.schema_type || "context"}`
    groups[key] ||= []
    groups[key].push(packet)
  }
  return { groups }
}
