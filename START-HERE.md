# Install LLM Battle Arena: start here

**This guide assumes you have never used GitHub and do not write code.** Follow the steps for your computer. You can stop after the free sample and set up real AI answers later.

[Back to the home page](README.md) · [Complete user guide](docs/USER_GUIDE.md)

## Before you begin

You need a Mac or Windows computer, an internet connection to download the app, and permission to install apps on that computer. Phones, tablets, Chromebooks, and web browsers are not supported installation targets. A work or school computer may require help from its administrator.

The Arena is free. **Sample** is free and works offline after installation. Automatic real answers require your own provider API access and may cost money. You do not need keys or a credit card to try Sample.

GitHub is the download website. You do **not** need a GitHub account, GitHub Desktop, Python, Node.js, or any programming software.

## 1. Find out which computer you have

### On a Mac

1. Click the **Apple logo** at the upper-left corner of your screen.
2. Click **About This Mac**.
3. Find **Chip** or **Processor**.
4. If it says **Apple M1**, **M2**, **M3**, **M4**, or another Apple M-series chip, use **Apple Silicon** below. If it says **Intel**, use **Intel Mac**.

### On Windows

1. Click **Start**, then **Settings** (the gear icon).
2. Open **System**, then **About**.
3. Find **System type**.
4. If it says **x64-based processor**, use **Windows Intel/AMD** below. If it says **ARM-based processor**, use **Windows ARM**. A 32-bit/x86-only PC is not supported.

## 2. Download the matching installer

Click **one** link:

| Computer type | Download | Filename ends in |
| --- | --- | --- |
| Windows Intel/AMD | **[Download Windows installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-x64-Setup.exe)** | `Windows-x64-Setup.exe` |
| Windows ARM/Snapdragon | **[Download Windows ARM installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-Windows-arm64-Setup.exe)** | `Windows-arm64-Setup.exe` |
| Apple Silicon Mac | **[Download Apple Silicon installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-arm64.dmg)** | `macOS-arm64.dmg` |
| Intel Mac | **[Download Intel Mac installer](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest/download/LLM-Battle-Arena-macOS-x64.dmg)** | `macOS-x64.dmg` |

A **download** saves a file to your computer. It does not install the app yet.

1. If your browser asks where to save the file, choose **Downloads**.
2. Wait until the download finishes. You can check your browser’s downloads button, often a downward arrow.
3. Open **Downloads** in Finder on Mac or File Explorer on Windows. Find the filename from the table.
4. Follow the installation steps below for your computer.

**If you land on a GitHub page instead:** open the [current release page](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest), scroll to **Assets**, and expand it if necessary. Click the matching filename from the table. For Windows choose **Setup**, not **Portable**. Ignore **Source code**, `.zip` source archives, `proof-…`, and `SHA256SUMS.txt`; these are not the beginner installer. Do not click the green **Code** button.

## 3. Install and open the app

### Windows installation

1. In Downloads, double-click the **LLM-Battle-Arena-Windows-…-Setup.exe** file.
2. If Windows shows a security warning, follow [first-launch help](docs/USER_GUIDE.md#first-launch-security-prompts). Read it before choosing to proceed.
3. Let the installer finish. It installs for your Windows user and normally opens the app automatically. You do not need to choose a folder or run commands.
4. If it does not open, click **Start**, type **LLM Battle Arena**, and open the result. You can also use its desktop shortcut.
5. Next time, use that shortcut or Start. You do not need to run the installer again.

**Success looks like:** a window titled LLM Battle Arena, with **Connections** near the top and three answer cards.

### Mac installation

1. In Downloads, double-click **LLM-Battle-Arena-macOS-….dmg**. A `.dmg` is a disk image: a container holding the app.
2. A window should show **LLM Battle Arena** and an **Applications** shortcut.
3. Click and hold the Arena icon, drag it onto **Applications**, then release. Wait for copying to finish.
4. Open **Finder**, click **Applications** in its sidebar, then double-click **LLM Battle Arena** there. Use this installed copy, not the one inside the disk image.
5. If macOS blocks it, follow [first-launch help](docs/USER_GUIDE.md#first-launch-security-prompts).
6. If macOS displays a **Keychain** prompt, handle that system prompt directly. Keychain is your Mac’s credential protection. Do not enter your Mac password into Arena or send it in a chat. A waiting prompt can make startup appear stuck.
7. After the app opens, eject the installer disk image using the eject icon beside it in Finder. Keep opening the app from Applications in future.

**Success looks like:** the Arena’s own window with a question box and Claude, OpenAI, and Gemini cards. You can now close the installer window.

**Already have an older Arena installed?** Quit it first and use the [update instructions](docs/USER_GUIDE.md#updates). Do not delete your saved settings just to update.

## 4. Try the free sample

1. At the top, find **Compare with**.
2. Select **Sample · no setup** if it is not selected already.
3. Click **Show sample**.
4. Read the three example answers. Put your pointer over a card and scroll to read more.
5. On the Gemini card, hover over the small gold **Y** to preview an example file. Click Y to keep it open; click Y again to hide it.

**Success looks like:** three answers labeled as illustrative samples. They are human-written examples, not live AI responses. The sample question is fixed; the question box becomes editable in the other modes.

You have installed the app successfully. You can stop here and return later.

## 5. Choose your next step

| What you want | What to do next |
| --- | --- |
| Ask real questions automatically | [Connect API keys](docs/USER_GUIDE.md#connect-your-api-keys), then run your first live comparison. |
| Use your usual AI websites without API keys | [Follow Website assist](docs/USER_GUIDE.md#use-it-without-api-keys-website-assist). You will copy and paste manually. |
| Learn the buttons, history, exports, and blind battles | [Open the complete user guide](docs/USER_GUIDE.md). |

**[Step-by-step: get Claude, OpenAI, and Gemini keys and paste them into Arena](docs/API_KEYS_AND_COSTS.md)**. Read its cost explanation before using Live API.

An **API key** is a private access code from a provider. It is not a website password, and a paid chat subscription does not automatically give you API credit. One provider is enough to start; for three automatic direct answers you need all three connected.

For a first real question, try: **“Give me three funny names for a very lazy superhero. Keep the answer short.”**

## If you get stuck

- **Cannot find the downloaded file:** open your browser’s downloads list and use its folder/show-in-folder option.
- **Downloaded a ZIP with lots of code files:** return to step 2 and choose the installer instead.
- **Computer says the app is blocked or damaged:** use [first-launch help](docs/USER_GUIDE.md#first-launch-security-prompts); do not disable security software or paste commands from an unknown website.
- **Cannot type a new question:** switch from Sample to Live API or Website assist.
- **Asked to log in to GitHub:** downloading does not require an account. Return to the direct download links above.
- **Need more help:** [troubleshooting and reporting a problem](docs/USER_GUIDE.md#troubleshooting).
