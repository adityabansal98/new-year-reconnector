# Link Back AI

A Next.js application that helps you find the right people in your network to help you achieve your professional goals by intelligently matching your LinkedIn connections with your objectives.

## About

This project was built at **SundAi Hackathon** on Sunday, December 28, 2025 by:
- [Aditya Bansal](https://www.linkedin.com/in/bansaladitya98/)
- [Alfred Wong](https://www.linkedin.com/in/alfred-wong/)
- [Flavia Beppler](https://www.linkedin.com/in/flavia-beppler-7179bb38/)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI:** Google Gemini API (gemini-2.5-flash)
- **Authentication:** Clerk (Google OAuth)
- **Database:** Supabase (for connection persistence)
- **Analytics:** Google Analytics 4
- **Data Parsing:** papaparse
- **File Upload:** react-dropzone

## Features

- ✅ **Goal-Based Matching:** Enter your professional goal and let AI find relevant connections
- ✅ **LinkedIn CSV Import:** Upload your LinkedIn connections export
- ✅ **Smart Keyword Extraction:** AI-powered keyword extraction from your goals
- ✅ **Intelligent Matching:** Client-side filtering and ranking of connections
- ✅ **Personalized Messages:** AI-generated LinkedIn messages for outreach
- ✅ **User Authentication:** Sign in with Google via Clerk
- ✅ **Connection Persistence:** Save and reuse your connections across sessions
- ✅ **Profile Management:** Update connections via dedicated profile page
- ✅ **Analytics:** Track page views, clicks, and user interactions

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API key
- Clerk account (for authentication)
- Supabase account (for data persistence)
- Google Analytics 4 property (optional, for analytics)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-year-connections
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` (if it exists)
   - Add the following variables to `.env.local`:

```env
# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your_ga4_measurement_id
```

4. Set up Supabase:
   - Follow the instructions in `SUPABASE_SETUP.md` to create the database table

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze-resolution/    # AI keyword extraction endpoint
│   │   ├── draft-message/          # AI message generation endpoint
│   │   ├── load-connections/       # Load saved connections from Supabase
│   │   └── save-connections/       # Save connections to Supabase
│   ├── how-to-download/            # Instructions for downloading LinkedIn data
│   ├── profile/                    # User profile and connection management
│   ├── sign-in/                    # Authentication page
│   ├── globals.css                 # Global styles with dark mode theme
│   ├── layout.tsx                  # Root layout with Clerk and GA4
│   └── page.tsx                    # Main landing page
├── components/
│   ├── connection-card.tsx         # Individual connection display card
│   └── message-modal.tsx           # Modal for viewing/generating messages
├── lib/
│   ├── analytics.ts                # Google Analytics event tracking
│   ├── csv-parser.ts               # LinkedIn CSV parsing utilities
│   ├── match-connections.ts       # Connection filtering and ranking logic
│   ├── supabase.ts                 # Supabase client initialization
│   └── utils.ts                    # General utility functions
├── middleware.ts                   # Clerk authentication middleware
├── SUPABASE_SETUP.md              # Supabase database setup guide
└── VERCEL_DEPLOYMENT.md           # Vercel deployment instructions
```

## How It Works

1. **Sign In:** Authenticate with Google via Clerk
2. **Upload Connections:** Upload your LinkedIn connections CSV file (or use previously saved connections)
3. **Enter Your Goal:** Describe what you want to achieve (e.g., "I want to connect with founders in the healthcare space")
4. **AI Analysis:** The app uses Google Gemini to extract relevant keywords, roles, industries, and exclusions from your goal
5. **Smart Matching:** Connections are filtered and ranked based on:
   - Keyword matches in position, company, and other fields
   - Exclusion filters (removes irrelevant matches)
   - Job level preferences (if specified)
6. **Review Results:** Browse matched connections with relevance scores
7. **Generate Messages:** Click on a connection to generate a personalized LinkedIn message
8. **Connect:** Copy the message and open LinkedIn to send it

## Deployment

The app is configured for deployment on Vercel. See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## Development

### Key Features Implementation

- **Phase 1 (✅ Complete):** Landing page with goal input and CSV file upload
- **Phase 2 (✅ Complete):** CSV parsing and Gemini API integration for keyword extraction
- **Phase 3 (✅ Complete):** Client-side filtering and match ranking
- **Phase 4 (✅ Complete):** Personalized message generation

### Additional Features

- User authentication and session management
- Connection data persistence with Supabase
- Profile page for connection management
- How-to-download guide for LinkedIn data
- Google Analytics integration
- Typing animation for goal suggestions

## License

Private project - All rights reserved
