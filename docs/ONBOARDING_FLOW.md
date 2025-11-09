# POGO Onboarding Flow

## Overview
Streamlined 2-step onboarding process that collects minimal data to get users climbing faster while still providing personalized recommendations from day one.

## User Flow

### Step 1: Authentication
- **Component:** `AuthPage.jsx`
- **Purpose:** Collect email/password for account creation
- **Action:** Creates auth user + minimal profile in database
- **Duration:** ~30 seconds

### Step 2: Quick Setup (Optional)
- **Component:** `QuickSetup.jsx`
- **Purpose:** Personalize training recommendations
- **Collects:**
  - **Flash Grade** (V0-V15): What grade do you typically flash?
  - **Typical Volume** (5-50 climbs): How many problems per session?
- **Action:** 
  - Saves preferences to user profile
  - Generates 3 synthetic sessions to seed baseline data
  - Marks `onboarding_completed: true`
- **Can Skip:** Yes - users can skip and start tracking immediately
- **Duration:** ~45 seconds (or instant if skipped)

### Step 3: Dashboard
- User lands on main dashboard ready to log their first real session
- If Quick Setup was completed, CRS and Load Ratio have baseline data to work with
- If skipped, metrics will populate after first real session

---

## Database Schema Changes

### Users Table (Updated)
```sql
ALTER TABLE users 
  ADD COLUMN flash_grade TEXT,
  ADD COLUMN typical_volume INTEGER DEFAULT 15,
  ADD COLUMN onboarding_completed BOOLEAN DEFAULT false,
  ALTER COLUMN name DROP NOT NULL;
```

**New Fields:**
- `flash_grade`: User's typical flash grade (V0-V15)
- `typical_volume`: Average climbs per session
- `onboarding_completed`: Tracks if user finished/skipped Quick Setup
- `name`: Now optional (can be filled in Account page later)

### Sessions Table (Updated)
```sql
ALTER TABLE sessions
  ADD COLUMN is_synthetic BOOLEAN DEFAULT false;
```

**New Field:**
- `is_synthetic`: Marks sessions generated during onboarding (for future filtering if needed)

---

## Synthetic Session Generation

When a user completes Quick Setup, the system generates **3 synthetic sessions** to provide baseline data for CRS and Load Ratio calculations:

### Session Distribution
- **Session 1:** 9 days ago
- **Session 2:** 5 days ago  
- **Session 3:** 2 days ago

### Climb Generation Logic
Each session contains climbs that:
- **Volume:** 80-100% of user's stated typical volume
- **Grade Distribution:** Mostly around flash grade ±2 grades
  - Some easier climbs (flash grade -2)
  - Most at flash grade (70% flash rate)
  - Some harder climbs (flash grade +1 to +2)
- **RPE:** Calibrated based on grade relative to flash grade
  - Easy climbs: RPE 3-4
  - Flash-level climbs: RPE 5-6
  - Hard climbs: RPE 7-8
  - Project climbs: RPE 9-10
- **Attempts:** Realistic attempt counts
  - Easier climbs: 1 attempt (flash)
  - Flash-level: 1-2 attempts (70% flash rate)
  - Harder: 2-4 attempts
  - Projects: 3-7 attempts
- **Variety:** Random wall angles (slab/vertical/overhang) and styles (simple/powerful/technical)

### Why This Works
- **Immediate Readiness:** CRS can calculate recovery and load trends from day 1
- **Realistic Baseline:** Climbs distributed realistically to match user's stated ability
- **Load Management:** Provides 7-day and 28-day load history for ACWR
- **No Pressure:** Users see familiar grades and can start logging real sessions immediately

---

## Implementation Files

### New Files
- **`src/components/onboarding/QuickSetup.jsx`**: New optional onboarding screen
  - Grade selector (V0-V15 grid)
  - Volume slider (5-50 climbs)
  - Skip button
  - Synthetic session generation

### Modified Files
- **`src/components/onboarding/OnboardingApp.jsx`**: Updated flow
  - Removed `PersonalInfo` and `PhysicalStats` from flow
  - Now: Auth → QuickSetup → Dashboard (2 steps instead of 3)

- **`src/contexts/AuthContext.jsx`**: Enhanced signup
  - Creates minimal user profile on signup
  - Updated `hasProfile` check to verify `onboarding_completed`
  - Profile fields now optional (name, age, gender, etc.)

### Removed from Onboarding Flow
- ~~`PersonalInfo.jsx`~~ - No longer required for signup
- ~~`PhysicalStats.jsx`~~ - No longer required for signup

*Note: These components are preserved and can be added to Account page for optional demographic data collection*

---

## Testing Checklist

- [ ] New user signup creates minimal profile
- [ ] Quick Setup displays grade selector (V0-V15)
- [ ] Volume slider works (5-50 range)
- [ ] "Get Started" button disabled until grade selected
- [ ] Skip button works and marks onboarding complete
- [ ] Completing Quick Setup generates 3 synthetic sessions
- [ ] Synthetic sessions have realistic climb data
- [ ] Dashboard loads after Quick Setup/Skip
- [ ] CRS calculates properly with synthetic data
- [ ] Load Ratio shows valid ranges with synthetic data
- [ ] Existing users not affected (already have profiles)

---

## User Benefits

### Speed
- **Before:** 3-step signup with personal/physical data collection (~3-5 minutes)
- **After:** 2-step signup with optional Quick Setup (~1-2 minutes, or 30 seconds if skipped)

### Personalization
- Flash grade and volume inform:
  - Initial CRS calculations
  - Load Ratio baselines
  - Training recommendations
  - XP/leveling expectations

### Privacy
- No forced demographic data collection
- Users can add optional info later on Account page
- Minimal data to get started climbing

### Flexibility
- Can skip Quick Setup entirely
- Can update flash grade/volume in settings later
- Synthetic sessions marked for potential future filtering

---

## Future Enhancements

### Potential Additions
1. **Recalibration:** Allow users to update flash grade/volume and regenerate baseline
2. **Onboarding Tips:** Show tooltips on first dashboard visit
3. **Social Proof:** Show example session cards during Quick Setup
4. **Progress Preview:** Show "You'll start at Level X" based on flash grade
5. **Anonymous Mode:** Allow completely anonymous usage without email

### Analytics to Track
- Quick Setup completion rate
- Skip rate
- Correlation between Quick Setup completion and retention
- Average time to first real session (Quick Setup vs. Skip)

---

## Migration Notes

### For Existing Users
- Already have `onboarding_completed: true` (implicitly)
- Run this SQL to explicitly mark them:
```sql
UPDATE users 
SET onboarding_completed = true 
WHERE onboarding_completed IS NULL;
```

### For Development Testing
- Clear localStorage to reset auth state
- Drop and recreate user accounts in Supabase
- Test both "Complete Quick Setup" and "Skip" flows
- Verify synthetic sessions generate correctly

---

*Built with ❤️ for POGO*

