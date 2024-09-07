import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postRequest } from "@services/api";
import { message } from "antd";
import endPoints from "@routers/router";

// Thunk cho đăng nhập
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await postRequest("/auth/login", {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice cho auth
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    role: null,
    isLoading: false,
    error: null,
    redirectPath: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      state.redirectPath = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.user = {
          userId: data.userId,
          username: data.username,
          email: data.email,
          imagePath: data.imagePath,
        };
        state.accessToken = data.accessToken;
        state.refreshToken = data.refreshToken;
        state.role = data.role;
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        state.isLoading = false;

        // Set redirectPath based on role
        switch (data.role) {
          case "Admin":
            state.redirectPath = endPoints.DASHBOARD;
            break;
          case "Hr":
            state.redirectPath = `${endPoints.QUANLYINTERN}/${endPoints.DANHSACHINTERN}`;
            break;
          case "Mentor":
            state.redirectPath = endPoints.QUANLYDUAN;
            break;
          case "Intern":
            state.redirectPath = endPoints.QUANLYCONGVIEC;
            break;
          default:
            state.redirectPath = endPoints.ALL;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error(action.payload?.message || "Login failed");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
