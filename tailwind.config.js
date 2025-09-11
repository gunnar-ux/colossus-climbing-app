/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#2a2a2a4d', // #2a2a2a at 30% opacity (4d in hex = ~30%) - slightly lighter
        border: '#2a2a2a66', // #2a2a2a at 40% opacity (66 in hex = ~40%)
        graytxt: '#888888',
        green: '#4ade80',
        yellow: '#fbbf24',
        red: '#ef4444',
        blue: '#3b82f6',
      },
      borderRadius: { 
        'col': '16px' 
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    }
  },
  plugins: [],
}
