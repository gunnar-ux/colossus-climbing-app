# Load Management System - Test Scenarios

This document provides concrete test scenarios to validate the improvements made to the CRS and Load Ratio calculations.

---

## 🧪 Test Scenario 1: The Comeback Climber

**Profile:** Took 3 weeks off due to injury/travel, returning to gym

**Test Data:**
```javascript
const sessions = [
  // 3 weeks ago - last session before break
  { 
    timestamp: Date.now() - (21 * 24 * 60 * 60 * 1000),
    avgRPE: 7,
    climbList: [
      { grade: 'V5', rpe: 7, attempts: 2, style: 'Power', angle: 'Overhang' },
      { grade: 'V4', rpe: 6, attempts: 1, style: 'Power', angle: 'Overhang' }
    ]
  },
  // Today - first session back
  {
    timestamp: Date.now() - (1 * 60 * 60 * 1000),
    avgRPE: 6,
    climbList: [
      { grade: 'V3', rpe: 5, attempts: 1, style: 'Technical', angle: 'Vertical' },
      { grade: 'V3', rpe: 6, attempts: 2, style: 'Technical', angle: 'Vertical' }
    ]
  }
];
```

**Expected Results:**

| Metric | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| Load Recovery | 100% | ~72% | ✅ Detects detraining |
| CRS Overall | ~95% | ~78% | ✅ More conservative |
| Recommendation | "Maximum capacity" | "Train smart" | ✅ Safer guidance |

**Why This Matters:** Old system would encourage max effort after 3 weeks off → injury risk. New system recommends gradual return.

---

## 🧪 Test Scenario 2: Project Burnout Cycle

**Profile:** 7 consecutive days projecting V10, high attempts, high RPE

**Test Data:**
```javascript
const sessions = Array.from({ length: 7 }, (_, i) => ({
  timestamp: Date.now() - ((7 - i) * 24 * 60 * 60 * 1000),
  avgRPE: 8.5,
  climbList: [
    { grade: 'V10', rpe: 9, attempts: 5, style: 'Power', angle: 'Overhang' },
    { grade: 'V9', rpe: 9, attempts: 4, style: 'Power', angle: 'Overhang' },
    { grade: 'V8', rpe: 8, attempts: 3, style: 'Power', angle: 'Overhang' }
  ]
}));

// Day 8: One easy session
sessions.push({
  timestamp: Date.now() - (2 * 60 * 60 * 1000),
  avgRPE: 4,
  climbList: [
    { grade: 'V3', rpe: 4, attempts: 1, style: 'Simple', angle: 'Slab' }
  ]
});
```

**Expected Results:**

| Metric | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| Cumulative Fatigue | ~60% (last RPE=4) | ~25% | ✅ Detects burnout |
| Load Ratio | ~1.8x | ~1.8x | Same (correct) |
| CRS Overall | ~65% | ~40% | ✅ Warns appropriately |
| Recommendation | "Moderate training" | "Recovery focus" | ✅ Prevents injury |

**Why This Matters:** Old system only looked at last easy session. New system recognizes cumulative damage from 7 hard days.

---

## 🧪 Test Scenario 3: Weekend Warrior

**Profile:** Consistent 2x per week climber (Saturday/Sunday), moderate intensity

**Test Data:**
```javascript
// 4 weeks of 2x/week climbing
const sessions = [];
for (let week = 0; week < 4; week++) {
  // Saturday
  sessions.push({
    timestamp: Date.now() - ((3-week) * 7 + 5) * 24 * 60 * 60 * 1000,
    avgRPE: 6.5,
    climbList: Array(15).fill(null).map((_, i) => ({
      grade: i < 10 ? 'V4' : 'V5',
      rpe: 7,
      attempts: 2,
      style: 'Power',
      angle: 'Overhang'
    }))
  });
  
  // Sunday
  sessions.push({
    timestamp: Date.now() - ((3-week) * 7 + 6) * 24 * 60 * 60 * 1000,
    avgRPE: 6.5,
    climbList: Array(15).fill(null).map((_, i) => ({
      grade: i < 10 ? 'V3' : 'V4',
      rpe: 6,
      attempts: 2,
      style: 'Technical',
      angle: 'Vertical'
    }))
  });
}
```

