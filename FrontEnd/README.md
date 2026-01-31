# IUTCS CodeSprint 2026 - Frontend

A Next.js 14+ application for the IUTCS CodeSprint 2026 programming competition with team registration, submission management, and admin panel.

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS with custom glassmorphism design
- **UI Components:** shadcn/ui
- **Authentication:** Supabase (Google OAuth)
- **Database:** Supabase PostgreSQL
- **Deployment:** Vercel (recommended)

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Auth callback route
│   │   └── callback/      # OAuth callback handler
│   ├── login/             # Login page (Google OAuth)
│   ├── submission/        # Code submission page
│   ├── team-dashboard/    # Team dashboard
│   ├── team-registration/ # Team registration form
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx # Theme context
│
├── contexts/              # React contexts
│   └── auth-context.tsx   # Authentication context & provider
│
├── docs/                  # Documentation
│   ├── AUTHENTICATION.md  # Auth setup guide
│   └── supabase_schema.sql # Database schema
│
├── hooks/                 # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection hook
│   └── use-toast.ts      # Toast notifications hook
│
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client files
│   │   ├── client.ts     # Browser Supabase client
│   │   ├── server.ts     # Server Supabase client
│   │   └── middleware.ts # Session management
│   └── utils.ts          # Utility functions
│
├── public/                # Static assets
├── styles/                # Additional stylesheets
├── middleware.ts          # Next.js middleware (route protection)
└── .env.local            # Environment variables
```

## 🔐 Authentication Flow

1. User clicks "Continue with Google" on login page
2. Supabase redirects to Google OAuth
3. User authenticates with Google
4. Callback route creates/checks profile in database
5. User is redirected based on role:
   - **Admin** → `/admin`
   - **Registered Participant** → `/team-dashboard`
   - **New User** → `/team-registration`

## 📋 User Roles

| Role | Access |
|------|--------|
| `admin` | Admin dashboard, manage teams, view submissions |
| `participant` | Team registration, submission, team dashboard |

## 🛠️ Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase

1. Create a new Supabase project
2. Enable Google OAuth in Authentication settings
3. Run the SQL schema from `docs/supabase_schema.sql`
4. Configure redirect URLs in Supabase dashboard

See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for detailed setup instructions.

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

- **Primary Background:** #0a0e27 (Navy)
- **Accent Color:** #ff2e3e (Red)
- **Glass Effect:** Glassmorphism with backdrop blur
- **Animations:** Floating orbs, gradient borders

## 📱 Features

- ✅ Responsive design (mobile-optimized)
- ✅ Google OAuth authentication
- ✅ Role-based access control
- ✅ Team registration with bKash payment
- ✅ Code submission system
- ✅ Admin dashboard
- ✅ Countdown timer to event
- ✅ Scroll-to-top button
- ✅ Custom scrollbar styling

## 🗄️ Database Tables

- **profiles** - User profiles linked to Supabase Auth
- **teams** - Team registrations
- **submissions** - Code submissions

## 📄 License

MIT License - IUTCS 2026
