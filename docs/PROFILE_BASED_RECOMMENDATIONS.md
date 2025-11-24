# Profile-Based Recommendations System

**Date:** November 24, 2025  
**Status:** ✅ **IMPLEMENTED - READY FOR TESTING**  
**Priority:** 🔴 **CRITICAL - CORE SAFETY FEATURE**

---

## 🎯 Overview

This system provides **personalized, conservative recommendations** for new users based on their onboarding profile data, preventing the injury risk of one-size-fits-all guidance.

### Core Safety Philosophy

**PRIMARY GOAL: PREVENT OVERTRAINING AND INJURY**

The system is designed to be **deliberately conservative** for new users because:
1. We don't know if they're detrained (returning from a break)
2. Users often overestimate their capacity
3. Better to under-recommend and build up than over-recommend and cause injury
4. Real session data will calibrate the system within 3 sessions

---

## 🔄 System Flow

```
User Signs Up
     ↓
Onboarding: Collects flash_grade + typical_volume
     ↓
Profile-Based Recommendations (Sessions 0-2)
     - Conservative: 60-68% of stated volume
     - RPE capped at ≤6 for ALL users
     - Clear messaging about calibration
     ↓
Synthetic Sessions Generated (optional, for baseline)
     ↓
Real Sessions Tracked (1, 2, 3...)
     ↓
Session-Based CRS System Takes Over (Session 3+)
     - Uses actual training data
     - Full algorithm with recovery, load ratio, fatigue
     - Personalized to their actual capacity
```

---

## 🛡️ Conservative Safety Margins

### Volume Calculation

```javascript
// User states in onboarding: "I typically do 20 climbs per session"

Step 1: Apply detraining buffer
baseVolume = 20 * 0.75 = 15 climbs

Step 2: Apply conservative range
volumeMin = 15 * 0.8 = 12 climbs
volumeMax = 15 * 0.9 = 13 climbs

RESULT: Recommend 12-13 climbs
ACTUAL: 60-65% of their stated typical volume
```

### RPE Limitation

```javascript
// STRICT CAP regardless of grade level
rpeCap = '≤6'

// Why?
// - Prevents injury before we have real capacity data
// - Even strong climbers (V10+) start conservatively
// - Real CRS system will unlock higher intensities after 3 sessions
```

### Grade-Adjusted Load (for future CRS calibration)

```javascript
gradeLoadFactor = 1 + (gradeNum * 0.08)

// Examples:
V0: 1 + (0 * 0.08) = 1.0x
V3: 1 + (3 * 0.08) = 1.24x
V7: 1 + (7 * 0.08) = 1.56x

// Gentler than real session load calculations
// Used only for baseline estimation, not recommendations
```

---

## 📊 User Type Examples

### Beginner: V0-V2

**Onboarding Input:**
- Flash Grade: V1
- Typical Volume: 12 climbs

**Profile-Based Recommendations (Sessions 0-2):**
```javascript
{
  volumeCap: "7-8",        // 60% of stated
  rpeCap: "≤6",            // Capped
  focus: "Establish movement patterns and consistency",
  style: "technical",
  note: "Personalized from your profile • Will adapt after 3 sessions"
}
```

**Safety Rationale:**
- Beginners often overestimate capacity
- Focus on movement quality over volume
- Build confidence before intensity
- Prevent early burnout/injury

---

### Intermediate: V3-V5

**Onboarding Input:**
- Flash Grade: V4
- Typical Volume: 18 climbs

**Profile-Based Recommendations (Sessions 0-2):**
```javascript
{
  volumeCap: "10-12",      // 60% of stated
  rpeCap: "≤6",            // Capped
  focus: "Build capacity while establishing baseline",
  style: "endurance",
  note: "Personalized from your profile • Will adapt after 3 sessions"
}
```

**Safety Rationale:**
- May be coming back from break
- RPE 6 keeps intensity controlled
- Volume allows for technique practice
- Sets up proper baseline for CRS

---

### Advanced: V6+

**Onboarding Input:**
- Flash Grade: V7
- Typical Volume: 25 climbs

**Profile-Based Recommendations (Sessions 0-2):**
```javascript
{
  volumeCap: "15-16",      // 60% of stated
  rpeCap: "≤6",            // Still capped!
  focus: "Maintain technique while establishing baseline",
  style: "technical",      // Controlled style
  note: "Personalized from your profile • Will adapt after 3 sessions"
}
```

**Safety Rationale:**
- **CRITICAL:** Even V7 climbers start conservatively
- Don't know if they're detrained
- RPE ≤6 prevents overconfident projecting
- Higher volume allows quality movement
- CRS will unlock intensity after 3 sessions

---

## 🔄 Transition to Session-Based System

### Session 1-2: Profile-Based
- Uses conservative formulas
- Shows calibration message
- Encourages tracking real data

### Session 3: **Automatic Handoff**
- CRS calculation activates (requires 3 sessions)
- Profile-based baseline is retired
- Real session data drives recommendations
- Full algorithm with recovery, fatigue, load ratio

