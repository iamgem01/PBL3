import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, createContext } from "react";

import LandingPage from "@/pages/Landing/LandingPage";
import LoginPage from "@/pages/Login/LoginPage";
import SignUpPage from "@/pages/SignUp/SignUpPage";
import HomePage from "@/pages/Homepage/HomePage";
import DocumentPage from "@/pages/DocumentPage/DocumentPage";
import ChatPage from "./pages/AI/ChatPage";
import SearchPage from "@/pages/SearchPage/SearchPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import NotePage from "@/pages/NotePage/NotePage";
import { verifyAuth, logout, saveUserSession, getCurrentUser, type User } from "./utils/authUtils";
import { ThemeProvider } from "@/providers/ThemeProvider";

// console.log("debugger");

// Tạo Context để chia sẻ thông tin User cho toàn bộ ứng dụng con (Sidebar, Pages...)
export const UserContext = createContext<User | null>(null);

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading system...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const check = async () => {
      
      // 1. Ưu tiên lấy từ sessionStorage (để load theme nhanh và có token ngay)
      let user = getCurrentUser();

      // 2. Nếu không có trong session, mới gọi API (check cookie dự phòng)
      if (!user) {
        user = await verifyAuth();
        // Nếu khôi phục được phiên từ cookie, lưu lại vào session để dùng cho các request sau
        if (user) saveUserSession(user);
      }

      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setIsAuthenticated(false);
        // Lưu lại đường dẫn hiện tại để redirect sau khi login (nếu cần)
        navigate("/login", { replace: true });
      }
      setIsChecking(false);
    };
    check();
  }, [navigate]);

  if (isChecking) {
    return <LoadingScreen />;
  }

  return isAuthenticated && currentUser ? (
    <UserContext.Provider value={currentUser}>
      <ThemeProvider isAuthenticated={true} userId={currentUser.userId} key={currentUser.userId} defaultTheme={currentUser.theme || "light"}>
        {children}
      </ThemeProvider>
    </UserContext.Provider>
  ) : null;
}

// Modal hỏi người dùng có muốn tiếp tục phiên đăng nhập cũ không
function SessionRestoreModal({ user, onContinue, onSwitch }: { user: User, onContinue: () => void, onSwitch: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all scale-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            We found an active session for <strong>{user.email}</strong>. Do you want to continue with <strong>{user.username}</strong>?
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onContinue}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Continue as {user.username}
            </button>
            <button
              onClick={onSwitch}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthInit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [detectedUser, setDetectedUser] = useState<User | null>(null);

  useEffect(() => {
    console.log("debugger");
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      console.error("Login error:", error);
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (params.get("loginSuccess")) {
      navigate("/home", { replace: true });
      return;
    }

    console.log("Checking auth status at path:", location.pathname);

    const publicPaths = ["/login", "/signup", "/"];

    if (!publicPaths.includes(location.pathname)) {
      setDetectedUser(null);
      return;
    }

    // 1. Kiểm tra sessionStorage trước (Tab Isolation)
    // Nếu tab này đã đăng nhập rồi thì không cần check cookie hay hiện modal nữa
    const sessionUser = getCurrentUser();
    if (sessionUser) {
        return;
    }

    let isMounted = true;
    verifyAuth().then((user) => {
      if (isMounted && user) {
        console.log("User authenticated, showing prompt...");
        setDetectedUser(user);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location, navigate]);

  const handleContinue = () => {
    setDetectedUser(null);
    // Khi người dùng chọn tiếp tục, lưu thông tin vào sessionStorage của tab này
    if (detectedUser) saveUserSession(detectedUser);
    navigate("/home", { replace: true });
  };

  const handleSwitch = async () => {
    setDetectedUser(null);
    await logout(false); // Gọi logout nhưng không reload trang (false)
    navigate("/login"); // Chuyển hướng đến trang đăng nhập
  };

  if (detectedUser) {
    return <SessionRestoreModal user={detectedUser} onContinue={handleContinue} onSwitch={handleSwitch} />;
  }

  return null; 
}


function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <ThemeProvider isAuthenticated={false}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      </ThemeProvider>

      <Routes>
        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notes/new" element={<ProtectedRoute><NotePage /></ProtectedRoute>} />
        <Route path="/notes/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        
        {/* Placeholder routes */}
        <Route path="/notifications" element={<ProtectedRoute><div>Notifications</div></ProtectedRoute>} />
        <Route path="/new-note" element={<ProtectedRoute><div>Create Note</div></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
