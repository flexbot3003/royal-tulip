# Royal Tulip

An interactive historical-fantasy arranged-marriage mystery built as a private date invitation.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The static production files are written to `dist/` and can be deployed directly on Vercel.

## Personalise the story

The default values live in `src/storyConfig.js`. It contains the names, chapter questions, secret answers, hints, final answer, and all ten boyfriend-rating messages.

Answers ignore capital letters and punctuation. Progress is saved in the browser, and **Reseal story** restarts the experience for testing.

### Private admin screen

Open the site with `?admin=1` at the end of its address, for example:

```text
http://localhost:5173/?admin=1
```

The default mastermind code is `moonback`. From there you can change Thabi's accepted name, every chapter's secret words and aliases, the revealed answer labels, and the final sentence. Admin changes are saved only in that browser, which is ideal when configuring the same phone or laptop she will use. Change the defaults in `src/storyConfig.js` before deploying when the settings must work on every device.
