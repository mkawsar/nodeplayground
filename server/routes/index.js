import express from 'express';
// Controllers
import userController from '../controllers/user.controller.js';
import {encode} from '../middlewares/jwt.js';

const router = express.Router();

router.post('/login', encode, (req, res, next) => {});

export default router;