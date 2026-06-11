module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './hooks/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#111111',
        card: '#1A1A1A',
        border: '#2A2A2A',
        gold: '#FFD700',
        goldHover: '#E6C200',
        success: '#00C853',
        error: '#FF1744',
        muted: '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
