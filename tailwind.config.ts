import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",                // root HTML file
    "./src/**/*.{js,ts,jsx,tsx}",  // all React/TS files
  ],
  theme: {
    extend: {},                    // extend theme here later
  },
  plugins: [],                     // add plugins if needed
}

export default config

