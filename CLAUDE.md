# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Driver Zone Mapper is a Progressive Web App (PWA) for tracking high-demand zones for drivers. Built with Next.js 16 and React 19, it provides real-time GPS tracking and zone management with an interactive map interface.

## Key Technologies

- **Next.js 16** with App Router and React Server Components
- **React 19** with React Compiler enabled (`babel-plugin-react-compiler`)
- **Tailwind CSS v4** for styling
- **Leaflet** and **react-leaflet** for map rendering
- **TypeScript** with strict mode enabled
- **Radix UI** for accessible component primitives

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### State Management

The app uses React's built-in state management with `useState` and `useEffect`. No external state management library is used.

- **Zone persistence**: Zones are stored in `localStorage` with the key `driver-zones`
- **Default zones**: 76 pre-configured zones covering Portsmouth, Gosport, Havant, Hayling Island, Waterlooville, Fareham, and surrounding areas (defined in `src/lib/constants.ts`)
- **Location tracking**: Real-time GPS tracking via `navigator.geolocation.watchPosition()`

### Component Structure

- **`src/app/page.tsx`**: Main entry point, handles zone state, localStorage sync, and user actions
- **`src/components/Map.tsx`**: Leaflet map with user location tracking, zone visualization, and map style switching (satellite/dark/light)
- **`src/components/ZoneList.tsx`**: Slide-up panel showing all zones with delete functionality
- **`src/lib/types.ts`**: TypeScript type definitions for `Zone` and `UserLocation`
- **`src/lib/constants.ts`**: Default zone configurations

### Map Implementation

The Map component is **dynamically imported with `ssr: false`** to avoid server-side rendering issues with Leaflet. This is critical - Leaflet requires browser APIs and must not be rendered on the server.

Key features:
- User location marker with auto-follow mode
- Drag map to stop auto-follow
- Zone circles (500m radius by default) with labels
- Three map styles: satellite (ArcGIS), dark (CARTO), light (OpenStreetMap)

### PWA Configuration

The app includes a PWA manifest at `public/manifest.json` with standalone display mode and black theme. The app is designed for mobile-first usage by drivers.

## Path Aliases

Use `@/*` imports which resolve to `src/*`:
```typescript
import { Zone } from '@/lib/types';
import { Button } from '@/components/ui/button';
```

## Important Implementation Details

1. **Client-side only components**: Any component using Leaflet must have `'use client'` directive and be dynamically imported without SSR
2. **React Compiler**: This project uses the experimental React Compiler - avoid manual memoization patterns that conflict with the compiler
3. **Geolocation**: The app continuously watches user position with `enableHighAccuracy: true` for precise driver tracking
4. **Zone IDs**: Use `crypto.randomUUID()` for generating zone IDs
5. **Styling**: Dark theme throughout with zinc color palette, mobile-optimized touch targets
