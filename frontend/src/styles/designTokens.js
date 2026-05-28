/**
 * Design Tokens for SuperBookingApp
 * Derived from Stitch Design Systems: "Mint Gold Light" & "Mint Gold Dark"
 */

export const designTokens = {
  mintGoldLight: {
    name: "Mint Gold Light",
    colorMode: "LIGHT",
    colors: {
      primary: "#006b55", // Deep Mint Green
      primaryContainer: "#00d4aa", // Mint Green Accent
      primaryFixed: "#55fcd0",
      primaryFixedDim: "#28dfb5",
      onPrimary: "#ffffff",
      onPrimaryContainer: "#005643",

      secondary: "#5d5e61", // Slate Gray
      secondaryContainer: "#e2e2e5",
      onSecondary: "#ffffff",
      onSecondaryContainer: "#636467",

      tertiary: "#805600", // Gold Accent
      tertiaryContainer: "#f9ad12",
      onTertiary: "#ffffff",
      onTertiaryContainer: "#674400",

      background: "#f8f9fa",
      onBackground: "#191c1d",

      surface: "#f8f9fa",
      surfaceDim: "#d9dadb",
      surfaceBright: "#f8f9fa",
      surfaceContainerLowest: "#ffffff",
      surfaceContainerLow: "#f3f4f5",
      surfaceContainer: "#edeeef",
      surfaceContainerHigh: "#e7e8e9",
      surfaceContainerHighest: "#e1e3e4",
      onSurface: "#191c1d",
      onSurfaceVariant: "#3b4a44",

      outline: "#6b7a74",
      outlineVariant: "#bacac2",
      error: "#ba1a1a",
      onError: "#ffffff",
      errorContainer: "#ffdad6",
      onErrorContainer: "#93000a"
    },
    typography: {
      displayLg: {
        fontFamily: "Hanken Grotesk",
        fontSize: "48px",
        fontWeight: "700",
        lineHeight: "56px",
        letterSpacing: "-0.02em"
      },
      headlineLg: {
        fontFamily: "Hanken Grotesk",
        fontSize: "32px",
        fontWeight: "600",
        lineHeight: "40px"
      },
      headlineLgMobile: {
        fontFamily: "Hanken Grotesk",
        fontSize: "28px",
        fontWeight: "600",
        lineHeight: "36px"
      },
      headlineMd: {
        fontFamily: "Hanken Grotesk",
        fontSize: "24px",
        fontWeight: "600",
        lineHeight: "32px"
      },
      bodyLg: {
        fontFamily: "Inter",
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "28px"
      },
      bodyMd: {
        fontFamily: "Inter",
        fontSize: "16px",
        fontWeight: "400",
        lineHeight: "24px"
      },
      bodySm: {
        fontFamily: "Inter",
        fontSize: "14px",
        fontWeight: "400",
        lineHeight: "20px"
      },
      labelMd: {
        fontFamily: "JetBrains Mono",
        fontSize: "12px",
        fontWeight: "500",
        lineHeight: "16px",
        letterSpacing: "0.05em"
      },
      button: {
        fontFamily: "Hanken Grotesk",
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "20px"
      }
    },
    rounded: {
      sm: "0.125rem",
      DEFAULT: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px"
    },
    spacing: {
      base: "4px",
      xs: "0.5rem",
      sm: "1rem",
      md: "1.5rem",
      lg: "2.5rem",
      xl: "4rem",
      gutter: "24px",
      marginMobile: "16px",
      marginDesktop: "48px"
    }
  },
  mintGoldDark: {
    name: "Mint Gold Dark",
    colorMode: "DARK",
    colors: {
      primary: "#46f1c5", // Bright Mint Green
      primaryContainer: "#00d4aa",
      primaryFixed: "#55fcd0",
      primaryFixedDim: "#28dfb5",
      onPrimary: "#00382b",
      onPrimaryContainer: "#005643",

      secondary: "#c8c6c5",
      secondaryContainer: "#4a4949",
      onSecondary: "#313030",
      onSecondaryContainer: "#bab8b7",

      tertiary: "#ffd08b", // Gold Accent
      tertiaryContainer: "#f9ad12",
      onTertiary: "#442c00",
      onTertiaryContainer: "#674400",

      background: "#051424", // Deep Obsidian Navy
      onBackground: "#d4e4fa",

      surface: "#051424",
      surfaceDim: "#051424",
      surfaceBright: "#2c3a4c",
      surfaceContainerLowest: "#010f1f",
      surfaceContainerLow: "#0d1c2d",
      surfaceContainer: "#122131",
      surfaceContainerHigh: "#1c2b3c",
      surfaceContainerHighest: "#273647",
      onSurface: "#d4e4fa",
      onSurfaceVariant: "#bacac2",

      outline: "#85948d",
      outlineVariant: "#3b4a44",
      error: "#ffb4ab",
      onError: "#690005",
      errorContainer: "#93000a",
      onErrorContainer: "#ffdad6"
    },
    typography: {
      headlineXl: {
        fontFamily: "Geist",
        fontSize: "48px",
        fontWeight: "700",
        lineHeight: "56px",
        letterSpacing: "-0.02em"
      },
      headlineLg: {
        fontFamily: "Geist",
        fontSize: "32px",
        fontWeight: "600",
        lineHeight: "40px",
        letterSpacing: "-0.01em"
      },
      headlineLgMobile: {
        fontFamily: "Geist",
        fontSize: "28px",
        fontWeight: "600",
        lineHeight: "36px"
      },
      bodyMd: {
        fontFamily: "Hanken Grotesk",
        fontSize: "16px",
        fontWeight: "400",
        lineHeight: "24px"
      },
      bodySm: {
        fontFamily: "Hanken Grotesk",
        fontSize: "14px",
        fontWeight: "400",
        lineHeight: "20px"
      },
      labelCode: {
        fontFamily: "JetBrains Mono",
        fontSize: "13px",
        fontWeight: "500",
        lineHeight: "16px"
      }
    },
    rounded: {
      sm: "0.125rem",
      DEFAULT: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px"
    },
    spacing: {
      base: "8px",
      gutter: "24px",
      marginMobile: "16px",
      marginDesktop: "40px"
    }
  }
};

export default designTokens;
