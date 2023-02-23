import express from 'express';
import productController from '../controllers/product.controller.js';
import { authMiddleware, isAdmin, isUser } from '../middlewares/auth.middleware.js'

const router = express.Router();

router
    .get('/list', authMiddleware, productController.handleGetAllProduct)
    .post('/create', authMiddleware, productController.handleCreateProduct);
export default router;