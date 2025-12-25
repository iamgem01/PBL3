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
import { verifyAuth, logout, saveUserSession, getCurrentUser, type User, } from "./utils/authUtils";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import OnboardingPage from "./pages/Onboarding/page";
import InvitationAcceptPage from "./pages/InvitationAcceptPage";
import CalendarPage from "./pages/CalendarPage/CalendarPage";
import TemplatePage from "./data/template";
import NotificationsPage from "./pages/NotificationsPage/NotificationsPage";
import AdminPage from "./pages/Manager/adminpage";

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
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated after loading is complete
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Redirecting to login from ProtectedRoute...");
      navigate("/login", { replace: true }); // Thêm dòng này để chuyển hướng
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render children only if authenticated
  return isAuthenticated ? <>{children}</> : null;
}

function SessionRestoreModal({ 
  user, 
  onContinue, 
  onSwitch 
}: { 
  user: User & { avatarUrl: string }, 
  onContinue: () => void, 
  onSwitch: () => void 
}) {
  return (
    <div className="fixed top-24 right-4 z-50">
      <div className="bg-slate-300 rounded-lg shadow-xl border border-gray-200 p-4 w-72 max-w-[90vw]">
        <div className="flex justify-center -mt-10 mb-4">
          <div className="relative">
            <img
              src={user.avatar}
              className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto border-4 border-white shadow-md">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Welcome back, {user.name}!
          </h3>

          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            Continue with <strong>{user.name}</strong>?
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={onContinue}
              className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              OK
            </button>
            <button
              onClick={onSwitch}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              Switch account
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
        // Logic này giờ đây chỉ dành riêng cho việc hiển thị modal "Welcome Back" khi mở tab mới
        if (!document.referrer && publicPaths.includes(location.pathname)) {
          console.log("User authenticated (New Tab/Direct), showing prompt...");
          setDetectedUser(user);
        }
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
    
    // Chuyển hướng trực tiếp đến endpoint Google OAuth của Backend để bắt đầu quy trình đăng nhập
    window.location.href = "http://localhost:8000/oauth2/authorization/google";
  };

  // Chỉ hiển thị modal khi đang ở các trang public (Login, Signup, Landing)
  // Điều này ngăn modal hiển thị sai khi đã chuyển sang /home do độ trễ của state
  if (detectedUser && ["/login", "/signup", "/"].includes(location.pathname)) {
    return <SessionRestoreModal user={detectedUser} onContinue={handleContinue} onSwitch={handleSwitch} />;
  }

  return null; 
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthInit />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/invitation/accept" element={<InvitationAcceptPage />} />

            <Route path="/ai" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/notes/new" element={<ProtectedRoute><NotePage /></ProtectedRoute>} />
            <Route path="/notes/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/document/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
            {/* Placeholder routes */}
            {/* <Route path="/notifications" element={<ProtectedRoute><div>Notifications</div></ProtectedRoute>} /> */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl font-bold">
                      Notifications Page - Coming Soon!
                    </h1>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/template"
              element={
                <ProtectedRoute>
                  <TemplatePage />
               </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* <Route path="/new-note" element={<ProtectedRoute><div>Create Note</div></ProtectedRoute>} /> */}
            <Route
              path="/new-note"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl font-bold">
                      Create New Note - Coming Soon!
                    </h1>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
