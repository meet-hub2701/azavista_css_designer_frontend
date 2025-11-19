# StyleForge Frontend

Frontend application for StyleForge - A visual CSS theme builder.

## Features

- Theme list and management UI
- Visual CSS builder with live preview
- Website extraction and styling
- Section-based theme design
- Export themes as CSS/JSON

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Zustand (State Management)
- Monaco Editor

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## Deployment on Vercel

1. Push this repository to GitHub
2. Import the project in Vercel
3. Add environment variable `NEXT_PUBLIC_API_URL` in Vercel dashboard
4. Deploy

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
