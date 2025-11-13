import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/Landing/LandingPage";
import LoginPage from "@/pages/Login/LoginPage";
import SignUpPage from "@/pages/SignUp/SignUpPage";
import HomePage from "@/pages/Homepage/HomePage";
import DocumentPage from "@/pages/DocumentPage";
import ChatPage from "./pages/AI/ChatPage";
import NotFoundPage from "@/pages/NotFound/NotFoundPage";
import NotePage from "@/pages/NotePage/NotePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/ai" element={<ChatPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/document/:id" element={<DocumentPage />} />
       <Route path="/note" element={<NotePage />} />
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
          path="/search"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold">Search Page - Coming Soon!</h1>
            </div>
          }
        />
        {/* 404 Catch-all route - must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
