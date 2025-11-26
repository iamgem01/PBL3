// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables FIRST
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

console.log('✅ All required environment variables loaded');

// Import models and middleware AFTER dotenv config
import User from "./models/User.js";
import { initializePassport, requireAuth, requireRole, requirePermission } from "./middleware/auth.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Connect to database
connectDB();

// Middleware setup
app.use(cors({ 
  origin: FRONTEND_URL, 
  credentials: true 
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Initialize passport strategies
initializePassport();

// Local Strategy for email/password login
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    
    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("📝 Google profile:", profile.id);
                
                if (!profile.emails || !profile.emails[0]) {
                    return done(new Error("No email found in Google profile"), null);
                }

                let user = await User.findOne({ googleId: profile.id });
                
                if (!user) {
                  user = await User.findOne({ email: profile.emails[0].value });
                  
                  if (user) {
                    user.googleId = profile.id;
                    user.avatar = profile.photos?.[0]?.value || user.avatar;
                  } else {
                    user = new User({
                      googleId: profile.id,
                      email: profile.emails[0].value,
                      name: profile.displayName,
                      avatar: profile.photos?.[0]?.value,
                      role: 'user',
                      permissions: ['read', 'write']
                    });
                  }
                }
                
                user.lastLogin = new Date();
                await user.save();
                
                done(null, user);
            } catch (error) {
                console.error("❌ Error processing Google profile:", error);
                done(error, null);
            }
        }
    )
);

// ==================== AUTH ROUTES ====================

// Local login
app.post('/api/auth/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    console.log(`✅ User logged in: ${user.email} (${user.role})`);
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions
      }
    });
  })(req, res);
});

// Local signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const user = new User({
      email,
      password,
      name,
      role: 'user',
      permissions: ['read', 'write']
    });
    
    await user.save();
    
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    console.log(`✅ New user registered: ${user.email}`);
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth routes
app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

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
                    id: req.user._id, 
                    email: req.user.email, 
                    name: req.user.name,
                    role: req.user.role
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: "24h" }
            );
            
            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            
            console.log(`✅ Google OAuth success: ${req.user.email}`);
            res.redirect(`${FRONTEND_URL}?auth=success`);
        } catch (error) {
            console.error("❌ Error in Google callback:", error);
            res.redirect(`${FRONTEND_URL}?error=token_creation_failed`);
        }
    }
);

// Logout
app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: "Logged out successfully" });
});

// Get current user
app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ 
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
});

// ==================== USER MANAGEMENT ROUTES (ADMIN ONLY) ====================

// Get all users (Admin only)
app.get('/api/users', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    console.log(`📋 Admin ${req.user.email} retrieved ${users.length} users`);
    res.json({ users });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by email (for invitation system)
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🔍 Looking up user by email: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    
    if (!user) {
      console.log(`⚠️ User not found with email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Found user: ${user._id} (${user.email})`);
    res.json({ 
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('❌ Get user by email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user (Admin only)
app.get('/api/users/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (Admin only)
app.put('/api/users/:id/role', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'moderator'];
    
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Admin ${req.user.email} changed ${user.email} role to ${role}`);
    res.json({ user });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user permissions (Admin only)
app.put('/api/users/:id/permissions', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { permissions } = req.body;
    const allowedPermissions = ['read', 'write', 'delete', 'admin'];
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    
    const invalidPermissions = permissions.filter(p => !allowedPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid permissions', 
        invalid: invalidPermissions 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { permissions }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Admin ${req.user.email} updated ${user.email} permissions`);
    res.json({ user });
  } catch (error) {
    console.error('❌ Update user permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate/Activate user (Admin only)
app.put('/api/users/:id/status', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isActive }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Admin ${req.user.email} ${isActive ? 'activated' : 'deactivated'} ${user.email}`);
    res.json({ user });
  } catch (error) {
    console.error('❌ Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`🗑️ Admin ${req.user.email} deleted user ${user.email}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROTECTED ROUTES EXAMPLES ====================

// Example: Route for users with 'write' permission
app.post('/api/content', requireAuth, requirePermission('write'), (req, res) => {
  res.json({ 
    message: 'Content created successfully',
    user: req.user.email
  });
});

// Example: Route for moderators and admins
app.get('/api/moderation', requireAuth, requireRole(['admin', 'moderator']), (req, res) => {
  res.json({ 
    message: 'Moderation panel',
    user: req.user.email,
    role: req.user.role
  });
});

// ==================== HEALTH CHECK ====================

app.get("/health", (req, res) => {
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      service: "user-service"
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`✅ User Service running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log('=================================');
});