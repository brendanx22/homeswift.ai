import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const jwtAuth = async (req, res, next) => {
  try {
    // Get token from header or cookies
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(); // No token, proceed to check session
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await models.User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Attach user to request
      req.user = user;
      req.token = token;
      
      // Update session
      req.session.userId = user.id;
      req.session.role = user.role;
      
      return next();
    } catch (err) {
      console.error('JWT verification error:', err);
      // If token is invalid, clear it
      res.clearCookie('token');
      return next(); // Proceed to check session
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return next();
  }
};

export default jwtAuth;
