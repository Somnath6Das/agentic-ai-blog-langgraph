import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const isSmallDevice = width < 375;
export const FONTS = {
  displayLG: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  displayMD: { fontSize: isSmallDevice ? 18 : 20, fontWeight: "700" as const },
  label: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8 },
  bodySM: { fontSize: 12, fontWeight: "400" as const, lineHeight: 18 },

  displayXL: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
  },
  caption: { fontSize: 12, fontWeight: "500" as const },
  bodyMD: { fontSize: 14, fontWeight: "400" as const, lineHeight: 22 },
};

export const SHADOWS = {
  strong: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};
