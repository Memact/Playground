export function createFeatureRegistry(features = []) {
  return features.map((feature) => ({
    feature_id: feature.manifest.feature_id,
    name: feature.manifest.name,
    description: feature.manifest.description,
    required_scopes: feature.manifest.required_scopes,
    required_schema_types: feature.manifest.required_schema_types
  }))
}
