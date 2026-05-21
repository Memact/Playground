# Memact Studio

Studio is where Memact features are built and tested.

Features are small apps that use permitted Memact memory and schema packets.

Examples:

- Memory Wiki: turns schema packets into readable sections, highlights, and source trails.
- Cognitive Load: turns permitted activity into a workload signal an app can adapt to.
- Research Map: turns research packets into themes, source trails, open questions, and next steps.

Studio is the open-source/default/community feature repo. Future private or
commercial features do not all have to live here.

Contributors add features as folders. Each feature needs a manifest and a small
runtime file. Keep features narrow, honest, and easy to review.

## Runtime

- `loadFeature(path)`
- `runFeature(feature, input, runtimeContext)`
- `validateFeatureManifest(manifest)`
- `listLocalFeatures(featuresDir)`
- `createFeatureRegistry()`

## Feature Rules

- Declare required scopes.
- Declare expected schema types.
- Do not request undeclared raw data.
- Do not call external APIs unless the manifest says so.
- Return uncertainty when support is weak.
- Do not make medical, legal, financial, or manipulative claims.

## Development

```powershell
npm install
npm run check
```
