# CreatorIQ - Niche Discovery & Creator Analysis platform

CreatorIQ is a powerful SaaS workspace for creators and agencies, designed to identify high-growth market opportunities and analyze creator performance across social platforms.

## Multi-Stack Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 (App Router) with Turbopack for fast builds.
- **Theme**: Advanced Dark/Light mode toggle powered by `next-themes`.
- **Typography**: Optimized system font stack for maximum reliability and speed.
- **Icons**: `hugeicons-react` for a premium, developer-centric aesthetic.
- **Visuals**: Framer Motion for micro-animations and Recharts for data visualization.

### Backend (.NET Core)
- **Framework**: ASP.NET Core 8.0 Web API.
- **Language**: C#.
- **Features**: 
  - Integrated JSON naming policies (snake_case) for frontend compatibility.
  - In-memory caching for optimized trend research queries.
  - Structured error handling and fallback mechanisms.

### Data Engine (Python)
- **Engine**: Python 3.14 Integration.
- **Primary Data source**: Google Trends (via Pytrends).
- **Features**: 
  - Programmatic search volume and momentum analysis.
  - Intelligent subtopic clustering using related query signals.
  - Automatic exponential backoff and mock-fallback for data reliability.

## Project Structure

- `web-app/`: Next.js frontend application.
- `backend/`: ASP.NET Core API project.
  - `Scripts/`: High-performance Python data engines.
  - `Controllers/`: API endpoints for Trends and Creators.
  - `Services/`: Business logic and external process management.

## Getting Started

### 1. Prerequisites
- Node.js 18+
- .NET 8 SDK
- Python 3.10+ (with `pytrends`, `pandas`, `requests` installed)

### 2. Run Backend
```bash
cd backend/CreatorIQ.Api
dotnet run
```
Backend will start on `http://localhost:5087`.

### 3. Run Frontend
```bash
cd web-app
npm run dev
```
Frontend will start on `http://localhost:3000`.

## Features

- **Niche Discovery**: Research any topic to see real-time market demand, growth velocity, and competition density.
- **Keyword Clustering**: Identify rising sub-niches before they reach mainstream saturation.
- **Creator Analysis**: Deep-dive into engagement patterns and audience demographics.
- **Strategic Insights**: Automated recommendations for content formats and underserved market angles.

---
Built with accuracy, stability, and scalability in mind.
