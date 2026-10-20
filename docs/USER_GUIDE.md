# LLM Battle Arena: the complete beginner guide

**Ask once. Compare answers or generated code in one place.**

Instead of opening three AI websites and repeating your question, use **Live API** to send it to Claude, OpenAI, and Gemini together. Each answer appears in its own card. You choose which answer is most useful; the app does not choose a winner for you.

You do not need to code or understand GitHub. The one-time setup is installing the app and connecting the AI accounts you want to use.

[Install the app step by step](../START-HERE.md) · [Get API keys and understand costs](API_KEYS_AND_COSTS.md) · [Current downloads](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest) · [Home](../README.md)

## Find what you need

- [What kind of app is this? Why Electron?](#what-kind-of-app-is-this-why-electron)
- [Install on Mac or Windows](#install-on-mac-or-windows)
- [Handle first-launch messages](#first-launch-security-prompts)
- [Try the free sample](#your-first-minute-try-sample)
- [Understand the unfamiliar words](#a-few-words-you-will-see)
- [Connect API keys](#connect-your-api-keys)
- [Understand costs](#what-does-it-cost)
- [Ask your first real question](#run-a-real-comparison)
- [Use the buttons and read code](#what-the-buttons-do)
- [Use the websites without keys](#use-it-without-api-keys-website-assist)
- [Play a blind battle](#blind-battles-and-local-wins)
- [Preview files with Y](#preview-artifacts-with-the-y-badge)
- [Keep answers in History or export them](#keep-or-share-a-comparison)
- [Update the app](#updates)
- [Troubleshoot a problem](#troubleshooting)
- [Privacy and uninstalling](#privacy-and-local-settings)

## What kind of app is this? Why Electron?

**Arena is a stand-alone desktop app built with Electron.** Electron is the toolkit used to build it; “stand-alone” describes how you install and open it. Both descriptions apply. You launch Arena from Applications on Mac or Start on Windows, and it has its own window.

Electron lets developers build desktop screens using the same technologies used for websites. It includes **Chromium**, the engine that draws the screen, and **Node.js**, which supports desktop operations behind the scenes. Everything needed is included in Arena’s installer. You do not install Electron, Chrome, Node.js, or programming tools separately. [Electron’s official introduction](https://www.electronjs.org/docs/latest/).

### Why we chose it for Arena

- **One app design for Mac and Windows.** We can maintain the comparison interface together instead of building two separate interfaces. That makes a small hobby project easier to maintain.
- **Desktop conveniences.** Arena can use your computer’s credential protection to encrypt saved API keys, keep comparison history in its app-data folder, and offer familiar Save dialogs for answers and generated files.
- **A ready-to-open package.** Friends download an installer and open the app. They do not need to start a local server, run commands, or configure a development environment.
- **Consistent display.** Bundling the screen engine helps the answer cards, Markdown, and code blocks behave consistently across the supported computers.

These are reasons for this project’s design, not a claim that Electron is the only way to build those features.

### Why not just a website in a browser tab?

A website could provide a comparison interface too. Browsers deliberately limit access to desktop files and credential storage. Matching Arena’s current setup would need different storage and connection arrangements, potentially including a server or a local helper. We chose a desktop package so Arena can handle provider requests and local storage on your computer without an Arena-operated server.

You can close your regular browser and keep using Live API in Arena. Your browser is still used for creating provider accounts, getting keys, opening links, and Website assist. **Live answers still need internet access:** Electron does not install Claude, OpenAI’s models, or Gemini on your laptop. Sample and saved History can be read offline.

### What is the tradeoff?

Bundling a screen engine makes the download larger and can use more memory than a small app written specifically for one operating system. A browser-only service would avoid installing that engine with Arena. Electron also needs maintenance and security updates, so install current Arena releases. Electron itself is not a guarantee of safety; the app’s design and maintenance matter. [Electron’s security guidance](https://www.electronjs.org/docs/latest/tutorial/security/).

You do not need to learn any of this technology to use Arena. Install it, try Sample, and connect your keys when you are ready.

## Install on Mac or Windows

Use the **[numbered installation walkthrough](../START-HERE.md)**. It explains how to identify your computer, pick the correct file, find it in Downloads, install it, and recognize a successful first launch.

You do not need a GitHub account. On a release page, **Assets** means downloadable files. Choose the Windows **Setup.exe** or Mac **.dmg** for your processor. Ignore **Source code**, **Code**, **Fork**, and programmer files.

Use a supported, updated desktop operating system. The downloads are for Mac and Windows x64/ARM64 computers, not phones, tablets, Chromebooks, 32-bit Windows, or a browser extension. The app runs in its own window after installation. Downloading, account setup, and Live API need internet access; the installed Sample works offline.

## First-launch security prompts

These hobby-project installers do not have a verified commercial publisher identity: Windows builds are unsigned; Mac builds have an ad-hoc bundle signature but are not Apple-notarized. Your computer may warn, ask for approval, or block them. A warning is not proof the file is safe. Use only the [official current release](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest) and decide whether you trust it.

### Mac: unverified developer or cannot verify the app

1. First try opening the installed copy in **Finder → Applications**.
2. If macOS blocks it, open **Apple menu → System Settings → Privacy & Security**.
3. Look for a message about **LLM Battle Arena**. If an **Open Anyway** option is offered, review it and proceed only if you trust the download.
4. Follow any macOS confirmation prompts, then open the app again.

The wording and available options depend on your macOS version and policies. If it says **damaged** or offers no approval option, do not assume these steps will work: download the current version again and report the exact message. Do not disable Gatekeeper or run security-bypass commands. [Apple’s first-launch guidance](https://support.apple.com/en-us/102445).

### Mac: Keychain prompt or startup appears stuck

Keychain is macOS’s credential protection. Arena may wait while macOS asks you about access, including after an update. Look for that system prompt and handle it directly on your Mac. Do not type your Mac password into an Arena field or send it to someone in a chat. If you decline or the key cannot be unlocked, you may need to resolve credential access before using saved API keys.

### Windows: Windows protected your PC

If SmartScreen offers **More info**, review the file and source. A **Run anyway** option may be available if you choose to trust it. Some computers will not offer that option. Smart App Control or work/school policy can block an app separately; do not turn off those protections globally. On a managed computer, ask its administrator. [Microsoft’s SmartScreen explanation](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation) and [Smart App Control guidance](https://support.microsoft.com/en-us/windows/security/threat-malware-protection/smart-app-control-frequently-asked-questions).

## Your first minute: try Sample

1. Open Arena and find **Compare with** at the top.
2. Choose **Sample · no setup**.
3. Click **Show sample**.
4. Read the three answers. Scroll inside each card to see more.
5. Try the gold **Y** on the Gemini card: hover to peek, click to keep the preview open, click again to hide it.

These are fixed, human-written examples. They do not contact AI providers or create charges. The sample question cannot be edited. Switch modes when you want to ask your own question. **How to play** opens a short reminder inside the app.

## A few words you will see

| Word | Plain-English meaning |
| --- | --- |
| **LLM / AI model** | The software that writes an answer. A provider can offer several versions, called models. |
| **Provider** | The company supplying the model: Anthropic supplies Claude, OpenAI supplies the models on the OpenAI card, and Google supplies Gemini. |
| **Prompt** | The question or instructions you type. |
| **API** | A way for one app to ask another service to do something. Arena uses it to ask the providers for answers without you visiting each chat website. |
| **API key** | A private access code that lets Arena use your provider account. It is not your website password. |
| **API call / request** | One request sent to a provider. A three-provider comparison normally makes three requests. |
| **Token** | A small piece of text used to measure input and generated output. It can be a word, part of a word, or punctuation. It is not a dollar amount. |
| **Streaming** | The answer appears bit by bit while the model is writing it. |
| **Artifact** | A file-like result in an answer, such as a small webpage, drawing, or code file. |

You do not need to calculate tokens to use Arena. [Read the simple cost explanation](API_KEYS_AND_COSTS.md#api-calls-and-tokens-in-plain-english) before enabling live requests. The explanations and setup instructions draw on [OpenAI’s documentation](https://developers.openai.com/api/docs/quickstart), [Anthropic’s key guide](https://platform.claude.com/docs/en/get-api-key), and [Google’s Gemini key guide](https://ai.google.dev/gemini-api/docs/api-key).

## Connect your API keys

**[Follow the complete API-key walkthrough →](API_KEYS_AND_COSTS.md)**

It has separate instructions for [Claude](API_KEYS_AND_COSTS.md#get-a-claude-key), [OpenAI](API_KEYS_AND_COSTS.md#get-an-openai-key), and [Gemini](API_KEYS_AND_COSTS.md#get-a-gemini-key), including copying, pasting, checking, selecting a model, and saving.

The setup happens once:

1. Click **Connections** and leave **Direct provider keys** selected.
2. In the provider’s section, click **Get API key** to open its official site.
3. Create a key there and check its API billing/allowance. A chat subscription is not the same as API access.
4. Return to Arena and paste into that provider’s **API key** field.
5. Click **Check key & load models**, then select an available text model whose pricing suits you.
6. Repeat for any other providers you want. Click **Save connections** and wait for it to finish.
7. In the main window, uncheck **Include** for any provider you have not connected.

Start with one provider if you prefer. To get all three automatic direct answers, connect all three. The key stays saved between launches. A blank field labeled **Saved · leave blank to keep** is normal: the app does not display the secret again.

A successful key check lists models; it does not guarantee billing credit or that every listed model can generate an answer through Arena. Save does not recheck unchanged saved keys. Use **Check key & load models** to deliberately check one again.

## What does it cost?

The app is free. **Sample is free. Live API usage is billed or counted against an allowance by the selected providers.** Website assist uses the websites’ own plans and limits.

For text APIs, costs commonly depend on the model and the tokens it reads and generates; reasoning can also be billed. An API call is the request, not a separate type of token or a universal extra fee. Three selected providers can mean three separately billed requests. Long questions, long code answers, and Retry can increase usage. Stop does not refund work already processed.

Arena has no dollar spending cap or built-in price calculator. **Output limit** is a token limit per included provider, not a money limit. The token counters are not an invoice. Check the provider’s usage page and available spending controls; do not assume an alert is a hard cap. [Costs and sensible first-test steps](API_KEYS_AND_COSTS.md#before-you-connect-what-is-free-and-what-costs-money).

Current official prices: [OpenAI](https://developers.openai.com/api/docs/pricing) · [Anthropic/Claude](https://platform.claude.com/docs/en/about-claude/pricing) · [Google/Gemini](https://ai.google.dev/gemini-api/docs/pricing). Free allowances vary; no free access to all three is promised.

## Run a real comparison

1. Choose **Live API · automatic** under Compare with.
2. Check **Include** on the connected providers you want to compare.
3. Type a short question, for example: **“Explain how Wi-Fi works in three simple sentences.”**
4. Leave **Output limit** at its default while learning, or choose a smaller limit for shorter responses. A low limit can cut off an answer or leave a reasoning model without visible output.
5. Click **Compare**.
6. Watch the answers appear in separate cards. Each provider works independently; one failure does not cancel the others.
7. Scroll inside each card and compare clarity, usefulness, or accuracy. **Copy answer** copies a whole response.

**Success looks like:** new answers appear for your own question. They are not labeled illustrative samples. If a card shows an error, see [troubleshooting](#troubleshooting) before retrying.

Every included provider gets the same prompt. Each comparison starts fresh: a new question does not include earlier answers as chat context. If you want the model to revise something, include the relevant text and instructions in your new prompt. Previous questions in History are saved records, not an ongoing conversation sent to the models.

The OpenAI card uses API models; it is not a remote copy of the ChatGPT website. Model choices, website features, and answers can differ. Agreement between models is not proof of correctness.

## What the buttons do

| Control | What happens |
| --- | --- |
| **Compare** | Sends the question to included providers in Live API mode. |
| **Include** | Chooses which provider participates in the next comparison. Uncheck providers you have not connected. |
| **Output limit** | Sets the maximum requested output budget per provider: 2,048, 4,096, or 8,192 tokens. Higher limits can allow longer answers and more usage. |
| **Stop** | Cancels active requests and keeps text already received. |
| **Retry** | Sends only that card’s original question again. It may incur another charge. |
| **Copy answer** | Copies the complete original answer, including Markdown formatting marks. |
| **Copy code** | Copies just one code block, preserving indentation and tabs. |
| **History** | Opens saved comparisons on this computer. Reopening does not call a provider. |
| **Export Markdown** | Saves the comparison as a readable text file ending in `.md`. |
| **JSON** | Saves structured data, mainly useful for technical users and other software. You can ignore this button. |
| **How to play** | Opens a short help reminder. |
| **Connections** | Sets up keys, model choices, connection route, and optional update checks. |

**Keyboard shortcuts:** Ctrl+Enter on Windows or Command+Enter on Mac starts a comparison. This shortcut does not submit or clear Website assist paste boxes. Use Tab to move between controls and Enter/Space to activate a focused button.

## Reading and copying code

Answers format headings, lists, tables, and code when they finish. While an answer is arriving, it may show plain text and formatting marks; that is normal.

Code blocks have their own **Copy code** button. You do not need to select the code manually. Long lines scroll horizontally rather than wrapping and changing how indentation looks. Use the visible scrollbar below a wide code block, swipe sideways, or Tab to the code region and use arrow keys. Wide tables also scroll sideways.

The code font is 12 px and tabs display four columns wide. The original text is preserved. **Copy answer** and exports keep the original Markdown, so they may contain marks such as `#`, `**`, and code fences. Markdown is simply text with formatting instructions.

For larger text, use **View → Zoom In**. On Windows press Alt to reveal the menu if needed. **View → Actual Size** resets zoom. You can also use Ctrl/Command with + or −, and Ctrl/Command+0 to reset. At high zoom the cards may stack vertically; scroll the window to reach them.

Generated code is not automatically tested or run by Arena. Read it before using it; a plausible-looking answer can still be wrong.

## What do the tiny token counters mean?

| Label | Meaning |
| --- | --- |
| **Q** | Question/input token count from the provider when available, otherwise an estimate. |
| **A ~** | Approximate visible-answer size. The app uses the same rough estimator for every provider so the displayed sizes can be compared. |
| **R** | Separately reported reasoning tokens. **—** means unknown, not zero. |
| **~** | Estimated, not an exact count from the provider. |

A token is a piece of text, not necessarily a word. Estimates can be especially inaccurate for code, emoji, and languages other than English. The app uses roughly four Unicode characters per estimated token. These counters are not prices and do not include every possible billing detail.

Hover over a counter for raw provider usage details. Exports include those details too. Providers report output/reasoning differently, so a raw total may differ from visible answer size. The question-box counter describes your current draft; completed cards keep the counters for the question that produced them.

## Use it without API keys: Website assist

This alternative uses copying and pasting. **It does not remove the need to visit the websites.** Choose Live API if you want Arena to request all answers automatically.

1. Choose **Website assist · no API keys**.
2. Type your question and choose providers with **Include**.
3. Click **Prepare comparison**.
4. On a card, click **Open Claude**, **Open OpenAI**, or **Open Gemini**. Arena copies your question and opens the official website in your browser.
5. Sign in there if required. Click that site’s question box, paste, and submit it yourself.
6. Copy its answer. Return to Arena and paste into the matching provider’s answer box.
7. Repeat for the other providers.
8. Click **Read formatted** on a pasted card for easier reading. **Edit pasted answer** returns to its editable box.
9. Compare, copy, or export the answers in Arena.

Each website controls its free limits, plans, and login requirements. Arena does not promise “three free questions” or collect website passwords. Changing the prompt or included providers clears the pasted comparison to avoid mixing different questions; export first if you want to keep it.

## Blind battles and local wins

1. Choose Live API and include at least two connected providers.
2. Check **Blind battle**, type your question, and click Compare.
3. Read **Answer A**, **Answer B**, and **Answer C**. Provider identities are shuffled and hidden.
4. After every included answer finishes successfully, click **Pick winner** on your favorite.
5. The providers are revealed and a local win tally is updated. A comparison receives only one vote, even if reopened from History.

To reveal without choosing, click **Reveal without voting** after requests finish. This also works when a provider failed. Retry is disabled during blind rounds; start a new comparison for another round. Artifact previews, exports, and identity details wait until reveal.

This is a casual game: an answer may name its provider. Wins stay on this computer and persist separately from History; deleting History does not reset the tally. Nothing is posted to a public leaderboard.

## Preview artifacts with the Y badge

An **artifact** is a file-like answer, such as a small webpage, drawing, data file, or source code. A gold **Y** appears when an answer contains a complete, labeled code/file block the app recognizes.

1. Hover over **Y** to peek. Moving away from the badge and preview hides an unpinned peek.
2. Click **Y** to keep it open. It docks beside the cards on wide windows or below them on smaller windows.
3. Click the same **Y** again, or the preview’s close button, to hide it.
4. If several files are available, click their filename tabs.
5. For HTML, SVG, or JSON, **Show source** lets you see the underlying text. Source text has scrolling and Copy code controls.
6. Click **Save file**, choose a folder and name, and click Save to keep the file.

If the preview sits below the cards, scroll the results area to reach it. Clicking another card’s Y switches the pinned preview; merely hovering does not.

Try this question: **“Create a small self-contained HTML greeting card that says Hello. Put the complete file in one fenced html code block.”** You can copy that wording without understanding HTML.

HTML webpages and SVG drawings have static previews: scripts, outside network requests, forms, and app access are blocked. Code such as Python or JavaScript is displayed as text, not executed. JSON data is formatted when valid. Saved HTML can run scripts and contact the internet if later opened in an external browser; the in-app restrictions do not follow the saved file.

The app reads file blocks inside answers; it does not fetch private artifacts stored on AI websites. An unfinished or unlabeled block may not produce Y. Up to 12 files are shown per answer, each limited to one million characters. No preview guarantees that the generated file works correctly.

## Keep or share a comparison

### Reopen History

1. Click **History** at the top.
2. Click a saved question to reopen it.
3. Read its answers without generating or paying for another request.

Arena keeps the last **50 comparisons** on this computer, including Sample and Website assist. Export anything you want to keep beyond that. History is saved during use and normal close, but a crash can lose the latest unsaved fragment. An interrupted answer remains labeled as such; Retry in Live API is a new request.

### Save a file you can keep

1. Finish or stop your comparison.
2. Click **Export Markdown**. Choose this unless you specifically need JSON.
3. In the Save dialog, select a folder you recognize, such as **Documents**.
4. Give the file a recognizable name and click **Save**.
5. Find it in that folder later. A `.md` file can be opened with a text editor such as Notepad or TextEdit; you may see formatting marks, but the question and answers are readable. You can also paste a copied answer into a document or email.

Exports include the complete recorded answers, not just what fits on screen, plus recorded errors and partial text. Review files before sharing; they may contain private material.

### Remove saved history

Use **Delete** beside an entry. To clear the list, click **Delete all history**, then **Confirm delete all**. Export anything you want to retain first. Deleting history does not delete your exports, clipboard contents, or damaged-file recovery backups.

## Easier setup: model menus and one-key OpenRouter

You can skip this section and use direct provider keys.

A **model menu** chooses which version of an AI answers. Open Connections, click **Check key & load models**, pick an available text model, then Save connections. If your saved choice is no longer listed, choose a suitable replacement and check its pricing. A listed model is not a guarantee of generation access or available credit.

**OpenRouter** is an optional third-party service that can route all three cards using one key. It receives the prompts and answers and applies its own billing and privacy policies. It is not a free substitute for paid API access.

1. Open Connections. Change **Connection route** to **OpenRouter · one key**.
2. Read the disclosure shown there.
3. Click **Get API key** to open [OpenRouter’s key page](https://openrouter.ai/settings/keys). Create/sign in to an account there, review its billing, and create a key.
4. Copy the key and paste it into Arena’s OpenRouter **API key** field.
5. Click **Check key & load models**.
6. Choose an Anthropic model for Claude, an OpenAI model for OpenAI, and a Google model for Gemini. Check the selected models’ rates before use.
7. Click Save connections. Choose Live API and Compare normally. The note above your question identifies the OpenRouter route.

Switching back to Direct provider keys keeps previously saved direct keys. The app encrypts the OpenRouter key using the same OS protection. Review [OpenRouter’s own documentation](https://openrouter.ai/docs/quickstart) for account requirements and current terms.

## Updates

There is no automatic background installation. You choose when to update.

1. Export any work you want to keep and quit Arena.
2. Download the current matching installer from the [beginner download table](../START-HERE.md#2-download-the-matching-installer).
3. **Windows:** run the new Setup file for the same processor type.
4. **Mac:** open the new DMG, drag Arena into Applications, and choose to replace the existing app when Finder asks. Open the Applications copy afterward.
5. Check that your saved connections and History are available. Settings normally survive because they are outside the application itself. The OS may ask for credential authorization again.

Do not copy encrypted key files between computers. Enter keys in Connections on the new computer instead.

For an optional notification, open Connections and enable **Check GitHub for updates on launch**. It is initially off. The check sends no keys, questions, or answers; GitHub receives ordinary connection information such as your IP address. **Check now** requests a check manually; both use the same once-per-launch result. **View download** opens the release page; you still install the update yourself. Turning the checkbox off stops future automatic checks.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| Download link fails | Use the [current release page](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest), expand Assets, and choose the installer for your computer. |
| App is blocked, unverified, or damaged | Read [first-launch help](#first-launch-security-prompts). Confirm the computer type and current download. Do not disable OS protections globally. |
| Mac seems stuck opening | Look for a macOS Keychain authorization prompt and handle it directly. Do not put your Mac password into Arena. |
| Cannot type a new question | You are probably in Sample. Switch to Live API or Website assist. |
| Add an API key | Save a key for that provider in Connections, or uncheck Include for its card. |
| API key rejected | Replace the full key from the correct provider’s official key page. A Gemini key error can also be reported after a mistyped key. |
| Insufficient credit or billing setup | Check that provider’s API billing/credit page. Chat subscription payments do not prove API credit. |
| Access denied | Check your account or key’s model permissions with the provider. |
| Model unavailable | Open Connections, use Check key & load models, choose a suitable available model, and save. |
| Rate limit or quota reached | Wait and check the provider’s usage/credit/limits before retrying. |
| Only one or two answers | Check Include, key, model, and the error on the missing card. Other cards can still succeed. |
| Timed out | Check the internet connection, shorten the task, or Retry. The app allows two minutes waiting for data before visible text, 45 seconds between data once text starts, and five minutes overall. Partial text stays available. |
| Output limit reached or no visible answer | Shorten the task or consider a higher Output limit. Some models spend output budget on reasoning. A higher limit and a retry can increase charges. |
| Saved key could not be unlocked | Resolve the OS credential prompt or re-enter the key. Saved does not guarantee currently readable. |
| Cannot save keys | OS credential encryption is unavailable or could not complete. Use Sample/Website assist while resolving it. New keys are not saved without encryption. |
| Save connections seems busy | Wait for its checks; Close and Escape are disabled during saving. Errors do not mean you should paste keys into a support chat. |
| Text looks cut off | Scroll inside the answer card. For wide code, use its horizontal scrollbar or keyboard focus. Copy answer/Export includes the full recorded text. |
| Text is too small | Use View → Zoom In; on Windows Alt reveals the menu. |
| File could not be saved | Choose a writable folder such as Documents. If the disk is full, free space and try again. Canceling Save keeps the comparison in Arena. |
| Damaged connection settings at startup | The dialog offers Reset connections (keeps a backup), Open settings folder, or Quit. Reset means you will need to paste keys again. |
| History/preferences cannot be read | The dialog offers Use temporary session, Open folder and quit, or Quit. A temporary session does not overwrite the affected file; export before closing because temporary records do not persist. |
| Display crashed | Choose Reload in the recovery dialog, then reopen History. The latest unsaved fragment may be lost. |
| Vote saved but history update failed | The vote is counted once. Reopening that comparison recovers the recorded winner. |

An explicit busy-server response (HTTP 503/529) gets one automatic retry before text starts. Stop cancels that wait. Rate limits, network errors, and interrupted streams are not automatically retried. This is not a guarantee about provider billing.

## Get help or report a problem

If a friend gave you the app, you can ask them to help with installation. To report an app bug, use the project’s [GitHub Issues page](https://github.com/YobieBenjamin/llm-battle-arena/issues). GitHub requires an account to post an issue, even though downloading and using Arena does not.

1. Check whether the same problem has already been reported.
2. Choose **New issue** and describe the problem in ordinary words; you do not need to write code.
3. Say which release you installed, whether you use Mac or Windows, and what you clicked.
4. Include the exact error wording and model name if relevant.
5. If attaching a screenshot, hide API keys, account details, and private questions/answers first.

You can copy this format:

> Computer: Mac or Windows, and version if known
>
> Arena release: the version shown on the download page
>
> Mode: Sample, Website assist, or Live API
>
> What I clicked: …
>
> What I expected: …
>
> What happened / exact error: …

Never post an API key or password. For provider billing, credit, account restrictions, or key creation problems, contact that provider’s support; Arena cannot change its decisions.

## Privacy and local settings

API keys are encrypted on this computer using the operating system’s credential protection. Saved secrets are not displayed back to you. They are used to contact the configured providers. Anyone who can use your logged-in account may still be able to use its apps and credentials.

**History is not encrypted:** saved questions and answers are plain text on this computer. The app has no analytics or hosted Arena server. In direct mode live prompts go to the selected providers under their terms. In OpenRouter mode they also go through OpenRouter. Website assist opens your system browser; website policies apply. Optional update checks contact GitHub.

For normal use, manage History and keys through the app. If troubleshooting or removing all local data, the app-data folders are:

- **Mac:** `~/Library/Application Support/LLM Battle Arena/`. In Finder, choose **Go → Go to Folder**, paste that path, and press Return.
- **Windows:** `%APPDATA%\LLM Battle Arena\`. Open File Explorer, paste that path into its address bar, and press Enter.

The folder holds `connections.json` (encrypted keys/settings), `history.json` (comparisons), and `preferences.json` (votes/update preference). If a recovery dialog shows a different path, use the path it shows. Damaged history may be backed up with a `.bak` suffix; clearing History does not remove those backups or exported files. Leave these files alone unless you are intentionally troubleshooting or removing data.

## Uninstall

Export anything you want to keep and quit Arena first.

- **Windows:** open Settings → Apps → Installed apps, find LLM Battle Arena, and choose Uninstall. If you deliberately used the portable version, close it and remove its executable instead.
- **Mac:** open Applications and move LLM Battle Arena to Trash.

Uninstalling may leave local settings/history behind. If you also want to remove them, delete only Arena’s app-data folder listed above after closing the app. This removes saved comparisons, local votes, and the local encrypted key copies. Your exports and clipboard are separate. To stop a key working anywhere, revoke it on the provider’s website; uninstalling Arena alone does not revoke it.

[Back to installation](../START-HERE.md) · [API keys and costs](API_KEYS_AND_COSTS.md) · [Project home](../README.md)
