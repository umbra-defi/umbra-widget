import type { Config } from "tailwindcss";

// All design tokens are CSS custom properties so the host can override them at
// runtime via the `ui` prop (see src/theme/apply-theme.ts). Tailwind classes
// read the vars — nothing is hard-coded at build time.
export default {
  content: ["./src/**/*.{ts,tsx}", "./playground/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "uw-bg": "var(--uw-bg)",
        "uw-surface": "var(--uw-surface)",
        "uw-surface-alt": "var(--uw-surface-alt)",
        "uw-border": "var(--uw-border)",
        "uw-text": "var(--uw-text)",
        "uw-text-secondary": "var(--uw-text-secondary)",
        "uw-text-tertiary": "var(--uw-text-tertiary)",
        "uw-primary": "var(--uw-primary)",
        "uw-primary-fg": "var(--uw-primary-fg)",
        "uw-danger": "var(--uw-danger)",
        "uw-success": "var(--uw-success)",
        "uw-tab-active": "var(--uw-tab-active)",
      },
      fontFamily: {
        "uw-primary": "var(--uw-font-primary)",
        "uw-secondary": "var(--uw-font-secondary)",
      },
      borderRadius: {
        "uw-sm": "var(--uw-radius-sm)",
        "uw-md": "var(--uw-radius-md)",
        "uw-lg": "var(--uw-radius-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
