import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import LandingPage from "@/pages/Landing/LandingPage";
import LoginPage from "@/pages/Login/LoginPage";
import SignUpPage from "@/pages/SignUp/SignUpPage";
import HomePage from "@/pages/Homepage/HomePage";
import DocumentPage from "@/pages/DocumentPage/DocumentPage";
import ChatPage from "./pages/AI/ChatPage";
import SearchPage from "@/pages/SearchPage/SearchPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import NotePage from "@/pages/NotePage/NotePage";
import { verifyAuth } from "./utils/authUtils";

// console.log("debugger");

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

  useEffect(() => {
    const check = async () => {
      // Gọi verifyAuth (đã sửa trong authUtils.ts)
      // Hàm này sẽ gọi /api/users/me
      const user = await verifyAuth();
      if (user) {
        setIsAuthenticated(true);
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

  return isAuthenticated ? <>{children}</> : null;
}

// Component xử lý logic sau khi Login thành công (hoặc khi F5)
function AuthInit() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("debugger");
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      console.error("Login error:", error);
      window.history.replaceState({}, document.title, location.pathname);
    }

    console.log("Checking auth status at path:", location.pathname);

    if (location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/") {
      verifyAuth().then((user) => {
        if (user) {
          console.log("User authenticated, redirecting to home...");
          navigate("/home", { replace: true });
        }
      });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

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