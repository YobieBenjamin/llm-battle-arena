# Get API keys and understand the costs

**You set this up once. After that, type your question once in Arena and compare the answers in one window.**

This guide is for people who have never used an API key. You do not need to write code, install developer tools, or run any commands shown on a provider’s website.

[Install the app first](../START-HERE.md) · [Full user guide](USER_GUIDE.md)

## Before you connect: what is free, and what costs money?

**LLM Battle Arena itself is free. Live AI usage may cost money.**

| What you use | Who may charge you? |
| --- | --- |
| Install Arena and try Sample | Nobody. Sample contains fixed written examples and makes no AI requests. |
| Website assist | The websites apply their own plans and limits. Arena makes no API calls in this mode. |
| Live API with direct provider keys | Each included provider bills or applies its allowance to your API account. |
| Live API through optional OpenRouter | OpenRouter applies its own billing and model rates. |

A chat subscription and API access are different products. Do not assume your ChatGPT, Claude, or Gemini subscription pays for questions asked through Arena. Check the API account’s billing separately.

### API calls and tokens, in plain English

An **API** is the connection that lets Arena talk directly to an AI service. You use Arena’s buttons; you do not need to program anything.

An **API call** is a request sent to a provider—for example, asking it to answer your question. **Tokens** are small pieces of text used to measure the amount of work. A token is not necessarily a whole word.

For ordinary text requests, providers commonly charge according to the selected model’s **input tokens** (what it reads) and **output tokens** (what it generates). Some models also generate billable reasoning tokens that you do not see as answer text. API calls are not a separate kind of token, and there is no universal extra fee for every call. Different models and optional services can have different pricing rules. See the current [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), and [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing).

**One click on Compare with three providers selected normally sends three requests.** Each provider processes its own copy of the question and generates its own answer. Your total is the combined usage, not one shared chat allowance.

For example, a short question sent to all three providers produces three sets of input and output usage. Asking for long code files can generate much more output than asking for three short ideas. There is no fixed “price per Arena question,” and this guide does not promise that API use is cheaper or more expensive than a chat subscription.

### Start small and check your usage

1. Try Sample first. It cannot create API charges.
2. Connect one provider initially if you want to learn before using all three.
3. Read that model’s pricing and your account’s billing/credit page before running Live API.
4. Use the provider’s available spending controls or alerts. Read what they actually enforce; an alert or budget display is not necessarily a hard spending stop.
5. Begin with a short request such as “Give me three funny cat names.” Ask for short answers while learning.
6. Review the provider’s usage/billing page after testing. Billing displays may not update instantly.
7. Add the other providers when you are comfortable.

**Retry is another request and may cost more. Stop does not refund work already processed.** The app’s Output limit controls response length per provider; it is not a dollar limit. The Q/A/R counters are usage information and estimates, not a bill. Some accounts/models offer free quotas, but Arena does not promise free credits or automatic free access to all three providers.

## What is an API key?

It is a private access code supplied by the AI company. It lets Arena request answers using your account. Think of it as a pass to that account’s API usage.

It is **not** your email address, website password, or Mac/Windows password. Never paste it into a question, a GitHub issue, or a chat with someone helping you. Enter it only in the matching **API key** field under Arena’s **Connections**.

Keep the provider page and Arena open at the same time. To copy selected text, press **Ctrl+C** on Windows or **Command+C** on Mac. To paste, click the destination field and press **Ctrl+V** or **Command+V**. Use the provider’s Copy button when available so you get the entire key.

Provider screens can change and may differ by country, account, or organization. If you cannot create a key, use that provider’s help link below; you do not need to change Arena’s code.

## Prepare Arena

1. Open **LLM Battle Arena**.
2. Click **Connections** at the top right.
3. Under **Connection route**, leave **Direct provider keys** selected.
4. Find the sections labeled **Claude**, **OpenAI**, and **Gemini**. Scroll inside Connections if necessary.
5. Follow the matching instructions below. You can do just one now.

## Get a Claude key

