import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation class variants
export const animations = {
  // Spring animations
  spring: {
    checkbox: "transition-transform duration-200 ease-spring transform-gpu",
    scale: "transition-all duration-200 ease-spring transform-gpu hover:scale-105",
  },
  
  // Fade animations
  fade: {
    enter: "transition-opacity duration-200 ease-in-out",
    exit: "transition-opacity duration-150 ease-in-out",
  },
  
  // Pulse animations
  pulse: {
    badge: "animate-pulse-subtle",
    notification: "animate-pulse",
    success: "animate-pulse-success",
  },
  
  // Task completion animations
  taskCompletion: {
    celebrate: "animate-celebrate",
    strikethrough: "animate-strikethrough",
    sparkle: "animate-sparkle",
    glow: "animate-glow-success",
    bounce: "animate-bounce-gentle",
  },
  
  // Loading animations
  loading: {
    skeleton: "animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:500px_100%] bg-no-repeat",
    spinner: "animate-spin",
  },
};

// Utility to check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Animation timing functions
export const timings = {
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy spring
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth ease
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', // Quick ease
  celebrate: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Celebration bounce
};

// Keyframe definitions for custom animations
export const keyframes = {
  pulseSubtle: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.85 },
  },
  pulseSuccess: {
    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.9, transform: 'scale(1.05)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-500px 0' },
    '100%': { backgroundPosition: '500px 0' },
  },
  celebrate: {
    '0%': { transform: 'scale(1) rotate(0deg)' },
    '25%': { transform: 'scale(1.1) rotate(-5deg)' },
    '50%': { transform: 'scale(1.15) rotate(5deg)' },
    '75%': { transform: 'scale(1.05) rotate(-2deg)' },
    '100%': { transform: 'scale(1) rotate(0deg)' },
  },
  strikethrough: {
    '0%': { width: '0%' },
    '100%': { width: '100%' },
  },
  sparkle: {
    '0%, 100%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
    '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
  },
  glowSuccess: {
    '0%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)' },
    '50%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.3)' },
    '100%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)' },
  },
  bounceGentle: {
    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
    '40%': { transform: 'translateY(-8px)' },
    '60%': { transform: 'translateY(-4px)' },
  },
};

// Create sparkle effect at specific coordinates
export function createSparkleEffect(x: number, y: number) {
  if (prefersReducedMotion()) return;
  
  const sparkle = document.createElement('div');
  sparkle.className = 'fixed pointer-events-none z-50 w-4 h-4 text-yellow-400';
  sparkle.innerHTML = '✨';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.transform = 'translate(-50%, -50%)';
  sparkle.style.animation = 'sparkle 0.8s ease-out forwards';
  
  document.body.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 800);
}

// Create celebration confetti effect
export function createConfettiEffect(element: HTMLElement) {
  if (prefersReducedMotion()) return;
  
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create multiple confetti pieces
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const shapes = ['•', '▪', '▴', '◆'];
  
  for (let i = 0; i < 8; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'fixed pointer-events-none z-50 text-lg font-bold';
    confetti.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
    confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${centerX}px`;
    confetti.style.top = `${centerY}px`;
    confetti.style.transform = 'translate(-50%, -50%)';
    
    // Random direction and distance
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 60 + Math.random() * 40;
    const endX = centerX + Math.cos(angle) * distance;
    const endY = centerY + Math.sin(angle) * distance;
    
    confetti.animate([
      { 
        transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
        opacity: 1 
      },
      { 
        transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(1) rotate(360deg)`,
        opacity: 0 
      }
    ], {
      duration: 600 + Math.random() * 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 800);
  }
}

// Add glow effect to element
export function addGlowEffect(element: HTMLElement, duration: number = 1000) {
  if (prefersReducedMotion()) return;
  
  element.style.animation = `glow-success ${duration}ms ease-in-out`;
  
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
} 