# Discord Channel Personalizer

This Playground feature helps a Discord server bot suggest channels a consenting Memact user may care about.

It is deterministic in v0. It does not call external APIs, read private Discord messages, or require the browser extension.

## Input

- `user_memory`: approved interests, preferred topics, muted topics, communication style, and activity preferences
- `server`: server name and channel list
- `recent_server_activity`: optional public/allowed channel activity summaries

## Output

- recommended channels
- channels to avoid or mute
- personalization notes
- setup steps for the user
- confidence
- signals used

The feature should only be used after a Discord user connects Memact and allows the bot/app to use the relevant memory.
