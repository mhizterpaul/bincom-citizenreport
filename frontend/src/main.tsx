import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App.tsx";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ReduxProvider store={store}>
        <CssBaseline />
        <App />
      </ReduxProvider>
    </StyledEngineProvider>
  </StrictMode>
);
