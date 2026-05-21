export async function runFeature(feature, input = {}, context = {}) {
  if (!feature?.manifest?.feature_id || typeof feature.run !== "function") {
    throw new Error("Feature must include manifest and run function.")
  }
  const output = await feature.run(input, context)
  return {
    schema_version: "memact.feature_run_result.v0",
    feature_id: feature.manifest.feature_id,
    status: "ok",
    output: output || {},
    errors: [],
    generated_at: new Date().toISOString()
  }
}
