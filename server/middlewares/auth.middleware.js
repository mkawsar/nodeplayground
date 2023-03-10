import User, { USER_TYPE } from '../models/user.js';
import jwt from 'jsonwebtoken';
import { config as envconfig } from 'dotenv';
envconfig();


export const authMiddleware = async (req, res, next) => {
    const cookie = req.cookies;
    let token = '';
    if (cookie?.refreshToken) {
        token = cookie?.refreshToken;
        try {
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decode?.id).select('-password');
                req.user = user;
                next();
            }
        } catch (err) {
            return res.status(403).json({ success: false, error: err?.message });
        }
    } else {
        return res.status(403).json({ success: false, error: 'There is no token in cookie' });
    }
};

export const isAdmin = async (req, res, next) => {
    const { email } = req?.user;
    const amdinUser = await User.findOne({ email });
    if (amdinUser?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'You are not admin user' });
    } else {
        next();
    }
};

export const isUser = async (req, res, next) => {
    const { email } = req?.user;
    const user = await User.findOne({ email });
    if (user?.role !== 'user') {
        return res.status(403).json({ success: false, error: 'You are not user permission' });
    } else {
        next();
    }
}