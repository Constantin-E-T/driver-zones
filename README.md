# Map - Driver Zone Tracker

A Progressive Web App (PWA) for drivers to visualize and manage their service zones on an interactive map. Available at **map.conn.digital**. Built with Next.js 16, React 19, and Leaflet.

## 🚀 Features

- **99 Pre-loaded Zones** - Comprehensive coverage across Portsmouth, Havant, Waterlooville, Fareham, Gosport, Hayling Island, and Chichester
- **Real-time GPS Tracking** - Live location tracking with automatic zone detection
- **Custom Zone Creation** - Add your own zones by clicking on the map
- **Zone Management** - View, sort, and delete zones in a convenient list
- **Multiple Map Styles** - Toggle between satellite, dark, and light map views
- **Zone Tooltips** - Hover to see zone names on the map
- **PWA Support** - Install on your device for offline access
- **Local Storage** - All zones saved locally, no account needed

## 📋 Prerequisites

- Node.js 20 or higher
- pnpm (recommended package manager)

## 🛠️ Installation

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database (optional for this version)
DATABASE_URL="postgresql://..."

# What3Words API (optional)
WHAT3WORDS_API_KEY="your_api_key"

# Production domain
NEXT_PUBLIC_APP_URL="https://map.conn.digital"
```

## 🏗️ Build & Deploy

### Development
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
pnpm start
```

### CapRover Deployment

This app is configured for CapRover deployment:

1. Push to your git repository
2. Connect to CapRover
3. Set environment variables in CapRover dashboard
4. Deploy using `captain-definition`

The Dockerfile uses:
- Node 20 Alpine
- pnpm for package management
- Health checks for monitoring
- Port 80 for production

## 📱 PWA Installation

The app can be installed as a Progressive Web App:

1. Visit the site in a browser
2. Look for the "Install" prompt
3. Click "Install" to add to home screen
4. Use like a native app with offline support

## 🗺️ Zone Coverage

**Portsmouth Area:**
- Burrfields, Copnor, Portsea, Old Portsmouth, Stamshaw-Tipner
- North End, Milton, Fratton-St Marys, Drayton East/West
- Anchorage Park, Farlington, Langstone, Lakeside Harb
- Paulsgrove, Wymering, Widley, Cosham

**Havant & Waterlooville:**
- Havant Town Centre, Havant Station, Havant East, Leigh Park
- Bedhampton, Park Parade, Purbrook, Cowplain, Horndean
- Crookhorn, Hazleton Estate, The Terraces, Warren Park

**Fareham:**
- Fareham Centre, Portchester, Titchfield, Locks Heath
- Sarisbury Green, Warsash, Park Gate, Whiteley
- Funtley, East St Fareham

**Gosport:**
- Gosport Town Centre, Ann's, Rowner South, Alverstoke
- Elson South, Bridgemary South

**Hayling Island:**
- Hayling Ferry, Hayling Seafront, Hayling Beach, Hayling Bridge
- Mengham, Mill Ryth, Northney

**Emsworth to Chichester:**
- Warblington, Emsworth, Westbourne, Southbourne
- Nutbourne, Chidham, Bosham, Fishbourne
- Hermitage, Chichester

**Other Areas:**
- Clanfield, Denmead, Boarhunt, Southampton Centre
- Heathrow AIR, Asda locations

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **React:** React 19 with React Compiler
- **Maps:** Leaflet + React Leaflet
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **PWA:** Next PWA configuration

## 📄 License

Private project

## 🤝 Support

For issues or questions, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** December 2025
