# VidMetrics 🚀 
**Competitor Analysis Tool for Enterprise Creators & Agencies** 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzahidbrahimli%2FVidMetrics)

*👉 **Demo Link:** https://vidmetrics.vercel.app*
*👉 **Loom Walkthrough:** https://www.loom.com/share/d7787940152843c8aad0bd08811a0538*
*👉 **Written Submission:** https://www.notion.so/Vibe-Coder-Challenge-Written-Submission-32f90f916c1f8016a2b7d89e13ad1646?source=copy_link*

## Overview
VidMetrics is a clean, demo-ready SaaS MVP that allows enterprise creators and agencies to instantly analyze competitor YouTube channels without leaving the platform. 
By dropping in a YouTube URL, you get an immediate breakdown of their highest-performing content, growth metrics, and publishing cadence.

## ✨ Features (The "Wow" Factor)
- **Smart Insights & AI-like Summaries**: Dynamic insight cards highlight the Most Viral Video, Fastest Growing Video, Average Views, and Posting Frequency, summarized into a direct, actionable sentence.
- **Competitor Head-to-Head**: An elevated comparison view that benchmarks the primary channel against a competitor side-by-side using animated progress bars.
- **Dynamic Scoring Engine**: 
  - `Views per Day` (PVD) tracking formula bridging the gap between old viral hits and new trends.
  - Custom Performance Badges (🔴 Viral > 1k/day, 🟠 Growing > 200/day, ⚪ Slow < 200/day).
- **Time Filtering & Sorting**: Toggle between 30 Days, 90 Days, and All Time, sorted by Trending Score or Total Views instantly.
- **Top 5 Interactive Chart**: Animated, proportional bar charts that visually highlight outperforming videos.
- **Data Export**: One-click CSV export explicitly formatted for global Excel standards (semicolon delimited with UTF-8 BOM).

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons (Focusing heavily on micro-interactions, soft shadows, and a Linear/Stripe-esque aesthetic)
- **Data Source**: Official YouTube Data API v3 (Utilizing Server Actions for secure key handling)
- **Deployment**: Ready for Vercel/Netlify

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/zahidbrahimli/VidMetrics.git
cd VidMetrics
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Environment Variables
Create a `.env.local` file in the root directory and add your YouTube API Key:
```env
YOUTUBE_API_KEY=your_api_key_here
```
*(Note: If no API key is provided, the app will gracefully fallback to an intelligent Mock Data engine so the UI layout, interactions, and aesthetics can still be evaluated and demoed seamlessly).*

### 4. Run the Development Server
```bash
npm run dev
```
Your app should now be running on `http://localhost:3000`.