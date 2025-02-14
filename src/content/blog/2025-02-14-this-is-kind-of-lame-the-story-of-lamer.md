---
title: '"This is kind of lame": The story of Lamer'
date: 2025-02-13T19:43:00.000Z
description: How things came to be
---
Lamer: https://github.com/randytsao24/lamer-wrapper

Having utilized LLMs for a number of months on the regular now, it was to my surprise when DeepSeek reared its head with R1 and changed the game around open source LLMs. Once I realized this was an option that was almost on par with the big name LLMs like with OpenAI's or Anthropic's but \*free\*, I just had to try it. Falling into subscription hell, a la the endless deluge of streaming sites, is not something I want to do with AI tools.

I quickly settled on [LM Studio](https://lmstudio.ai/) as my platform of choice, pleased with its ease-of-use and fast setup. It was absurdly easy to get going with a distilled version of DeepSeek R1 - a 14B model, which ran well with nearly 50 tokens/second on average. Unfortunately the 32B model chugged much harder on my RTX 4070.

There was something I noticed, though: LM Studio exposes its underlying server, and lets you play around with an API that utilizes basic OpenAI API specs to interact with active LLMs. Additionally, there's the [LM Studio SDK](https://github.com/lmstudio-ai/lmstudio.js) which provides an option for an implementation in TypeScript - perfect!

Using a basic `fastify` setup, I implemented a quick'n'dirty route that accepts a prompt and returns an LLM-generated response utilizing the LM Studio SDK. This is really just the beginning, and more features will come as I try to adapt this little wrapper to be used on other devices such as my phone or elsewhere. Stay tuned for updates!
