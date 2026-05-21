# Memact Contributor Handoff

A playground where apps personalize based on user preferences and digital activity.

But this is done with user consent and data transparency.

This playground has 3 key players:

- Users, whose context and preferences are the main thing. This comes from selective digital activity the user has consented to share.
- Developers, who build personalization services inside Memact. These services use user context respectfully.
- Apps, which send additional user preferences, interests, or activity to these services so they can understand how to personalize their platform better.

Let us take shopping as an example.

Say a tech-savvy user is highly interested in high-end laptops and keeps browsing through an app called Flopkart. No harm intended, obviously.

Flopkart is connected to Memact. It wants to understand a few things:

- the user’s likely budget
- specs the user may care about
- favourite brands
- patterns from previous electronics purchases

So Flopkart can send approved shopping activity and its own detected signals to Memact. Then shopping-related services inside Memact can help.

These services can do two things:

- bring new useful information that the app does not already have
- refine or inspect what the app’s own algorithm has already guessed

If Flopkart already has a strong algorithm, Memact can act like an extra layer that checks, improves, or organizes the result.

If it is a smaller startup without a strong personalization system, it can rely more directly on Memact services.

Another example: news.

Say there is a news site called The Flop Times. It actually gets flopped.

People open articles, scroll a little, and leave. The team cannot clearly understand why.

The Flop Times connects to Memact. With user permission, it can send reading activity like article topics, saved articles, time spent, skipped topics, and repeated interests.

Memact services act like a lightweight analytics system. They help the site understand what kind of articles the user actually prefers:

- Maybe the user likes tech policy but skips celebrity news.  
- Maybe they read long explainers but leave short clickbait.  
- Maybe they keep opening AI-related articles but ignore sports.

The Flop Times can then use that memory to personalize the homepage, article recommendations, follow-up suggestions, or, if the tech supports it, even the article structure itself.

If the site already has a recommendation system, Memact can help refine it.

If it does not, Memact can give it a starting point.

So in this case, what are you?

You are the developers building those services.

## Parts

- Website: login, apps, API keys, consent, Help, Learn, Data Transparency.
- Access: checks if an app is allowed.
- Capture: records activity from apps, sites, or optional capture tools.
- Inference: understands activity.
- Schema: organizes it.
- Memory: stores it.
- Contracts: defines the data shapes used by the SDK, backend, and Studio features.
- SDK: helper code apps use to send activity and run Memact features.
- Studio: place for features. This is your workplace.

## Before building a Studio feature

- Read the Contracts repo first. It tells you what data should look like.
- Read the SDK repo next. It shows how apps send activity and run features.
- Your feature should fit into that flow.
- Do not invent your own random input/output format.
- Do not bypass the SDK/runtime just because it feels faster.

## Studio features

- Make small features like reading topics, shopping preferences, study maps, cognitive load, memory wiki, etc. Whatever is in your mind.

## Studio license and CLA

- Studio uses the Apache-2.0 license.
- Contributors keep their copyright.
- By contributing, they allow Memact to use, change, share, and include their contribution in Studio.
- Do not submit code you do not have the right to submit.

## Pull requests

- Keep PRs small.
- One PR should do one thing.
- For a Studio feature, include a feature folder, manifest, clear input, clear output, and a basic test or example.
- Before opening a PR, run checks, follow Contracts, use the SDK/runtime normally, and explain the change clearly.

## Rules

- Respect user privacy.
- Follow the SDK.
- Follow Contracts.
- Only use what the user allowed.