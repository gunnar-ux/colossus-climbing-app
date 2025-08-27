# Colossus - Climbing Analytics App

A complete climbing analytics platform extracted from HTML prototypes into a proper React application with React Router and state management.

## Features

### 🧗‍♂️ Complete User Journey
- **Account Creation**: 2-step onboarding with personal and physical stats
- **Welcome Tour**: Interactive 6-step tour showcasing app features
- **Dashboard**: Progressive feature unlocking based on tracking milestones
- **Climb Tracker**: Light-themed climb logging with animations
- **Sessions**: Dark-themed session history with detailed analytics

### 📊 Progressive Feature Unlocking
- **3 Sessions**: Climb Readiness Score (CRS) becomes available
- **5 Sessions**: Load monitoring and accurate CRS calibration
- **30+ Climbs**: Rich grade progression analytics
- **50+ Climbs**: Full metric suite unlocked

### 🎯 Retention Features
- **Week 1**: Smooth onboarding → welcome tour → calibration tracking
- **Track → View Progress**: Immediate gratification through detailed session breakdowns
- **Long-term**: Readiness indicators, load management, and gamification

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## User Flows

### New User Flow
1. **Account Creation** (/) → Personal Info → Physical Stats
2. **Welcome Tour** → Interactive 6-step feature showcase
3. **Dashboard** → Calibration card shows progress (3/5 sessions needed)
4. **Track Climb** (/track) → Log first climbs
5. **Sessions** (/sessions) → View progress and data

### Returning User Flow
1. **Dashboard** (/dashboard) → View readiness score and recommendations
2. **Track** (/track) → Log new climbs with success animations
3. **Sessions** (/sessions) → Analyze progress with expanding cards
4. **Dashboard** → Updated metrics and progressive feature unlocking

## Architecture

### State Management
- **LocalStorage**: Persistent user data and sessions
- **React State**: Component-level UI state
- **Progressive Features**: Metric availability based on user data

### Routing
- `/` - Onboarding flow (redirects to /dashboard when complete)
- `/dashboard` - Main analytics dashboard
- `/track` - Climb logging interface
- `/sessions` - Session history and analysis

### Components
```
src/
├── components/
│   ├── onboarding/          # Account creation and welcome tour
│   ├── dashboard/           # Analytics and readiness indicators
│   ├── tracker/             # Climb logging with light theme
│   ├── sessions/            # Session history with dark theme
│   └── ui/                  # Shared components (Header, FAB, etc.)
├── data/                    # Sample data and constants
├── hooks/                   # Custom hooks (pull-to-refresh)
├── utils/                   # Utility functions and color logic
└── styles/                  # CSS animations
```

## Key Features Preserved

### 🎨 Exact Styling
- **Dark Theme**: Dashboard and sessions (`bg-bg`, `bg-card`, `text-graytxt`)
- **Light Theme**: Climb tracker (`bg-gray-50`, `bg-white`)
- **Animations**: Pull-to-refresh, button transforms, success states
- **Responsive**: Mobile-first 430px max-width design

### 📱 Interactive Elements
- **Pull-to-refresh**: Touch-based dashboard refresh
- **Swipe Navigation**: Welcome tour gesture controls
- **Expandable Cards**: Session details with smooth height transitions
- **Form Validation**: Real-time validation with disabled states

### 🏆 Gamification
- **Calibration Progress**: Visual progress toward full metrics
- **Readiness Indicators**: Color-coded performance states
- **Achievement System**: Level progression and milestone tracking
- **Success Animations**: Satisfying feedback for climb logging

## Development

The app maintains the exact user experience from the HTML prototypes while adding proper React architecture:

- **Component Extraction**: All HTML components converted to React with identical styling
- **State Management**: User data, sessions, and UI state properly managed
- **Navigation**: React Router for seamless page transitions
- **Progressive Features**: Dashboard features unlock based on user milestones
- **Data Persistence**: LocalStorage for user data and session history

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Built with Vite + React + Tailwind CSS + React Router.
