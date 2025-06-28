/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { backgroundPosition: '-500px 0' },
  				'100%': { backgroundPosition: '500px 0' },
  			},
  			pulse: {
  				'0%, 100%': { opacity: 1, transform: 'scale(1)' },
  				'50%': { opacity: 0.85, transform: 'scale(1.05)' },
  			},
  			scaleSpring: {
  				'0%': { transform: 'scale(0.95)' },
  				'50%': { transform: 'scale(1.05)' },
  				'100%': { transform: 'scale(1)' },
  			},
  			"accordion-down": {
  				from: { height: 0 },
  				to: { height: "var(--radix-accordion-content-height)" },
  			},
  			"accordion-up": {
  				from: { height: "var(--radix-accordion-content-height)" },
  				to: { height: 0 },
  			},
  			"pulse-subtle": {
  				"0%, 100%": { opacity: "1" },
  				"50%": { opacity: "0.85" },
  			},
  			"pulse-success": {
  				"0%, 100%": { opacity: "1", transform: "scale(1)" },
  				"50%": { opacity: "0.9", transform: "scale(1.05)" },
  			},
  			celebrate: {
  				"0%": { transform: "scale(1) rotate(0deg)" },
  				"25%": { transform: "scale(1.1) rotate(-5deg)" },
  				"50%": { transform: "scale(1.15) rotate(5deg)" },
  				"75%": { transform: "scale(1.05) rotate(-2deg)" },
  				"100%": { transform: "scale(1) rotate(0deg)" },
  			},
  			strikethrough: {
  				"0%": { width: "0%" },
  				"100%": { width: "100%" },
  			},
  			sparkle: {
  				"0%, 100%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
  				"50%": { opacity: "1", transform: "scale(1) rotate(180deg)" },
  			},
  			"glow-success": {
  				"0%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.3)" },
  				"50%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3)" },
  				"100%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.3)" },
  			},
  						"bounce-gentle": {
				"0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
				"40%": { transform: "translateY(-8px)" },
				"60%": { transform: "translateY(-4px)" },
			},
			shimmer: {
				"0%": { backgroundPosition: "-500px 0" },
				"100%": { backgroundPosition: "500px 0" },
			},
  		},
  		animation: {
  			shimmer: 'shimmer 2s infinite linear',
  			pulse: 'pulse 1s ease-in-out',
  			'scale-spring': 'scaleSpring 0.2s ease-spring',
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			"pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  			"pulse-success": "pulse-success 0.6s ease-in-out",
  			"celebrate": "celebrate 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  			"strikethrough": "strikethrough 0.4s ease-out",
  			"sparkle": "sparkle 0.8s ease-out",
  			"glow-success": "glow-success 1s ease-in-out",
  						"bounce-gentle": "bounce-gentle 0.8s ease-in-out",
			shimmer: "shimmer 2s linear infinite",
		},
  		transitionTimingFunction: {
  			spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  			sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
