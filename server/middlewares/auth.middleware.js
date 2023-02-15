import UserModel, { USER_TYPE } from '../models/user.js';
import jwt from 'jsonwebtoken';
import {config as envconfig} from 'dotenv';
envconfig();


export const authMiddleware = async (req, res, next) => {
    let token = '';
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = UserModel.findById(decode?.id);
                req.user = user;
                next();
            }
        } catch (err) {
            return res.status(403).json({success: false, error: err?.message});
        }
    } else {
        return res.status(403).json({success: false, error: 'There is no token attached to header'});
    }
};

export const isAdmin = async (req, res, next) => {
    const {email} = req.user;
    const amdinUser = await UserModel.findOne({email});
    if (amdinUser.role !== 'admin') {
        return res.status(403).json({success: false, error: 'You are not admin user'});
    } else {
        next();
    }
};

export const isUser = async (req, res, next) => {
    const { email } = req?.user;
    console.log(req?.user?._id);
    return res.status(403).json({success: false, error: 'JSON.parse(req)'});
    return false;
    const adminUser = await UserModel.findOne({ email });
    console.log(adminUser);
    return false;
    const user = await UserModel.findOne({email: email});
    //console.log(email);
    if (user.role !== 'user') {
        return res.status(403).json({success: false, error: 'You are not user permission'});
    } else {
        next();
    }
}