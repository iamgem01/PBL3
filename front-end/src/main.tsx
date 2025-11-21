import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="264888264505-rosi5jcj15a96vpe2kk4s32qmpvp0rbi.apps.googleusercontent.com">
            <ThemeProvider>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </ThemeProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);