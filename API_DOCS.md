# CreatorIQ API Documentation

This document describes the API endpoints and data structures used in the CreatorIQ SaaS platform.

## Base URL
- **Local Development**: `http://localhost:5087` (Default ASP.NET Core port)
- **Frontend Association**: The Next.js frontend defaults to this port via `apiClient`.

## Endpoints

### 1. Trend Discovery
Fetch combined niche analysis from Google Trends (Demand) and YouTube (Supply).

- **URL**: `/api/trends`
- **Method**: `GET`
- **Query Parameters**:
  - `topic` (string, default: "Next.js"): The keyword or niche to analyze.
- **Caching**: 1-hour sliding, 6-hour absolute expiration.

**Response Structure (`TrendDiscoveryData`):**
```json
{
  "main_topic": "Next.js",
  "niche_score": 82,
  "trend_velocity": 12.5,
  "competition_density": "Medium",
  "revenue_potential": 75,
  "top_regions": ["United States", "India", "Germany"],
  "trend_data": [
    { "date": "2026-01-01", "value": 45 },
    ...
  ],
  "subtopics": [
    {
      "keyword": "Next.js 16 tutorial",
      "growth_rate": 150,
      "competition_score": 30,
      "recommendation": "High Priority: Viral Potential"
    }
  ],
  "youtube_metrics": {
    "total_views": 1500000,
    "average_engagement": 4.5,
    "supply_count": 120
  }
}
```

### 2. YouTube Specific Analysis
Detailed extraction of video and channel metrics for a specific topic.

- **URL**: `/api/youtube`
- **Method**: `GET`
- **Query Parameters**:
  - `topic` (string): Search keyword.
  - `region` (string, optional): ISO region code (e.g. US, GB).
  - `lang` (string, optional): ISO language code (e.g. en, es).
  - `maxResults` (int, optional): Number of top videos to analyze (default: 10).

**Response Structure (`YouTubeAnalysisResponse`):**
```json
{
  "topic": "Next.js",
  "video_count": 5230,
  "top_videos": [
    {
      "title": "Next.js 15 Crash Course",
      "views": 250000,
      "likes": 12000,
      "comments": 450,
      "channel_subs": 850000,
      "engagement_rate": 4.98
    }
  ],
  "competition_score": 65,
  "engagement_rate_avg": 4.2
}
```

### 3. Creator Analysis
Mocked analytics for creator profile performance.

- **URL**: `/api/creators`
- **Method**: `GET`
- **Query Parameters**:
  - `handle` (string): Social media handle to analyze.

---

## Data Pipeline Logic

### Niche Score Calculation
The Niche Score is a weighted index:
- **40% Search Demand**: Normalized interest over time from Google Trends.
- **40% YouTube Engagement**: Interaction-to-view ratio from top-performing videos.
- **20% Market Volume**: Logarithmic scaling of total viewership.

### Persistence (Supabase / PostgreSQL)
- **Backend Storage**: The backend automatically persists every search to the `Trends` table in PostgreSQL.
- **Frontend Storage**: Direct Supabase integration is available via `lib/supabase.ts` for browser-side data management.

## Setup
1. **Python dependencies**: `pip install pytrends pandas`.
2. **YouTube API**: Set `YouTube:ApiKey` in `appsettings.json`.
3. **Supabase**: Update connection string in `appsettings.json` and `.env.local`.