**Expected Results:**

| Metric | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| Load Ratio | ~1.6x ⚠️ | ~1.0x ✅ | ✅ Normalized for frequency |
| Status | "Elevated load" | "Optimal training" | ✅ Accurate feedback |
| Message | "Reduce volume" | "Maintain pattern" | ✅ Encouraging |

**Why This Matters:** Old system penalized irregular schedules. New system recognizes 2x/week is their normal pattern.

---

## 🧪 Test Scenario 4: Flash vs Project Load

**Profile:** Two sessions with same climb count, different efforts

**Test Data:**
```javascript
// Session A: 20 flashes at comfortable grade
const flashSession = {
  timestamp: Date.now() - (48 * 60 * 60 * 1000),
  avgRPE: 5,
  climbList: Array(20).fill(null).map(() => ({
    grade: 'V4',
    rpe: 5,
    attempts: 1, // All flashed!
    style: 'Technical',
    angle: 'Vertical'
  }))
};

// Session B: 15 projects at limit grade
const projectSession = {
  timestamp: Date.now() - (48 * 60 * 60 * 1000),
  avgRPE: 8,
  climbList: Array(15).fill(null).map(() => ({
    grade: 'V8',
    rpe: 8,
    attempts: 5, // All hard projects!
    style: 'Power',
    angle: 'Overhang'
  }))
};
```

**Expected Results:**

| Session Type | Old Load Calc | New Load Calc | Difference |
|--------------|---------------|---------------|------------|
| Flash (20 climbs) | ~500 | ~500 | Baseline |
| Project (15 climbs) | ~1,620 | ~2,125 | +31% more load |

**Formula Breakdown (Project Session):**
```
Old: 15 climbs × [(9 × 8 × 1.2) × 1.4] = 1,814
     gradePoints: 9 (V8)
     RPE: 8
     styleMultiplier: 1.2 (power)
     attemptFactor: 1.4 (5 attempts, linear)

New: 15 climbs × [(9 × 8 × 1.2) × 1.75] = 2,268
     attemptFactor: 1.75 (5 attempts, exponential)
     
Difference: +25% more load recognized for projecting!
```

**Why This Matters:** Projecting is much more taxing. New system correctly penalizes high-attempt climbing.

---

## 🧪 Test Scenario 5: Minimal Baseline Issue

**Profile:** Very light climber, 2 easy sessions in last month

**Test Data:**
```javascript
const sessions = [
  // 25 days ago
  {
    timestamp: Date.now() - (25 * 24 * 60 * 60 * 1000),
    avgRPE: 5,
    climbList: Array(8).fill(null).map(() => ({
      grade: 'V1',
      rpe: 5,
      attempts: 1,
      style: 'Simple',
      angle: 'Slab'
    }))
  },
  // 18 days ago
  {
    timestamp: Date.now() - (18 * 24 * 60 * 60 * 1000),
    avgRPE: 5,
    climbList: Array(8).fill(null).map(() => ({
      grade: 'V1',
      rpe: 5,
      attempts: 1,
      style: 'Simple',
      angle: 'Slab'
    }))
  },
  // Today - moderate session
  {
    timestamp: Date.now() - (1 * 60 * 60 * 1000),
    avgRPE: 6,
    climbList: Array(12).fill(null).map(() => ({
      grade: 'V2',
      rpe: 6,
      attempts: 2,
      style: 'Technical',
      angle: 'Vertical'
    }))
  }
];
```

**Expected Results:**

| Metric | Old System | New System | Improvement |
|--------|------------|------------|-------------|
| Chronic Load | ~120 (2 sessions) | ~120 | Same |
| Expected Weekly | ~30 | 50 (min threshold) | ✅ Floor applied |
| Acute Load | ~180 (today) | ~180 | Same |
| Load Ratio | 6.0x ⚠️ | 3.6x ⚠️ | ✅ Still elevated but reasonable |
| Status | "DANGER ZONE" | "High - monitor" | ✅ Less alarming |

