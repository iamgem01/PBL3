// middleware/auth.js
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// Hàm khởi tạo passport strategy
export const initializePassport = () => {
  // Kiểm tra JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is required');
  }

  console.log('✅ JWT_SECRET loaded successfully');

  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req) => req.cookies?.auth_token,
      ExtractJwt.fromAuthHeaderAsBearerToken()
    ]),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      if (user && user.isActive) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));
};

// Middleware xác thực yêu cầu đăng nhập
export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware kiểm tra role
export const requireRole = (roles) => {
  // Đảm bảo roles là mảng
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Middleware kiểm tra permission cụ thể
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admin có tất cả quyền
    if (req.user.role === 'admin' || req.user.permissions?.includes('admin')) {
      return next();
    }
    
    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        current: req.user.permissions
      });
    }
    
    next();
  };
};

// Middleware xác thực tùy chọn (không bắt buộc)
export const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    req.user = user || null;
    next();
  })(req, res, next);
};