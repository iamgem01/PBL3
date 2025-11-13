import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// 🧩 Config Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google profile:", profile);
                
                // Validate profile data
                if (!profile.emails || !profile.emails[0]) {
                    return done(new Error("No email found in Google profile"), null);
                }

                const user = {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                };
                
                done(null, user);
            } catch (error) {
                console.error("Error processing Google profile:", error);
                done(error, null);
            }
        }
    )
);

// 🧩 Bắt đầu xác thực Google
app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🧩 Google callback
app.get( 
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        try {
            if (!req.user) {
                return res.redirect(`${FRONTEND_URL}?error=authentication_failed`);
            }

            const token = jwt.sign(
                { 
                    id: req.user.id, 
                    email: req.user.email, 
                    name: req.user.name 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: "24h" }
            );
            
            // Set secure cookie and redirect
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            res.redirect(`${FRONTEND_URL}?auth=success`);
        } catch (error) {
            console.error("Error in Google callback:", error);
            res.redirect(`${FRONTEND_URL}?error=token_creation_failed`);
        }
    }
);

// 🧩 Logout endpoint
app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: "Logged out successfully" });
});

// 🧩 Get current user
app.get("/api/auth/me", (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`✅ Backend chạy tại http://localhost:${PORT}`));
