import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-12345';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
}
