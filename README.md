# Dev Utility

A browser-based collection of everyday developer utilities. The app is built with Next.js and React; tools run locally in the browser, so the text and values entered into them are not sent to an application backend.

## Included tools

- Converters: Base64, URL encode/escape, case conversion, timestamps, JSON/YAML/CSV, colours, string escaping, HTML entities, and Unix permissions
- Generators: UUIDs, Lorem Ipsum, hashes, QR codes, and Mermaid diagrams
- Inspectors and helpers: JSON editor, JWT decoder, regex tester, HTTP status reference, Docker CLI ↔ Compose converter, and cron expression builder

## Prerequisites

- Node.js 20.9 or later
- npm 10 or later

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can select a tool directly with a query parameter, for example `http://localhost:3000/?tool=qrcode`.

## Quality checks

```bash
npm run lint
npm run build
```

## Deploy to Vercel

The project needs no environment variables or server-side configuration.

1. Push the project to a GitHub, GitLab, or Bitbucket repository.
2. In [Vercel](https://vercel.com), select **Add New → Project** and import the repository.
3. Keep the detected **Next.js** settings and select **Deploy**.

Alternatively, deploy from the terminal:

```bash
npx vercel
```

For a production deployment, run:

```bash
npx vercel --prod
```

## Project structure

```text
app/                         Next.js app shell and global styles
components/dev-utility/      Layout, sidebar, and tool console
components/dev-utility/tools Individual tools and the tool registry
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build locally |