### Session 5+: Full System
- Load Ratio activates (requires 5 sessions)
- Complete injury prevention system
- Personalized to actual training patterns

---

## 💡 Key Features

### 1. **Progressive Disclosure**
```javascript
// UI shows clear messaging
if (sessions < 3) {
  "Building your baseline - start conservatively"
  "Personalized from your profile • Will adapt after 3 sessions"
}
```

### 2. **No Data Fallback**
```javascript
// If user skips onboarding or profile incomplete
{
  volumeCap: "8-12",
  rpeCap: "≤6",
  focus: "Build your baseline safely",
  note: "Complete onboarding for personalized recommendations"
}
```

### 3. **Synthetic Sessions (Optional)**
- QuickSetup generates 3 synthetic training sessions
- Spreads them over 7-10 days
- Realistic climb data based on flash grade
- Allows immediate CRS calculation
- **Note:** This is for testing/demo - real users should track real sessions

---

## 🧪 Testing Scenarios

### Scenario 1: Brand New Beginner

**Setup:**
```javascript
const profile = {
  flash_grade: 'V0',
  typical_volume: 8
};
const sessions = [];
```

**Expected Output:**
```javascript
{
  volumeCap: "4-5",  // 60% of 8 = conservative start
  rpeCap: "≤6",
  focus: "Establish movement patterns and consistency",
  isProfileBased: true,
  calibrationMessage: "Building your baseline - start conservatively"
}
```

**Validation:**
- ✅ Very conservative volume (4-5 climbs)
- ✅ RPE capped at 6
- ✅ Technical focus
- ✅ Clear messaging about calibration

---

### Scenario 2: Intermediate Returning from Break

**Setup:**
```javascript
const profile = {
  flash_grade: 'V4',
  typical_volume: 20
};
const sessions = [];
```

**Expected Output:**
```javascript
{
  volumeCap: "12-13",  // 60-65% of stated
  rpeCap: "≤6",
  focus: "Build capacity while establishing baseline",
  isProfileBased: true,
  note: "Personalized from your profile • Will adapt after 3 sessions"
}
```

