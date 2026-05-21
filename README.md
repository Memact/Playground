# Memact Studio

Studio is where Memact features are built and tested.

Features are tools that use Memact context.

Examples:

- User Context Wiki
- Cognitive Load
- Research Map

Studio is the open-source/default/community feature repo. Future private or
commercial features do not all have to live here.

## Runtime

- `loadFeature(path)`
- `runFeature(feature, input, context)`
- `validateFeatureManifest(manifest)`
- `listLocalFeatures(featuresDir)`
- `createFeatureRegistry()`

## Development

```powershell
npm install
npm run check
```
