export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // New POLYGON palette
        ink: '#0B1A26',          // deep navy – main text, dark backgrounds
        palm: '#0EAA90',         // primary accent – buttons, highlights (was #135b4c)
        mint: '#B8EDE0',         // soft teal – card backgrounds, gradients
        amber: '#F5B64C',        // kept for warnings/secondary
        clay: '#4E5D6C',         // secondary text, borders
        steel: '#1E2D3B',        // dark sidebar/admin surfaces
        // New gradient stops
        'brand-start': '#1EBFA4', // top gradient
        'brand-end': '#B8EDE0',   // bottom gradient
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};