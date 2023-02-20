import jwt from 'jsonwebtoken';

import {config as envconfig} from 'dotenv';
envconfig();

export const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'});
};

export const generateRefreshToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '3d'});
};
