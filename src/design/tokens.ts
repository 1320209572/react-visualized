/**
 * Design Tokens - Based on UI/UX Pro Max "Developer Tool/IDE" Palette
 * Source: .shared/ui-ux-pro-max/data/colors.csv
 *
 * Color Philosophy:
 * - Dark syntax theme colors + Blue focus
 * - Glassmorphism with 10-20px blur
 * - WCAG AAA accessibility (contrast 7:1 minimum)
 */

export const DesignTokens = {
  // === Core Brand Colors ===
  colors: {
    // Primary: Tech Blue (Used for interactive elements, highlights)
    primary: {
      default: '#3B82F6',   // Blue-500
      light: '#60A5FA',     // Blue-400
      dark: '#2563EB',      // Blue-600
      glow: '#3B82F6',      // For emissive effects
    },

    // Secondary: Deep Slate (Used for backgrounds, containers)
    secondary: {
      default: '#1E293B',   // Slate-800
      light: '#334155',     // Slate-700
      dark: '#0F172A',      // Slate-900
    },

    // Accent: Cyan (Used for data visualization, crystals)
    accent: {
      cyan: '#06b6d4',      // Cyan-500
      cyanLight: '#22d3ee', // Cyan-400
      cyanDark: '#0891b2',  // Cyan-600
    },

    // Accent: Purple (Used for execution stack, fiber nodes)
    accent2: {
      purple: '#a855f7',    // Purple-500
      purpleLight: '#c084fc', // Purple-400
      purpleDark: '#7c3aed', // Purple-600
    },

    // Accent: Orange (Used for updates, pending actions)
    accent3: {
      orange: '#f97316',    // Orange-500
      orangeLight: '#fb923c', // Orange-400
      orangeDark: '#ea580c', // Orange-600
    },

    // Warning: Red (Used for locked states, errors)
    warning: {
      red: '#dc2626',       // Red-600
      redLight: '#ef4444',  // Red-500
      redDark: '#b91c1c',   // Red-700
    },

    // Background: Deep Space
    background: {
      primary: '#0F172A',   // Main background (Slate-900)
      secondary: '#020617', // Deeper background (Slate-950)
      tertiary: '#000000',  // Pure black for contrast
    },

    // Text: High Contrast
    text: {
      primary: '#F1F5F9',   // Slate-100 (WCAG AAA on dark)
      secondary: '#E2E8F0', // Slate-200
      tertiary: '#CBD5E1',  // Slate-300
      muted: '#94A3B8',     // Slate-400
    },

    // Border: Subtle Separation
    border: {
      default: '#334155',   // Slate-700
      light: '#475569',     // Slate-600
      subtle: '#1E293B',    // Slate-800
    },
  },

  // === Glassmorphism Parameters ===
  glass: {
    // Transmission (透明度) - for MeshPhysicalMaterial
    transmission: {
      high: 0.95,       // Almost fully transparent
      medium: 0.7,      // Balanced
      low: 0.55,        // More opaque
    },

    // Opacity (不透明度) - for standard materials
    opacity: {
      high: 0.32,       // Very see-through
      medium: 0.5,      // Balanced
      low: 0.75,        // More solid
    },

    // Blur (模糊) - backdrop-filter or material thickness
    blur: {
      max: 20,          // Maximum recommended blur
      standard: 15,     // Standard glassmorphism
      min: 10,          // Minimum for effect
    },

    // Material Properties
    material: {
      metalness: 0.08,  // Slight metallic reflection
      roughness: 0.04,  // Very smooth glass
      ior: 1.5,         // Index of refraction (glass)
      thickness: 0.5,   // Physical thickness for transmission
    },
  },

  // === Emissive Intensities ===
  emissive: {
    subtle: 0.18,       // Gentle glow
    normal: 0.35,       // Standard glow
    strong: 0.55,       // Bright glow
    intense: 0.75,      // Very bright
  },

  // === Typography ===
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, "SF Mono", Monaco, monospace',
    },
    fontSize: {
      xs: 0.12,         // 3D text scale
      sm: 0.14,
      base: 0.16,
      lg: 0.18,
      xl: 0.24,
      xxl: 0.34,
      xxxl: 0.38,
    },
    outline: {
      thin: 0.01,
      standard: 0.02,
      thick: 0.025,
    },
  },

  // === Spacing & Layout ===
  spacing: {
    edge: {
      linewidth: 2.5,   // Neon edge thickness
      scale: 1.0,       // Edge geometry scale
    },
  },
};

// === Semantic Color Mappings ===
export const SemanticColors = {
  // Code Wall (Source Logic)
  codeWall: {
    background: DesignTokens.colors.background.secondary,
    border: DesignTokens.colors.accent.cyanLight,
    text: DesignTokens.colors.text.secondary,
    highlight: DesignTokens.colors.primary.default,
    activeLine: DesignTokens.colors.primary.light,
  },

  // Stack Rail (Execution Stack)
  stackRail: {
    frame: DesignTokens.colors.accent2.purple,
    frameEmissive: DesignTokens.colors.accent2.purpleDark,
    locked: DesignTokens.colors.warning.red,
    lockedEmissive: DesignTokens.colors.warning.redDark,
    text: DesignTokens.colors.text.primary,
    label: DesignTokens.colors.text.secondary,
  },

  // Queue Rack (Update Queue)
  queueRack: {
    background: DesignTokens.colors.background.secondary,
    border: DesignTokens.colors.accent.cyanLight,
    card: DesignTokens.colors.primary.light,
    cardEmissive: DesignTokens.colors.primary.default,
    text: DesignTokens.colors.text.secondary,
    result: DesignTokens.colors.accent.cyanLight,
  },

  // Fiber Foundation (Heap Memory)
  fiberFoundation: {
    crystal: DesignTokens.colors.accent.cyan,
    crystalEmissive: DesignTokens.colors.accent.cyanDark,
    text: DesignTokens.colors.text.primary,
    dataProjection: DesignTokens.colors.text.secondary,
  },

  // Data Photon (Update Particles)
  dataPhoton: {
    core: DesignTokens.colors.accent3.orange,
    trail: DesignTokens.colors.accent3.orange,
    text: DesignTokens.colors.text.primary,
  },

  // Hypercube (Main Container)
  hypercube: {
    glass: DesignTokens.colors.accent.cyanLight,
    edge: DesignTokens.colors.accent.cyanLight,
    grid: {
      primary: '#1f2937',   // Gray-800
      secondary: '#0b1220', // Very dark
    },
  },
};

// === Helper Functions ===
export const toRGBA = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const toEmissiveColor = (hex: string): string => {
  // For Three.js emissive colors, we typically use the same hex
  return hex;
};
