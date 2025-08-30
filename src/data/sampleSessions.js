// Sample session data extracted from sessions.html
// Preserves exact data structure for sessions view

export const sampleSessions = [
  {
    date: 'Now',
    timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    startTime: Date.now() - (3 * 60 * 60 * 1000), // 3 hours ago
    endTime: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    duration: '1h 45m',
    climbs: 18,
    medianGrade: 'V4',
    style: 'Power',
    avgRPE: 6.8,
    styles: [
      {label:'Power', val:40},
      {label:'Technical', val:35},
      {label:'Simple', val:25}
    ],
    angles: [
      {label:'Overhang', val:60},
      {label:'Vertical', val:30},
      {label:'Slab', val:10}
    ],
    grades: [
      {label:'V3', val:20},
      {label:'V4', val:45},
      {label:'V5', val:30},
      {label:'V6', val:5}
    ],
    climbList: [
      {grade:'V4', angle:'Overhang', style:'Power', rpe:7, attempts:1, timestamp: Date.now() - (3 * 60 * 60 * 1000)},
      {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:2, timestamp: Date.now() - (2.8 * 60 * 60 * 1000)},
      {grade:'V3', angle:'Vertical', style:'Technical', rpe:6, attempts:1, timestamp: Date.now() - (2.6 * 60 * 60 * 1000)},
      {grade:'V4', angle:'Vertical', style:'Power', rpe:7, attempts:1, timestamp: Date.now() - (2.4 * 60 * 60 * 1000)},
      {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:3, timestamp: Date.now() - (2.2 * 60 * 60 * 1000)},
    ]
  },
  {
    date: 'Oct 28',
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    startTime: Date.now() - (2 * 24 * 60 * 60 * 1000),
    endTime: Date.now() - (2 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000),
    duration: '2h 10m',
    climbs: 22,
    medianGrade: 'V3',
    style: 'Technical',
    avgRPE: 6.5,
    styles: [
      {label:'Technical', val:45},
      {label:'Power', val:35},
      {label:'Simple', val:20}
    ],
    angles: [
      {label:'Vertical', val:50},
      {label:'Overhang', val:35},
      {label:'Slab', val:15}
    ],
    grades: [
      {label:'V2', val:15},
      {label:'V3', val:50},
      {label:'V4', val:30},
      {label:'V5', val:5}
    ],
    climbList: [
      {grade:'V3', angle:'Slab', style:'Technical', rpe:6, attempts:1, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)},
      {grade:'V4', angle:'Vertical', style:'Technical', rpe:7, attempts:2, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) + (20 * 60 * 1000)},
      {grade:'V2', angle:'Slab', style:'Simple', rpe:5, attempts:1, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) + (40 * 60 * 1000)},
      {grade:'V3', angle:'Vertical', style:'Technical', rpe:6, attempts:1, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)},
      {grade:'V4', angle:'Overhang', style:'Power', rpe:7, attempts:2, timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) + (80 * 60 * 1000)},
    ]
  },
  {
    date: 'Oct 26 (2:30pm)',
    timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
    startTime: Date.now() - (4 * 24 * 60 * 60 * 1000),
    endTime: Date.now() - (4 * 24 * 60 * 60 * 1000) + (1.5 * 60 * 60 * 1000),
    duration: '1h 30m',
    climbs: 16,
    medianGrade: 'V4',
    style: 'Endurance',
    avgRPE: 7.2,
    styles: [
      {label:'Endurance', val:50},
      {label:'Technical', val:30},
      {label:'Power', val:20}
    ],
    angles: [
      {label:'Vertical', val:65},
      {label:'Overhang', val:25},
      {label:'Slab', val:10}
    ],
    grades: [
      {label:'V3', val:25},
      {label:'V4', val:40},
      {label:'V5', val:25},
      {label:'V6', val:10}
    ],
    climbList: [
      {grade:'V4', angle:'Vertical', style:'Endurance', rpe:7, attempts:1, timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000)},
      {grade:'V5', angle:'Vertical', style:'Endurance', rpe:8, attempts:1, timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000) + (15 * 60 * 1000)},
      {grade:'V3', angle:'Vertical', style:'Technical', rpe:6, attempts:1, timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000) + (30 * 60 * 1000)},
      {grade:'V4', angle:'Overhang', style:'Power', rpe:7, attempts:2, timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000) + (45 * 60 * 1000)},
      {grade:'V6', angle:'Overhang', style:'Power', rpe:9, attempts:4, timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)},
    ]
  },
  {
    date: 'Oct 24',
    timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 days ago
    startTime: Date.now() - (6 * 24 * 60 * 60 * 1000),
    endTime: Date.now() - (6 * 24 * 60 * 60 * 1000) + (2.25 * 60 * 60 * 1000),
    duration: '2h 15m',
    climbs: 25,
    medianGrade: 'V3',
    style: 'Volume',
    avgRPE: 5.8,
    styles: [
      {label:'Simple', val:60},
      {label:'Technical', val:25},
      {label:'Power', val:15}
    ],
    angles: [
      {label:'Vertical', val:70},
      {label:'Slab', val:20},
      {label:'Overhang', val:10}
    ],
    grades: [
      {label:'V2', val:40},
      {label:'V3', val:35},
      {label:'V4', val:20},
      {label:'V5', val:5}
    ],
    climbList: [
      {grade:'V2', angle:'Vertical', style:'Simple', rpe:5, attempts:1, timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000)},
      {grade:'V3', angle:'Vertical', style:'Simple', rpe:6, attempts:1, timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) + (20 * 60 * 1000)},
      {grade:'V3', angle:'Slab', style:'Technical', rpe:6, attempts:1, timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) + (40 * 60 * 1000)},
      {grade:'V4', angle:'Vertical', style:'Technical', rpe:7, attempts:2, timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)},
      {grade:'V2', angle:'Slab', style:'Simple', rpe:5, attempts:1, timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) + (80 * 60 * 1000)},
    ]
  },
  {
    date: 'Oct 21',
    timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000), // 9 days ago
    startTime: Date.now() - (9 * 24 * 60 * 60 * 1000),
    endTime: Date.now() - (9 * 24 * 60 * 60 * 1000) + (1.33 * 60 * 60 * 1000),
    duration: '1h 20m',
    climbs: 14,
    medianGrade: 'V5',
    style: 'Project',
    avgRPE: 8.1,
    styles: [
      {label:'Power', val:70},
      {label:'Technical', val:25},
      {label:'Simple', val:5}
    ],
    angles: [
      {label:'Overhang', val:80},
      {label:'Vertical', val:20},
      {label:'Slab', val:0}
    ],
    grades: [
      {label:'V4', val:20},
      {label:'V5', val:50},
      {label:'V6', val:25},
      {label:'V7', val:5}
    ],
    climbList: [
      {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:2, timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000)},
      {grade:'V6', angle:'Overhang', style:'Power', rpe:9, attempts:4, timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000) + (15 * 60 * 1000)},
      {grade:'V5', angle:'Overhang', style:'Power', rpe:8, attempts:3, timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000) + (30 * 60 * 1000)},
      {grade:'V7', angle:'Overhang', style:'Power', rpe:9, attempts:8, timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000) + (45 * 60 * 1000)},
      {grade:'V4', angle:'Vertical', style:'Technical', rpe:7, attempts:1, timestamp: Date.now() - (9 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)},
    ]
  }
];
