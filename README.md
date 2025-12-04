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
- **UI**: Tailwind CSS, Radix UI, Lucide React
- **Maps**: Leaflet (React Leaflet)
- **State**: React 19 (useOptimistic, useTransition)
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: TypeScript with strict mode

## 📐 TypeScript Best Practices

This project follows strict TypeScript best practices to ensure type safety throughout the application:

### Core Principles

1. **Never use `any`** - Always provide explicit types
   ```typescript
   // ❌ Bad
   let data: any = fetchData();
   
   // ✅ Good
   let data: User[] = fetchData();
   ```

2. **Leverage Prisma types** - Use generated types from Prisma Client
   ```typescript
   import type { Zone, User } from '@prisma/client';
   ```

3. **Type function parameters and returns**
   ```typescript
   // ❌ Bad
   function getZone(id) {
     return prisma.zone.findUnique({ where: { id } });
   }
   
   // ✅ Good
   async function getZone(id: string): Promise<Zone | null> {
     return prisma.zone.findUnique({ where: { id } });
   }
   ```

4. **Use type inference when obvious**
   ```typescript
   // Type is inferred as number
   const count = 42;
   
   // But be explicit when it's not clear
   const zones: Zone[] = [];
   ```

5. **Avoid type assertions** - Use type guards instead
   ```typescript
   // ❌ Bad
   const zone = data as Zone;
   
   // ✅ Good
   if (isZone(data)) {
     const zone = data; // TypeScript knows it's a Zone
   }
   ```

6. **Use strict null checks**
   ```typescript
   // Handle null/undefined explicitly
   const zone = await getZone(id);
   if (!zone) {
     throw new Error('Zone not found');
   }
   // Now TypeScript knows zone is not null
   ```

7. **Type React components properly**
   ```typescript
   interface ZoneCardProps {
     zone: Zone;
     onDelete: (id: string) => void;
   }
   
   export function ZoneCard({ zone, onDelete }: ZoneCardProps) {
     // ...
   }
   ```

8. **Use const assertions for literal types**
   ```typescript
   const mapStyles = ['satellite', 'dark', 'light'] as const;
   type MapStyle = typeof mapStyles[number]; // 'satellite' | 'dark' | 'light'
   ```

### Configuration

The project uses strict TypeScript settings in `tsconfig.json`:
- `strict: true` - Enables all strict type checking options
- `noImplicitAny: true` - Error on expressions with implied 'any' type
- `strictNullChecks: true` - Strict null and undefined checks
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters

## Available UI Components

The following components are available for use in the application (powered by Shadcn UI):

- Accordion, Alert Dialog, Alert, Aspect Ratio, Avatar, Badge, Breadcrumb, Button Group, Button
- Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu
- Data Table, Date Picker, Dialog, Drawer, Dropdown Menu, Empty, Field, Form, Hover Card
- Input Group, Input OTP, Input, Item, Kbd, Label, Menubar, Native Select, Navigation Menu
- Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator
- Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toast
- Toggle Group, Toggle, Tooltip, Typography

## 📄 License

Private project

## 🤝 Support

For issues or questions, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** December 2025
