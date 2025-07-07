import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        contrastThreshold: 4.5,
        primary: {
          main: "#0031f6",
        },
        secondary: {
          main: "#c500f6",
        },
      },
    },
    dark: {
      palette: {
        contrastThreshold: 4.5,
        primary: {
          main: "#4ED7FA",
        },
        secondary: {
          main: "#c500f6",
        },
      },
    },
  },
});
