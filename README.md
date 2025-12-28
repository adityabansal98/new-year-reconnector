# Resolution Connector

A Next.js application that helps users achieve their professional New Year's Resolutions by reconnecting with their existing LinkedIn network.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Icons:** Lucide React
- **AI:** Google Gemini API
- **Data Parsing:** papaparse

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key to `.env.local`:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles with dark mode theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page component
├── lib/
│   └── utils.ts          # Utility functions
└── components/           # UI components (to be added)
```

## Features

- **Phase 1 (✅ Complete):** Landing page with resolution input and CSV file upload
- **Phase 2 (✅ Complete):** CSV parsing and Gemini API integration for keyword extraction
- **Phase 3 (Upcoming):** Client-side filtering and match ranking
- **Phase 4 (Upcoming):** Personalized message generation

## Phase 2 Implementation

The app now:
- Parses LinkedIn Connections CSV files using `papaparse`
- Sends the user's resolution to Google Gemini API to extract relevant keywords
- Displays success message with parsed connections count and extracted keywords
- Handles errors gracefully with user-friendly error messages


