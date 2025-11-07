import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// 🧩 Config Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: "YOUR_GOOGLE_CLIENT_ID",
            clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
            callbackURL: "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("Google profile:", profile);
            const user = {
                id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
            };
            done(null, user);
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
        const token = jwt.sign(req.user, "JWT_SECRET_KEY", { expiresIn: "1h" });
        res.redirect(`http://localhost:3000?token=${token}`);
    }
);

app.listen(5000, () => console.log("✅ Backend chạy tại http://localhost:5000"));
