# Start here: download, open, play

**Download status:** The new release is being verified. Older releases are archived and are not installation options. Use only the current release once it is published on the [Downloads page](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest).



**You do not need to know GitHub. You do not need a GitHub account. You do not need to install anything for programming.**

This is a small app that puts three AI answers next to each other. The app is free. You can try the sample immediately; real AI answers use your own provider API keys and may cost money.

## Step 1 — Pick your computer and click its download

| If you have… | Click this link |
| --- | --- |
| A Windows laptop with an Intel or AMD processor (most Windows PCs) | **[Download for Windows](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-x64-Setup.exe)** |
| A Mac with an Apple M-series chip, such as M1, M2, M3, or M4 | **[Download for Apple Silicon Mac](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-arm64.dmg)** |
| An Intel Mac | **[Download for Intel Mac](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-x64.dmg)** |
| A Windows laptop with an ARM/Snapdragon processor | **[Download for Windows ARM](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-arm64-Setup.exe)** |

**Not sure which Mac?** Click the Apple logo at the top left → About This Mac. If it says **Chip: Apple…**, choose Apple Silicon. If it says **Processor: Intel…**, choose Intel.

**Not sure which Windows?** Open Settings → System → About. Under **System type**, x64 means the first Windows download; ARM means the Windows ARM download.

Your browser saves the file, normally in your **Downloads** folder. Wait for the download to finish. If your browser asks where to save it, Downloads is fine.

If you see a page with **Assets**, click the installer filename there. **Do not use “Source code” or the green “Code” button.** Those are for people who want to work on the app's code. You just need the installer linked above.

## Step 2 — Install it

### Windows

1. Open Downloads, or your browser's downloads list.
2. Double-click the file ending in **Setup.exe**.
3. The installer installs the app for you and opens it. You do not need to choose folders.
4. Use the **LLM Battle Arena** shortcut on your desktop or in Start next time.

### Mac

1. Open Downloads and double-click the downloaded **.dmg** file.
2. A window opens showing the app and Applications. **Drag LLM Battle Arena onto Applications.**
3. Open Finder → Applications → **LLM Battle Arena**.
4. Once it opens, eject the disk image in Finder. Next time, open the copy in Applications.

### If your computer shows a security warning

Windows downloads are unsigned. Mac downloads are ad-hoc signed but not Apple-notarized, so either system may block or ask you to approve the first launch. Only proceed if you trust the project and downloaded from the links above. [Follow the first-launch instructions here](docs/USER_GUIDE.md#first-launch-security-prompts). Do not switch off your computer's security protections globally. A work or school laptop may need its administrator's approval.

## Step 3 — Try the free sample

1. Leave **Sample · no setup** selected near the top.
2. Click **Show sample**.
3. Read the three sample answers. Scroll inside each card to see more.
4. Hover over the small **Y** on the Gemini sample to see its example artifact. Click Y to keep it open; click again to hide it.

No API keys, signup, internet, or charge is needed for this sample. These are written examples, not real replies from AI models. This is a good way to see what the app looks like before connecting anything.

## Step 4 — Add keys for real AI answers

An **API key** is a private access code from an AI provider that lets this app ask questions on your behalf. It is not your website password. A paid chat subscription is separate from API access.

1. Click **Connections** at the top right.
2. Click **Get API key** beside Claude, OpenAI, or Gemini. Your browser opens that provider's official website.
3. Sign in there and create an API key. The provider may ask you to set up billing. Check its prices and limits before proceeding.
4. Copy that key and paste it into the matching field in LLM Battle Arena.
5. Repeat for the other providers. You can start with just one if you prefer.
6. Click **Check key & load models** and select a model from its menu.
7. Click **Save connections**.

The app saves keys encrypted on your computer. Never post keys in a bug report or send them to someone else.

If you have only one or two keys, uncheck **Include** on the cards you have not connected. For three direct answers, connect all three providers; OpenRouter is an optional one-key alternative.

## Step 5 — Ask something fun

1. Choose **Live API · automatic** if it is not already selected.
2. Click in the question box and type: **“Write a dramatic breakup letter from a toaster to a microwave.”**
3. Click **Compare**.
4. Watch the answers arrive. Each card scrolls separately.
5. Decide which you like best. Try another question!

Tiny **Q** and **A** counters mean question tokens and estimated visible-answer tokens. **R** shows reported reasoning, or **—** when unknown. **~** means an estimate. Tokens are pieces of text, not words or prices. [More about counters](docs/USER_GUIDE.md#what-do-the-tiny-token-counters-mean).

**Copy answer** copies one answer. **Export Markdown** lets you choose where to save the whole comparison. The app automatically keeps the last 50 comparisons. Click **History**, then click a question to reopen it. Use **Delete** to remove one, or **Delete all history** and confirm to clear the list. History contains plain-text prompts and answers on your computer. Export comparisons you want to keep permanently. **How to play** opens a reminder inside the app.

## What is the little Y badge?

An artifact is a file-like result, such as a small HTML page, SVG drawing, JSON data, or source code. When the answer includes a complete, labeled code block, the app shows a **Y** badge on that card.

1. Hover over **Y** to peek at the file.
2. Click **Y** to keep the preview open.
3. Click the same **Y** again to hide it. You can also click its close button.
4. Use the preview's file tabs if there are several files. **Save file** asks where to save one.

HTML and SVG previews are static: scripts and internet requests do not run. Code, CSV, and Markdown display as text. Private artifacts stored on a provider's website are not automatically imported. Ask the model for a complete file in a labeled code block if you want the Y badge to appear.

## No keys? Use the websites manually

Choose **Website assist**, enter your question, and click **Prepare comparison**. On each card, **Open** copies your question and opens that AI's official website. Paste and send the question there yourself, copy its answer, and paste it back into the Arena card. Website signup and free limits vary. No passwords are entered into the Arena.

## If something goes wrong

- **“Add an API key”**: open Connections and save a key, or uncheck Include for that provider.
- **“API key rejected”**: replace the key with a working one from that provider.
- **“Rate limit or billing quota reached”**: check credits, billing, and limits on the provider's website.
- **“Model unavailable”**: the model may no longer be available to your account. See the full guide for changing its ID.
- **Only one card fails**: the others can still work. Read that card's error and use Retry after fixing it.

[Full user guide and troubleshooting](docs/USER_GUIDE.md) · [Download page](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest) · [Report a problem](https://github.com/YobieBenjamin/llm-battle-arena/issues)

If you report a problem, describe what you clicked and what happened. Include your Mac/Windows version and the app release you downloaded. Do not include keys or private questions. GitHub asks you to sign in to post an issue; you do not need an account just to download and use the app.

## New ways to play

- **Blind battle:** in Live API mode, include two or three cards, check Blind battle, and compare. Pick a winner after all answers finish to reveal the providers and add a local win.
- **Model menus:** in Connections, use Check key & load models, then choose a model. Save checks keys without generating answers.
- **One key:** choose OpenRouter in Connections. It routes all three answers through a third party, with its own billing and privacy policies. Read the [step-by-step setup](docs/USER_GUIDE.md#easier-setup-model-menus-and-one-key-openrouter).
- **Update notices:** optionally enable Check GitHub for updates on launch in Connections. Downloading and installing are still your choice.
