module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
        accent: '#ff6b35',
        neutral: '#6b7280'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Playfair Display', 'serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
