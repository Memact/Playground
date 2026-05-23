# Memact Playground

Playground is where Memact features are built and tested.

Features are small apps that use permitted Memact memory and schema packets.

Current features:

- Adaptive Article Overview: helps article apps choose a better overview style from the article and approved reading memory.
- Discord Channel Personalizer: helps a consenting Discord user find useful server channels from approved Wiki memory and server channel context.

Playground is the open-source/default/community feature repo. Future private or
commercial features do not all have to live here.

Contributors add features as folders. Each feature needs a manifest and a small
runtime file. Keep features narrow, honest, and easy to review.

## Consent and Wiki

Every app-facing feature must sit behind consent and Wiki visibility:

- Consent appears before access so the user chooses what an app may use.
- Wiki appears after access so the user can see what the app can add, what Memact may create, and how to stop future access.
- Features should never require hidden data or a browser extension.

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
