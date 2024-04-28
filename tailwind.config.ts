import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1ab8b9",
      },
    },
  },
  plugins: [],
} satisfies Config;
