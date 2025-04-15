import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateUser } from "./userSlice";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Initialize state with persisted token if it exists
const initialState: AuthState = {
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Store token in localStorage
      localStorage.setItem("token", action.payload.token);
      // Update user state
      updateUser(action.payload.user);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      // Remove token from localStorage
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
