import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import LandingPage from "@/pages/Landing/LandingPage";
import LoginPage from "@/pages/Login/LoginPage";
import SignUpPage from "@/pages/SignUp/SignUpPage";
import HomePage from "@/pages/Homepage/HomePage";
import DocumentPage from "@/pages/DocumentPage/DocumentPage";
import ChatPage from "./pages/AI/ChatPage";
import SearchPage from "@/pages/SearchPage/SearchPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import NotePage from "@/pages/NotePage/NotePage";

function App() {
  const BACKEND_URL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5000";

  function AuthHandler() {
    const navigate = useNavigate();

    useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get("auth");
      const error = params.get("error");

      if (error) {
        // clear query params and optionally show error
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      if (auth === "success") {
        (async () => {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem("user", JSON.stringify(data.user));
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
              navigate("/home");
            } else {
              console.error("Failed to fetch user after OAuth redirect");
            }
          } catch (e) {
            console.error("Error fetching /api/auth/me:", e);
          }
        })();
      }
    }, [navigate]);

    return null;
  }

  return (
    <BrowserRouter>
      <AuthHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/ai" element={<ChatPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/notes/new" element={<NotePage />} />
        <Route path="/notes/:id" element={<DocumentPage />} />
        <Route
          path="/notifications"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold">
                Notifications Page - Coming Soon!
              </h1>
            </div>
          }
        />
        <Route
          path="/new-note"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold">Create New Note - Coming Soon!</h1>
            </div>
          }
        />
        <Route
          path="/search"
          element={<SearchPage />}
        />
        {/* 404 Catch-all route - must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
    </BrowserRouter>
  );
}
export default App;
