import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TemplatePage from "@/pages/TemplatePage/TemplatePage";
import LandingPage from "@/pages/Landing/LandingPage";
import LoginPage from "@/pages/Login/LoginPage";
import SignUpPage from "@/pages/SignUp/SignUpPage";
import OnboardingPage from "@/pages/Onboarding/page";
import HomePage from "@/pages/Homepage/HomePage";
import DocumentPage from "@/pages/DocumentPage/DocumentPage";
import ChatPage from "./pages/AI/ChatPage";
import SearchPage from "@/pages/SearchPage/SearchPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import NotePage from "@/pages/NotePage/NotePage";
import AdminPage from "./pages/Manager/adminpage";
import InvitationAcceptPage from "@/pages/InvitationAcceptPage";
import CalendarPage from "@/pages/CalendarPage/CalendarPage";
import NotificationsPage from "@/pages/NotificationsPage/NotificationsPage";

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : null;
}

function App() {
  const BACKEND_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";

  function AuthHandler() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      const error = params.get("error");

      // Xử lý error từ OAuth
      if (error) {
        console.error("❌ OAuth error:", error);
        
        // Show error message (có thể dùng toast/notification)
        const errorMessages: Record<string, string> = {
          authentication_failed: "Authentication failed. Please try again.",
          token_creation_failed: "Failed to create session. Please try again.",
          no_email: "No email found in Google account.",
        };
        
        const errorMsg = errorMessages[error] || "An unexpected error occurred.";
        console.error(errorMsg);
        
        // Clear query params
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Xử lý OAuth success
      if (auth === "success" && !isProcessing) {
        setIsProcessing(true);
        console.log(" OAuth callback received");

        (async () => {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              console.log(" User authenticated:", data.user);
              
              localStorage.setItem("user", JSON.stringify(data.user));
              
              // Clear query params
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // Navigate to home
              navigate("/home", { replace: true });
            } else {
              console.error(" Failed to fetch user after OAuth redirect");
              navigate("/login", { replace: true });
            }
          } catch (e) {
            console.error(" Error fetching /api/auth/me:", e);
            navigate("/login", { replace: true });
          } finally {
            setIsProcessing(false);
          }
        })();
      }
    }, [navigate, location.search]);

    // Show loading when processing OAuth
    if (isProcessing) {
      return <LoadingScreen />;
    }

    return null;
  }

  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
         <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/invitation/accept" element={<InvitationAcceptPage />} />
        
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notes/new"
          element={
            <ProtectedRoute>
              <NotePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/document/:id"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        
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

        {/* 404 Catch-all route - must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;