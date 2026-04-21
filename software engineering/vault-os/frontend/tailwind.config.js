export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brutalist: {
          black: '#000000',
          white: '#ffffff',
          red: '#ef4444',
          dark: '#0a0a0a',
          gray: '#262626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
