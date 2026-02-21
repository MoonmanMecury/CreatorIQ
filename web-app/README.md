# CreatorIQ - MVP Frontend

This is the MVP frontend for CreatorIQ, a SaaS web application for creators and agencies.

## Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (custom implementation)
- **Data Fetching**: TanStack React Query & Axios
- **Charts**: Recharts
- **Icons**: Hugeicons React

## Project Structure

- `/app`: Next.js App Router pages and API routes.
- `/components`: Reusable UI components and layout elements.
- `/features`: Feature-based modules containing hooks, components, and types.
- `/lib`: Utility functions and API abstraction layer.
- `/hooks`: Global React hooks.
- `/data`: Local JSON mock data.

## Features Implemented

### Use Case 1: Trend & Niche Discovery
- Overview cards for Niche Score, Velocity, and Competition.
- Trend Growth visualization with interactive charts.
- Keyword Cluster panel with search volume and growth indicators.
- Opportunity Insights panel for underserved angles and emerging keywords.

### Use Case 2: Competition & Creator Analysis
- Creator Summary header with key performance metrics.
- Engagement Breakdown with bar charts and trend lines.
- Audience Overview with region and age demographics.
- Competition Density indicator with saturation scoring.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## API Abstraction

The project uses a custom `apiClient` wrapper around Axios, located in `lib/api/client.ts`. Mock data is served through Next.js API routes which simulate network latency.