**Validation:**
- ✅ Moderate volume (12-13, not 20)
- ✅ RPE still capped (don't know detraining status)
- ✅ Endurance focus
- ✅ Will unlock after real sessions

---

### Scenario 3: Advanced Climber

**Setup:**
```javascript
const profile = {
  flash_grade: 'V8',
  typical_volume: 30
};
const sessions = [];
```

**Expected Output:**
```javascript
{
  volumeCap: "18-20",  // Still conservative (60-68%)
  rpeCap: "≤6",        // STILL CAPPED
  focus: "Maintain technique while establishing baseline",
  style: "technical",  // Controlled approach
  isProfileBased: true
}
```

**Validation:**
- ✅ Higher volume reflects experience
- ✅ But RPE still capped (safety first!)
- ✅ No projecting until we see real data
- ✅ Clear it's temporary calibration

---

### Scenario 4: After 3 Real Sessions

**Setup:**
```javascript
const profile = {
  flash_grade: 'V5',
  typical_volume: 20
};
const sessions = [
  { climbList: [15 climbs, avgRPE: 6] },
  { climbList: [18 climbs, avgRPE: 7] },
  { climbList: [16 climbs, avgRPE: 6.5] }
];
```

**Expected Output:**
```javascript
{
  volumeCap: "15-18",  // Based on REAL data
  rpeCap: "7-8",       // CRS-based (no longer capped at 6)
  focus: "Balanced volume and intensity",
  // NO isProfileBased flag
  // NO calibration message
  // FULL CRS SYSTEM ACTIVE
}
```

**Validation:**
- ✅ Profile-based system is retired
- ✅ Recommendations based on actual capacity
- ✅ RPE can exceed 6 based on readiness
- ✅ Smooth, invisible transition

---

## 🚨 Safety Checks

### Red Flags to Monitor

1. **Profile recommendations TOO aggressive**
   - If volumeCap > 70% of stated: REDUCE
   - If rpeCap > 6: CAP IT

2. **Unclear messaging**
   - Users should know this is temporary
   - "Will adapt after 3 sessions" must be visible

3. **No transition to CRS**
   - After 3 sessions, check `source === 'sessions'`
   - Profile baseline should NOT be used

4. **Missing profile data**
   - Should gracefully fall back to generic conservative
   - Never show error or block user

---

## 📈 Expected User Experience

### First Session (New User)
```
User: "I flash V5 and do 20 climbs typically"
System: "Start with 12-13 climbs, RPE ≤6"
User thinks: "That seems light, but okay..."
```

### Second Session
```
User: "That felt easy, can I do more?"
System: "12-13 climbs, RPE ≤6" (still conservative)
User: tracks 14 climbs at RPE 6
```

### Third Session
```
System: *Calculates CRS from 3 real sessions*
System: "15-18 climbs, RPE 7-8" (based on actual data)
User: "Nice! The app learned my capacity"
```

### Weeks Later
```
System: Full CRS, Load Ratio, Fatigue tracking
User: "This app really gets me. The recommendations are spot-on."
```

---

## 🔍 Code Integration Points

### 1. metrics.js - Core Logic
```javascript
// New functions:
- calculateProfileBasedBaseline(profile)
- getProfileBasedRecommendations(baseline, userProfile)

// Modified functions:
- calculatePersonalBaseline(sessions, userProfile)
- getCapacityRecommendations(crs, loadRatio, sessions, userProfile)
```

### 2. App.jsx - Metric Calculation
```javascript
// Pass profile to recommendations
const recommendations = getCapacityRecommendations(
  calculatedCRS,
  calculatedLoadRatio,
  sessions,
  profile  // NEW: Profile data for new users
);
```

### 3. Dashboard.jsx - UI Integration
```javascript
<TodaysTraining 
  userData={userData}
  userProfile={profile}  // NEW: Pass profile
  // ... other props
/>
```

### 4. TodaysTraining.jsx - Display
```javascript
// Receives profile, passes to getCapacityRecommendations
const capacityRec = getCapacityRecommendations(
  crsData,
  loadRatioData,
  sessions,
  userProfile  // NEW: Profile for personalized recs
);
```

---

## 🎉 Success Criteria

### Quantitative
- [ ] V0-V2 users start at 60% of stated volume
- [ ] V3-V5 users start at 60-65% of stated volume
- [ ] V6+ users start at 65-68% of stated volume
- [ ] ALL users capped at RPE ≤6 for first 3 sessions
- [ ] CRS system activates automatically at session 3
- [ ] Profile baseline never used after session 3

### Qualitative
- [ ] New users feel guidance is "safe but not insulting"
- [ ] Intermediate users appreciate conservative start
- [ ] Advanced users understand it's temporary calibration
- [ ] All users feel "the app learned my capacity" by session 3

---

## 🔒 Safety Guarantees

### What This System PREVENTS

1. ✅ **Overtraining new users**
   - Conservative volume prevents overload
   - RPE cap prevents high-intensity injury

2. ✅ **Ignoring detraining**
   - Assumes users might be returning from break
   - Builds back gradually

3. ✅ **One-size-fits-all recommendations**
   - V0 and V7 get different guidance
   - But both start conservatively

4. ✅ **Dangerous confidence**
   - Clear messaging that system is calibrating
   - No false precision ("You can do exactly 23 climbs!")

### What This System ENABLES

1. ✅ **Personalized from day one**
   - Uses onboarding data immediately
   - Better than generic "12 climbs" for everyone

2. ✅ **Smooth progression**
   - Conservative start → real data → full system
   - No jarring transitions

3. ✅ **User trust**
   - Transparent about calibration period
   - Delivers on promise to adapt

4. ✅ **Injury prevention**
   - Core mission of the platform
   - Safety > Performance for new users

---

## 📝 Release Notes (User-Facing)

```markdown
## Personalized Recommendations from Day One

Your first training recommendations are now customized based on your 
onboarding profile:

✨ Conservative volume based on your stated typical session
✨ Experience-adjusted focus (technique, endurance, or power)
✨ Safe intensity caps to prevent overtraining
✨ Automatic adaptation after 3 real sessions

The app will learn your true capacity as you log sessions, providing 
increasingly accurate recommendations tailored to your unique training pattern.

**Safety First:** Initial recommendations are deliberately conservative 
to allow for potential detraining and build a safe baseline.
```

---

## 🔮 Future Enhancements (Post-Launch)

1. **Grade-Relative Load Scaling**
   - Adjust load calculations based on max grade vs flash grade
   - More accurate fatigue estimation

2. **Recovery Time Estimation**
   - "If you rest 1 more day, readiness = 85%"
   - Help users plan training blocks

3. **Profile Confidence Indicators**
   - Track how well profile-based estimates match reality
   - Improve algorithm over time

4. **Onboarding Refinement**
   - Add "How long since last climbing?" question
   - Adjust conservatism based on recency

---

## ✅ Implementation Checklist

- [x] Add `calculateProfileBasedBaseline()` to metrics.js
- [x] Add `getProfileBasedRecommendations()` to metrics.js
- [x] Modify `calculatePersonalBaseline()` to accept profile
- [x] Modify `getCapacityRecommendations()` to use profile
- [x] Update App.jsx to pass profile to recommendations
- [x] Update Dashboard.jsx to pass profile to TodaysTraining
- [x] Update TodaysTraining.jsx to accept and use profile
- [ ] Manual testing: V0-V2 user
- [ ] Manual testing: V3-V5 user
- [ ] Manual testing: V6+ user
- [ ] Verify transition at session 3
- [ ] Verify synthetic sessions work with system
- [ ] Update user-facing documentation

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Implementation Complete, Testing Pending