**Why This Matters:** Very casual climbers don't get scared away by extreme warnings for normal sessions.

---

## 🧪 Test Scenario 6: Recovery Decay Validation

**Profile:** Single climber at different time intervals

**Test Data:**
```javascript
const testRecoveryAtHours = [12, 24, 48, 72, 120, 168, 336];
// 12h, 1d, 2d, 3d, 5d, 7d, 14d

const session = {
  timestamp: Date.now() - (12 * 60 * 60 * 1000), // 12 hours ago initially
  avgRPE: 7,
  climbList: [...]
};
```

**Expected Recovery Scores:**

| Hours Since | Days | Old System | New System | Interpretation |
|-------------|------|------------|------------|----------------|
| 12 | 0.5 | 25% | 25% | Still fatigued |
| 24 | 1.0 | 50% | 50% | Partial recovery |
| 48 | 2.0 | 100% | 100% | ✅ Optimal recovery |
| 72 | 3.0 | 100% | 97% | Peak maintained |
| 120 | 5.0 | 100% | 89% | ✅ Slight decay |
| 168 | 7.0 | 100% | 83% | ✅ Detraining visible |
| 336 | 14.0 | 100% | 70% | ✅ Clear detraining |

**Why This Matters:** System now discourages max effort after long layoffs.

---

## 📊 How to Run These Tests

### Manual Testing (Recommended)
1. Open your app in development mode
2. Use browser console to log CRS/Load Ratio data
3. Manually create sessions with the test data above
4. Verify the metrics match expected ranges

### Automated Testing (Future)
```javascript
// Example test structure
describe('Load Management Improvements', () => {
  test('Scenario 1: Comeback Climber', () => {
    const sessions = [...]; // Test data
    const crs = calculateCRS(sessions.length, totalClimbs, sessions);
    expect(crs.score).toBeLessThan(85); // Should not suggest max effort
  });
  
  test('Scenario 2: Project Burnout', () => {
    const sessions = [...]; // 7 hard days + 1 easy
    const crs = calculateCRS(sessions.length, totalClimbs, sessions);
    expect(crs.components.cumulativeFatigue).toBeLessThan(40);
  });
  
  // ... more tests
});
```

---

## ✅ Acceptance Criteria

All scenarios should pass these checks:

- [ ] Scenario 1: CRS < 85% after 21-day break
- [ ] Scenario 2: Cumulative fatigue < 40% after 7 hard days
- [ ] Scenario 3: Load ratio 0.9-1.1x for consistent 2x/week climber
- [ ] Scenario 4: Project load > flash load by at least 20%
- [ ] Scenario 5: Load ratio < 5.0x for minimal baseline case
- [ ] Scenario 6: Recovery decay visible after 7+ days

---

## 🚨 Red Flags to Watch For

If you see these during testing, investigate:

1. **CRS = 100% after 14+ days off** → Recovery decay not working
2. **Load ratio > 2.0x for consistent training** → Frequency adjustment failed
3. **Same load for flash vs project session** → Attempt factor not applied
4. **Cumulative fatigue = high after one easy session** → Check weighting logic
5. **Negative or NaN values** → Edge case handling needed

---

## 📝 Testing Checklist

- [ ] Create test sessions for all 6 scenarios
- [ ] Verify CRS calculations match expected ranges
- [ ] Verify Load Ratio calculations match expected ranges
- [ ] Check that recommendations align with metrics
- [ ] Test edge cases (0 sessions, missing data, etc.)
- [ ] Verify no performance degradation (< 100ms calculation time)
- [ ] Check console for any errors or warnings
- [ ] Test on mobile device (iOS/Android)
- [ ] Verify UI displays updated metrics correctly

---

**Next Steps:**
1. Run through each scenario manually
2. Document any unexpected behavior
3. If all tests pass → Ready for beta testing
4. If issues found → Review specific calculation logic

**Document Version:** 1.0  
**Last Updated:** November 20, 2025

