# Abroadly Frontend

Modern React + TypeScript frontend for the Abroadly study abroad platform.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── StarRating.tsx
│   └── ProgramCard.tsx
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Auth.tsx
│   ├── Programs.tsx
│   ├── ProgramDetail.tsx
│   ├── Places.tsx
│   ├── PlaceDetail.tsx
│   └── Trips.tsx
├── services/          # API service layer
│   └── api.ts
├── context/           # React context
│   └── AuthContext.tsx
├── App.tsx           # Main app component
└── index.tsx         # Entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server (runs on http://localhost:5173)
npm run dev
```

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔌 Backend Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`.

**Make sure the backend is running:**

```bash
# In the root directory
uv run uvicorn app.main:app --reload --port 8000
```

## 🎨 Features

### ✅ Implemented

- **Authentication**
  - Magic-link email authentication
  - Passwordless sign-in
  - Persistent sessions with HttpOnly cookies

- **Programs Section**
  - Browse study abroad programs
  - Filter by city and country
  - View detailed program information
  - Read and write program reviews
  - Course and housing reviews

- **Places Section**
  - Discover local recommendations
  - Filter by category, city, and country
  - View place details with reviews
  - Submit place reviews

- **Trips Section**
  - Coming soon page
  - Future feature preview

- **UI/UX**
  - Responsive design (mobile, tablet, desktop)
  - Modern, clean interface
  - Smooth transitions and animations
  - Star rating system
  - Loading states and error handling

### 🚧 Coming Soon

- Interactive map for Places
- Trip planning features
- User profiles
- Photo uploads
- Advanced search
- Social features

## 🎯 Key Components

### API Service (`services/api.ts`)

Centralized API client with Axios:
- Type-safe API calls
- Cookie-based authentication
- Error handling
- All backend endpoints wrapped

### Auth Context (`context/AuthContext.tsx`)

Global authentication state:
- Current user info
- Login/logout functions
- Session persistence
- Auth state across app

### Reusable Components

- **Navbar** - Navigation with auth state
- **Footer** - Site footer with links
- **StarRating** - Interactive star rating
- **ProgramCard** - Program display cards

## 🔒 Authentication Flow

1. User enters email on `/auth` page
2. Backend sends magic link to email
3. User clicks link (with token)
4. Frontend receives token, sets cookie
5. User is authenticated across app

## 🎨 Styling

Using Tailwind CSS with custom utilities:

- Responsive breakpoints (sm, md, lg)
- Custom color palette (blue primary)
- Line-clamp utilities
- Smooth transitions
- Modern shadows and borders

## 📝 Environment Variables

Currently using default localhost URLs. For production, create `.env`:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

Then update `services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

## 🐛 Troubleshooting

**Port 5173 already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**CORS errors:**
- Make sure backend CORS middleware includes `http://localhost:5173`
- Check that `withCredentials: true` is set in Axios

**TypeScript errors:**
```bash
# Check types
npx tsc --noEmit
```

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

Built with ❤️ for students studying abroad 🌍
