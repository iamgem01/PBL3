import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import { AuthContext } from './AuthContext';
import { updateUserTheme, updateSessionTheme, getCurrentUser } from '../utils/authUtils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const user = authContext?.user;

  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {

    if (isAuthenticated && user?.theme) {
      return user.theme;
    }

    const sessionUser = getCurrentUser();
    if (sessionUser?.theme) {
      return sessionUser.theme as Theme;
    }
    
    return 'light'; 
  });

  useEffect(() => {
    if (isAuthenticated && user?.theme && user.theme !== theme) {
      setThemeState(user.theme);
    }
  }, [user, isAuthenticated, theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if(isAuthenticated) {

      authContext?.updateTheme(newTheme);
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Apply theme to document with smooth transition
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add transitioning class to disable transitions during theme change
    root.classList.add('theme-transitioning');
    
    // Remove both classes
    root.classList.remove('light', 'dark');
    
    // Add the new theme class
    root.classList.add(theme);
    
    // Remove transitioning class after a frame
    requestAnimationFrame(() => {
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 10);
    });
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#111827' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#111827' : '#ffffff';
      document.head.appendChild(meta);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      // Chỉ cập nhật nếu người dùng chưa đăng nhập và chưa tự chọn theme
      if (!isAuthenticated && !localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAuthenticated]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};