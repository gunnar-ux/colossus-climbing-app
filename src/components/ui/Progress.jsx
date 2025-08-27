// Utility function
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Progress = ({ value = 0, max = 100, className = '' }) => (
  <div className={`w-full h-2 bg-border rounded-full overflow-hidden ${className}`}>
    <div className="h-full bg-white" style={{width: `${clamp((value/max)*100,0,100)}%`}}></div>
  </div>
);

export default Progress;
