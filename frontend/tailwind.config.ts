import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cmd-bg': '#050508',
        'cmd-panel': '#0c0c14',
        'cmd-panel-2': '#0f0f1a',
        'cmd-orange': '#ff6b00',
        'cmd-orange-dim': '#cc5500',
        'cmd-red': '#ff2200',
        'cmd-cyan': '#00d4ff',
        'cmd-green': '#00ff88',
        'cmd-yellow': '#ffd700',
        'cmd-purple': '#8b5cf6',
        'cmd-border': 'rgba(255,107,0,0.2)',
        'cmd-border-bright': 'rgba(255,107,0,0.6)',
        'cmd-glass': 'rgba(255,255,255,0.03)',
        'cmd-glass-2': 'rgba(255,107,0,0.05)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
        'glow-scan': 'glowScan 3s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'flicker': 'flicker 4s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'data-stream': 'dataStream 2s linear infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255,107,0,0.4), 0 0 10px rgba(255,107,0,0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(255,107,0,0.8), 0 0 40px rgba(255,107,0,0.4)' },
        },
        glowScan: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.6' },
          '97%': { opacity: '1' },
        },
        dataStream: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(255,107,0,0.3)' },
          '50%': { borderColor: 'rgba(255,107,0,0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'orange-glow': '0 0 15px rgba(255,107,0,0.5), 0 0 30px rgba(255,107,0,0.2)',
        'orange-glow-sm': '0 0 8px rgba(255,107,0,0.4)',
        'orange-glow-lg': '0 0 30px rgba(255,107,0,0.6), 0 0 60px rgba(255,107,0,0.3)',
        'cyan-glow': '0 0 15px rgba(0,212,255,0.5)',
        'green-glow': '0 0 15px rgba(0,255,136,0.5)',
        'panel': '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [animate],
}

export default config
