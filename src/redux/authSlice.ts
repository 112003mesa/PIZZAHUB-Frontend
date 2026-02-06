import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../type";

const AUTH_STORAGE_KEY = "auth";

/* =========================
   Local Storage Helpers
========================= */

const loadAuthFromStorage = (): {
  user: User | null;
  token: string | null;
} => {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return { user: null, token: null };
    return JSON.parse(data);
  } catch {
    return { user: null, token: null };
  }
};

const saveAuthToStorage = (user: User | null, token: string | null) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
};

const clearAuthFromStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

/* =========================
   Initial State
========================= */

const persistedAuth = loadAuthFromStorage();

const initialState: AuthState = {
  user: persistedAuth.user,
  token: persistedAuth.token,
  isAuthenticated: Boolean(persistedAuth.token),
  isLoading: false,
  error: null,
  isSidebarOpen: true,
};

/* =========================
   Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;

      saveAuthToStorage(action.payload.user, action.payload.token);
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      clearAuthFromStorage();
    },

    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      saveAuthToStorage(state.user, state.token);
    },

    updateToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      saveAuthToStorage(state.user, state.token);
    },

    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
});

/* =========================
   Exports
========================= */

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updateToken,
  toggleSidebar,
} = authSlice.actions;

export default authSlice.reducer;