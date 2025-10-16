// constants/theme.ts
export const Colors = {
  primary: '#1E3F66',
  primaryLight: '#2C5F96',
  primaryDark: '#142838',
  
  accent: '#F39C12',
  accentLight: '#F5B041',
  accentDark: '#E67E22',
  
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
  
  white: '#FFFFFF',
  black: '#000000',
  
  // Escala completa de neutral
  neutral50: '#F8FAFB',
  neutral100: '#E5E9ED',
  neutral200: '#CBD5E1',
  neutral300: '#A0AEC0',
  neutral400: '#8B99A8',
  neutral500: '#718096',
  neutral600: '#4A5568',
  neutral700: '#3D4852',
  neutral800: '#2D3748',
  neutral900: '#1A202C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 20,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  inner: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 3,
    // Para sombras internas en iOS
    // borderWidth: 1,
    // borderColor: Colors.neutral200,
  },
};

// También puedes agregar estas utilidades adicionales si quieres
export const Theme = {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
};

// Para facilitar las importaciones
export default Theme;