# LLM Battle Arena

**One question. Three answers. Have fun seeing where Claude, OpenAI, and Gemini agree—or completely disagree.**

A small app for Mac and Windows. No terminal, Python, Node.js, server, or app account needed. Download it, open it, and try the free offline sample. Connect your own API keys when you want real answers.

## Download and play

| Your laptop | Download |
| --- | --- |
| **Windows — most Intel/AMD PCs** | **[Download Windows installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-x64-Setup.exe)** |
| **Mac — Apple Silicon (M1, M2, M3, M4, or newer)** | **[Download for Apple Silicon Mac](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-arm64.dmg)** |
| **Mac — Intel** | **[Download for Intel Mac](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-x64.dmg)** |
| Windows — ARM / Snapdragon | [Download Windows ARM installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-arm64-Setup.exe) |

[All downloads and version history](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest) · [Step-by-step user guide](docs/USER_GUIDE.md) · [Report a problem](https://github.com/YobieBenjamin/llm-battle-arena/issues)

These are unsigned community builds. Your computer may ask you to approve the first launch. See [first-launch help](docs/USER_GUIDE.md#first-launch-security-prompts). Work/school laptop policies may block unsigned apps. This is for modern desktop Mac and Windows systems; it is not an iPhone, iPad, Chromebook, or browser extension app.

## 1. Install

**Windows:** download the installer above and double-click it. It installs for your user and opens the app. A shortcut appears on your desktop and in Start. No install wizard or administrator account is normally needed.

**Mac:** download the matching `.dmg`, double-click it, and drag **LLM Battle Arena** into **Applications**. Open it from Applications. To check your Mac type, choose Apple menu → About This Mac: “Chip” means Apple Silicon; “Processor: Intel” means Intel.

## 2. Try it immediately

1. Leave **Sample · no setup** selected.
2. Click **Show sample**.
3. Read the three example cards. No keys, signup, internet, or API charges are involved.

Samples are fixed, human-written examples, not actual model answers. For your own questions, use the next step.

## 3. Connect your models

1. Click **Connections** in the top right.
2. Paste your **Claude API key**, **OpenAI API key**, and **Gemini API key** into their matching fields. The **Get API key** buttons open each provider's official site.
3. Leave the model IDs as they are to start. You can change them later.
4. Click **Save connections**. The app switches to **Live API · automatic** after the first key is saved.

You can start with one provider and uncheck **Include** on the others. For three real answers, connect all three.

**API access is separate from ChatGPT/Claude/Gemini chat subscriptions.** Providers may require billing and may charge for live requests. Gemini has free API access for certain models and quotas; check your account. The app itself is free. Never paste keys into GitHub issues or share them in screenshots.

## 4. Ask a question

1. Type a prompt, such as: **“Write a dramatic breakup letter from a toaster to a microwave.”**
2. Click **Compare**. The same prompt goes to every included provider at once.
3. Watch each answer arrive in its own card.
4. Decide which one wins. There is no automatic judge—this is a curiosity toy.

Try **“Explain Wi-Fi to a pirate,” “Invent the world's worst superhero,”** or **“What is a belief you think people should question?”**

- **Stop** preserves partial answers. **Retry** sends just that card's original prompt again and may incur another API charge.
- **Copy answer** copies one response. **Export Markdown** saves a readable comparison; **JSON** saves structured data.
- **Ctrl+Enter** (Windows) or **Cmd+Enter** (Mac) starts a comparison.
- Each question starts fresh. There is no chat memory or automatic history. Export anything you want to keep before closing.

![The desktop arena, showing illustrative sample answers](desktop-preview.png)

## No keys? You can still play

Choose **Website assist · no API keys**, type a question, and click **Prepare comparison**. On each card, click **Open**: the app copies your prompt and opens that provider's official website. Paste and send it there, then paste its answer back into the card. Repeat for the others.

This mode is manual. Each website controls signup, models, and free limits; no universal “three free questions” is promised. The app never asks for website passwords.

## Questions, fixes, and more detail

- [Full user guide: installation, keys, updates, privacy, uninstalling, troubleshooting](docs/USER_GUIDE.md)
- [Developer guide: source, architecture, tests, packaging, releases](docs/DEVELOPMENT.md)
- [Release notes](docs/RELEASE_NOTES.md)

Your keys are encrypted on your computer. Live prompts go to the selected providers; the app has no hosted server or analytics. Answers display as plain text, including Markdown source. Models can be wrong; don't treat three similar answers as proof.

A fun little project by Yobie Benjamin. MIT licensed. This desktop version continues the original [YobieBen/llm-battle-arena](https://github.com/YobieBen/llm-battle-arena) project.
