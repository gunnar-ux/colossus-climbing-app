// Tracker button components extracted from tracker.html
// Preserves exact light theme styling and animations

export const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-bold text-black tracking-wide">{title}</h3>
    {children}
  </div>
);

export const ButtonGrid = ({ cols, children }) => (
  <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
    {children}
  </div>
);

// Base button component with exact styling from tracker.html
const BaseTrackerButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`h-10 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 relative overflow-hidden ${
      selected
        ? 'bg-gray-100 text-white'
        : 'bg-gray-100 text-black hover:bg-gray-200'
    }`}
  >
    <span className="relative z-10">{label}</span>
    <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
      selected 
        ? 'bg-black scale-100' 
        : 'bg-black scale-0'
    }`} style={{
      transformOrigin: 'center',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}></div>
  </button>
);

export const GradeButton = ({ label, selected, onClick }) => (
  <BaseTrackerButton label={label} selected={selected} onClick={onClick} />
);

export const WallButton = ({ label, selected, onClick }) => (
  <BaseTrackerButton label={label} selected={selected} onClick={onClick} />
);

export const RPEButton = ({ label, selected, onClick }) => (
  <BaseTrackerButton label={label} selected={selected} onClick={onClick} />
);

export const StyleButton = ({ label, selected, onClick }) => (
  <BaseTrackerButton label={label} selected={selected} onClick={onClick} />
);

export const AttemptButton = ({ label, selected, onClick }) => (
  <BaseTrackerButton label={label} selected={selected} onClick={onClick} />
);
