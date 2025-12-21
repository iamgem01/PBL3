// import { useEffect } from 'react';

// interface ThemeProviderProps {
//     children: React.ReactNode;
//     isAuthenticated: boolean;
// }

// export function ThemeProvider({children, isAuthenticated}: ThemeProviderProps) {
//     useEffect(() => {
//             const savedTheme = localStorage.getItem('theme');
//             if(isAuthenticated && savedTheme == 'dark') {
//                 document.documentElement.classList.add('dark');
//             } else {
//                 document.documentElement.classList.remove('dark');
//             }
//     }, [isAuthenticated]);
//     return <>{children}</>;
// }
// --- /dev/null
// +++ /home/vupfiev/Documents/PBL3_Code/frontend-2/src/providers/ThemeProvider.tsx
// @@ -0,0 +1,95 @@
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { updateUserTheme, updateSessionTheme } from "../utils/authUtils";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  isAuthenticated?: boolean;
  userId?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  isAuthenticated = false,
  userId,
  ...props
}: ThemeProviderProps) {
  const location = useLocation();
  
  const [theme, setThemeState] = useState<Theme>(() => {
    // Trang Landing Page (/) luôn là light
    if (window.location.pathname === "/") return "light";
    if (isAuthenticated && defaultTheme) return defaultTheme;
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    // Logic ép buộc theme light cho trang chủ
    if (location.pathname === "/") {
      root.classList.add("light");
      return;
    }

    root.classList.add(theme);
  }, [theme, location.pathname]);

  // Khi user thay đổi (login/logout) hoặc chuyển trang, cập nhật lại theme từ storage tương ứng
  useEffect(() => {
    if (location.pathname === "/") {
        setThemeState("light");
        return;
    }
    const savedTheme = isAuthenticated && defaultTheme ? defaultTheme : "light";
    setThemeState(savedTheme);
  }, [location.pathname, defaultTheme, isAuthenticated]);

  const setTheme = (theme: Theme) => {
    // Không cho phép đổi theme ở trang Landing Page
    if (location.pathname === "/") return;

    setThemeState(theme);
    
    if (isAuthenticated) {
        updateUserTheme(theme);
        updateSessionTheme(theme);
    } else {
        // Không lưu localStorage để tránh conflict giữa các tab/user như yêu cầu
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
