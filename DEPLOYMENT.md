# Colossus Climbing App - Deployment Guide

## 🚀 Quick Deploy for Gym Testing

### Option 1: Netlify (Recommended for MVP testing)

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Get instant URL like: `https://gracious-darwin-abc123.netlify.app`

3. **Or use Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### Option 2: Vercel

1. **Deploy with Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Or connect GitHub repo** at [vercel.com](https://vercel.com)

## 📱 Mobile Testing Setup

### PWA Installation
The app works as a Progressive Web App:

1. **Open in mobile browser** (Chrome/Safari)
2. **Add to Home Screen**:
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen
3. **Launch like native app**

### QR Code Sharing
Generate QR codes for easy gym sharing:
- Use [qr-code-generator.com](https://qr-code-generator.com)
- Share your deployment URL
- Gym members can scan and install instantly

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 💾 Data Management for Testing

### Development Tools (via Navigation Menu)
- **Export Data**: Download JSON backup
- **Add Sample Data**: Populate with test sessions
- **Show Data Stats**: View current data summary
- **Reset to Onboarding**: Clear all data

### Data Persistence
- **Local Storage**: Data persists per device/browser
- **Export/Import**: JSON backup for data transfer
- **URL Sharing**: Share test data via URL parameters

### For Gym Testing
1. **Set up test account** with sample data
2. **Export data** as backup
3. **Share URL** with gym members
4. **Collect feedback** on metrics and UX

## 🏗️ Production Considerations

### Backend Integration (Future)
Current MVP uses localStorage. For production:

1. **User Authentication**: Firebase Auth, Supabase, or custom
2. **Database**: PostgreSQL, MongoDB, or Firebase Firestore
3. **API**: REST or GraphQL endpoint
4. **Real-time Sync**: WebSocket or Server-Sent Events

### Recommended Stack for V2:
- **Frontend**: Current React + Vite setup ✅
- **Backend**: Supabase (free tier: 50k monthly active users)
- **Auth**: Supabase Auth with social logins
- **Database**: PostgreSQL (included with Supabase)
- **Storage**: Supabase Storage for future features
- **Analytics**: Mixpanel or PostHog

### Environment Variables
Create `.env` file for production:
```
VITE_API_URL=https://your-api.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing Checklist

### Core Functionality
- [ ] Account creation flow
- [ ] Climb tracking (all input types)
- [ ] Session aggregation
- [ ] CRS calculation progression
- [ ] Load ratio tracking
- [ ] Recommended training updates
- [ ] Data export/import

### Mobile Experience
- [ ] Touch interactions
- [ ] Responsive design
- [ ] PWA installation
- [ ] Offline functionality (future)

### Edge Cases
- [ ] No data state
- [ ] Invalid input handling
- [ ] localStorage quota exceeded
- [ ] Network failures (future)

## 📊 Metrics to Track

### User Engagement
- Sessions per week
- Climbs logged per session
- Feature usage (CRS, recommendations)
- Retention (daily/weekly active users)

### App Performance
- Load times
- Metric calculation performance
- Storage usage
- Error rates

## 🎯 MVP Success Criteria

1. **Onboarding**: Users can create accounts and complete setup
2. **Tracking**: Climb logging works smoothly on mobile
3. **Metrics**: CRS and load ratios calculate correctly
4. **Recommendations**: Training advice updates based on data
5. **Data**: Export/import works for testing
6. **Mobile**: App installs and works offline-first

## 🚀 App Store Preparation (Future)

### iOS (React Native or Capacitor)
- Apple Developer Account ($99/year)
- App Store guidelines compliance
- TestFlight beta testing

### Android (React Native or Capacitor)
- Google Play Console account ($25 one-time)
- Play Store guidelines compliance
- Internal testing track

### Web App (Current)
- PWA optimization
- App manifest
- Service worker for offline
- iOS/Android shortcuts support

---

**Ready to deploy! 🧗‍♂️**

Your Colossus MVP is now production-ready with:
✅ Real CRS calculations
✅ Dynamic load monitoring  
✅ Personalized training recommendations
✅ Progressive metric disclosure
✅ Data export/import
✅ Mobile-optimized UX
✅ Deployment configurations
