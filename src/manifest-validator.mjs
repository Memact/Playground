export function validateFeatureManifest(manifest = {}) {
  const errors = []
  for (const key of ["schema_version", "feature_id", "name", "description", "required_scopes", "required_schema_types"]) {
    if (manifest[key] === undefined) errors.push(`${key} is required`)
  }
  if (manifest.schema_version && manifest.schema_version !== "memact.feature_manifest.v0") errors.push("schema_version must be memact.feature_manifest.v0")
  if (manifest.required_scopes && !Array.isArray(manifest.required_scopes)) errors.push("required_scopes must be an array")
  if (manifest.required_schema_types && !Array.isArray(manifest.required_schema_types)) errors.push("required_schema_types must be an array")
  return { ok: errors.length === 0, errors }
}
