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

Edit `src/storyConfig.js`. It contains the names, chapter questions, secret answers, hints, final answer, and all ten boyfriend-rating messages.

Answers ignore capital letters and punctuation. Progress is saved in the browser, and **Reseal story** restarts the experience for testing.