1. In Arena’s **Claude** section, click **Get API key**. This opens the official [Claude key page](https://platform.claude.com/settings/keys) in your browser.
2. Sign in to the Claude developer platform, or create an account there. This is where API access is managed.
3. Open **Settings → API keys** if you are not already on the key page.
4. Choose **Create key**. If asked for a name, something like “Arena on my laptop” helps you recognize it later.
5. Review any account, credit, or billing requirements on that platform. Creating a key alone does not guarantee usable credit.
6. Copy the complete new key. If the site says it will only show the secret once, copy it before closing that message.
7. Return to Arena. Click the **API key** box in the **Claude** section and paste.
8. Continue with [Check and save the key](#check-and-save-the-key).

[Official Claude key instructions](https://platform.claude.com/docs/en/get-api-key)

## Get an OpenAI key

The **OpenAI** card uses OpenAI’s API models. You do not enter your ChatGPT password, and results need not match the ChatGPT website.

1. In Arena’s **OpenAI** section, click **Get API key**, or open the official [OpenAI API key page](https://platform.openai.com/api-keys).
2. Sign in or create an OpenAI platform account. Complete any account setup the platform requires.
3. If asked to choose a project, use the project where you want to manage this app’s API usage. A project groups your API keys and settings.
4. On the key page, choose the option to create a new secret/API key. Give it a recognizable name if offered, such as “Arena on my laptop.”
5. Review the API account’s billing/credit setup separately from your chat subscription. Do not assume paying for ChatGPT supplies API credit.
6. Copy the complete secret key when shown. Do not use an organization ID or project ID in place of the key.
7. Return to Arena. Paste into the **API key** box in the **OpenAI** section.
8. Continue with [Check and save the key](#check-and-save-the-key).

[Official OpenAI setup documentation](https://developers.openai.com/api/docs/quickstart) — only the API-key/account step is needed for Arena; skip its programming examples.

## Get a Gemini key

1. In Arena’s **Gemini** section, click **Get API key**, or open the official [Google AI Studio key page](https://aistudio.google.com/api-keys).
2. Sign in with your Google account and complete any required AI Studio setup.
3. Find **API keys** or **Get API key**. If AI Studio has already created a key for you, you can use it; otherwise choose **Create API key**.
4. Follow the project selection instructions. A Google Cloud project groups the key, usage, and billing settings; AI Studio may offer a default project or ask you to select/create one.
5. Check the account’s available models, quotas, and free/paid status. Some API models have a free tier; availability and limits vary. Do not enable paid billing unless you want it and understand the terms.
6. Copy the full key from AI Studio.
7. Return to Arena. Paste into the **API key** box in the **Gemini** section.
8. Continue with [Check and save the key](#check-and-save-the-key).

[Official Gemini key instructions](https://ai.google.dev/gemini-api/docs/api-key)

## Check and save the key

Do this for each provider you connected:

1. After pasting its key, click **Check key & load models** in that provider’s section.
2. Wait for a result. **Key accepted** means the key worked for listing models; it does not prove that billing credit or answer generation is available.
3. Look at the **Model** dropdown. A model is the particular AI version that will answer. Keep the current choice if it is available to your account and its pricing suits you, or select an available text model. You do not need to type a model ID.
4. If a choice says **saved; not in returned list**, choose another suitable model from the returned list. Do not assume every listed model supports this app’s kind of request.
5. Repeat for the other keys you want to use.
6. Click **Save connections** at the bottom. Wait for it to finish. If an error appears, read it and correct the problem before closing the window.
7. Back in the main window, select **Live API · automatic** if it is not selected already.
8. Check **Include** on connected providers and uncheck it on providers you have not connected.
9. Ask one short question and click **Compare**.

**Success looks like:** text arrives in each included card, instead of the fixed Sample text. If one card fails, the other cards can still answer. Check that provider’s error before using Retry.

Key checks contact the provider to list models; they do not ask it to generate an answer. Saving checks new keys and changed active settings. Unchanged saved keys are intentionally not rechecked each time you save. To recheck one, use **Check key & load models**. Restricted keys may not have permission to list models.

## Next time you open Connections

A key field may look empty and say **Saved · leave blank to keep**. This is normal: Arena does not show the saved secret again.

- Leave it blank to keep using the saved key.
- Paste a replacement and click Save connections to replace it.
- Select **Remove saved key** and save to remove it from this app. If Remove and a replacement are both entered, removal wins.
- To invalidate a key everywhere, revoke/delete it in the provider’s own key dashboard. Removing it from Arena alone does not do that.

Keys are encrypted using your computer’s credential protection. A Mac may ask for Keychain authorization. Handle that OS prompt yourself; do not enter your computer password into Arena. If encryption is unavailable, Arena refuses to store a new key; use Sample or Website assist until the problem is resolved.

## Common setup problems

| Message or problem | What to do |
| --- | --- |
| API key rejected | Copy a fresh complete key from the correct provider and paste it into that provider’s field. Do not paste a password or an ID. |
| Insufficient credit / billing setup | Visit the provider’s API billing page. A valid key and a chat subscription do not prove you have API credit. |
| Access denied | Your account or restricted key may not have the necessary model/listing permission. Check with the provider or your account administrator. |
| Model unavailable | Use Check key & load models and choose a model that your account can use. |
| Rate limit or quota reached | Wait and check the provider’s usage, free allowance, billing, and request limits before retrying. |
| Saved key could not be unlocked | Check the OS credential prompt or re-enter the key in Connections. A “saved” label does not prove the OS can currently unlock it. |
| Only one answer | Check Include and Connections for the other cards. One saved key does not connect all three direct providers. |
| You do not want to set up API billing | Try [Website assist](USER_GUIDE.md#use-it-without-api-keys-website-assist) instead. Website plans and limits still apply. |

An optional [OpenRouter one-key setup](USER_GUIDE.md#easier-setup-model-menus-and-one-key-openrouter) is also available. It sends requests through another company and uses that company’s billing; it is not a free way around API charges.

[Next: run a real comparison](USER_GUIDE.md#run-a-real-comparison) · [Back to the beginner install guide](../START-HERE.md)
