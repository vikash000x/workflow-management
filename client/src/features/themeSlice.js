import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: "light",
  },
  reducers: {
    loadTheme: (state) => {
      const stored = localStorage.getItem("theme");

      if (stored === "dark") {
        document.documentElement.classList.add("dark");
document.body.classList.add("dark");
        state.theme = "dark";
        console.log("blll")
      } else {
        document.documentElement.classList.remove("dark");
       document.body.classList.remove("dark");
        state.theme = "light";
        console.log("white")
      }
    },

    toggleTheme: (state) => {
      if (state.theme === "light") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        state.theme = "dark";
        console.log("dark11")
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        state.theme = "light";
        console.log("lll1122")
      }
    },
  },
});

export const { loadTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
