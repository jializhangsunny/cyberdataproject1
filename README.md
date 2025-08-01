# ROCSI Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository with `git clone <repository link>`
2. Navigate to the base folder and run `npm install`

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

depending on which package manager you use.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

```
frontend/
├── app/              # Next.js App Router
├── types/            # TypeScript type definitions
├── services/         # Backend API interface functions
├── context/          # User state, preferences, and app context
│   └── appcontext.tsx # LEF, TEF values & local storage
└── ...
```

- Built with Next.js following App Router structure
- Services handle GET/POST/PUT requests to backend
- Context manages user state and calculated values stored in localStorage
- TypeScript types are kept in `/types` directory, though some types are kept within files where they are used

**Backend API Base URL**: https://rocsi-production.up.railway.app/ (production) | localhost:5000 (local)

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

The should be deployed automatically as soon as you commit code to the main branch.
