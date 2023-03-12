import express from 'express';
import productController from '../controllers/product.controller.js';
import { authMiddleware, isAdmin, isUser } from '../middlewares/auth.middleware.js'

const router = express.Router();

router
    .get('/list', authMiddleware, productController.handleGetAllProduct)
    .post('/create', authMiddleware, productController.handleCreateProduct)
    .get('/:id/details', authMiddleware, productController.handleGetProductDetails)
    .put('/:id/update', authMiddleware, productController.handleUpdateProduct)
    .delete('/:id/delete', authMiddleware, productController.handleDeleteProduct)
    .post('/add/wishlist', authMiddleware, productController.handleAddProductWishlist)
    .put('/rating', authMiddleware, productController.handleProductRating);

export default router;
