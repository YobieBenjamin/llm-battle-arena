# LLM Battle Arena

**Ask once. Compare Claude, OpenAI, and Gemini’s answers or generated code side by side—without switching between three websites.**

A free desktop app for Mac and Windows, made for curiosity and a little friendly competition. You do not need to code or know how GitHub works.

## Start here

### [1. Follow the beginner installation guide →](START-HERE.md)

It takes you from choosing the right download to seeing your first comparison. No GitHub account, programming tools, or terminal commands are needed.

### 2. Download for your computer

| Your computer | Ready-to-install download |
| --- | --- |
| **Windows with Intel or AMD** — most Windows PCs | **[Download Windows installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-x64-Setup.exe)** |
| **Mac with an Apple M-series chip** — M1, M2, M3, M4 or later | **[Download Apple Silicon Mac installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-arm64.dmg)** |
| **Mac with an Intel processor** | **[Download Intel Mac installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-x64.dmg)** |
| **Windows with ARM / Snapdragon** | **[Download Windows ARM installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-arm64-Setup.exe)** |

[Help me identify my computer](START-HERE.md#1-find-out-which-computer-you-have) · [Download page if a link fails](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest)

**New to GitHub?** It is just the website hosting this app. Ignore the file list above, the green **Code** button, and downloads named **Source code**. The links in this table are the actual installers. After installation, the app opens in its own window.

Your computer may show a security warning: Windows installers are unsigned, and Mac apps are not Apple-notarized. Read the [first-launch instructions](docs/USER_GUIDE.md#first-launch-security-prompts) before deciding whether to proceed. Work or school computers may block installation.

### 3. Try Sample before connecting anything

Open the app, leave **Sample · no setup** selected, and click **Show sample**. You will see three fixed, human-written examples. This works offline and costs nothing. It demonstrates the app; it does not ask real AI models a new question.

## Choose how you want to use it

| Mode | What you do | Accounts and costs |
| --- | --- | --- |
| **Sample** | Explore fixed example answers and the Y preview. | No account, key, internet connection, or charge. |
| **Website assist** | Open each AI website, send the question yourself, then paste its answer back. | No API keys. Each website sets its own login requirements, plans, and limits. |
| **Live API** | Enter your question once; the app requests answers automatically. | Your own API keys and internet access are required. Providers may charge for each request. |

**An API key is a private access code that lets the app use your provider account.** It is not your chat password. Paying for ChatGPT, Claude, or Gemini chat access does not automatically supply API access or credit. You can start with one provider; you do not have to set up all three at once.

[Get each API key and learn what usage costs](docs/API_KEYS_AND_COSTS.md) · [Use the websites without API keys](docs/USER_GUIDE.md#use-it-without-api-keys-website-assist)

## What can I do with it?

- Compare explanations, poems, ideas, and answers to the same question.
- Hide provider names in **Blind battle**, choose your favorite, and reveal the winner.
- Read formatted answers with headings, lists, tables, and scrollable code. **Copy code** copies one code block.
- Open the small **Y** badge to preview a file-like result, such as an HTML greeting card.
- Reopen the last 50 comparisons in **History**, or export a comparison to keep longer.

Try: **“Write a dramatic breakup letter from a toaster to a microwave. Keep it under 100 words.”**

Each new question starts fresh. This is not a continuing chat, and agreement between three models does not prove an answer is correct.

## Help, privacy, and updates

**[Complete user guide →](docs/USER_GUIDE.md)** — installation, first launch, API keys, costs, every main feature, troubleshooting, updates, and uninstalling.

Keys are encrypted on your computer. History contains plain-text questions and answers on that computer. Live questions go to the selected providers; the optional OpenRouter route also sends them through OpenRouter. The app has no analytics or hosted Arena server. [Read the privacy details](docs/USER_GUIDE.md#privacy-and-local-settings).

Updates are installed manually from the current download links above. [Update instructions](docs/USER_GUIDE.md#updates) · [Get help or report a problem](docs/USER_GUIDE.md#get-help-or-report-a-problem)

## For people working on the app

You can skip this section if you only want to use it.

[Developer guide](docs/DEVELOPMENT.md) · [Release notes](docs/RELEASE_NOTES.md) · [Maintenance](docs/MAINTENANCE.md) · [Latest audit response](docs/AUDIT-RESPONSE-2.4.9.md) · [Release verification](docs/RELEASE-VERIFICATION.md) · [Historical code — OLD (DO NOT USE)](archive/README.md)

Only the current installer release is public. Historical source is kept for reference, not installation.

Made by Yobie Benjamin. MIT licensed. Official home: **[YobieBenjamin/llm-battle-arena](https://github.com/YobieBenjamin/llm-battle-arena)**.
