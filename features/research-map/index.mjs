export function run(input = {}) {
  const packets = Array.isArray(input.schema_packets) ? input.schema_packets : []
  const themes = [...new Set(packets.map((packet) => packet.schema_type || packet.category).filter(Boolean))]
  const sources = packets.flatMap((packet) => packet.sources || [])
  return { themes, sources, clusters: themes.map((theme) => ({ theme, packet_count: packets.filter((packet) => (packet.schema_type || packet.category) === theme).length })) }
}
