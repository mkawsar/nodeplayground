import express from 'express';
import userController from '../controllers/user.controller.js';
import { authMiddleware, isAdmin, isUser } from '../middlewares/auth.middleware.js'

const router = express.Router();

router
    .get('/', authMiddleware, isAdmin, userController.onGetAllUsers)
    .post('/create', userController.onCreateUser)
    .get('/:id/details', userController.onGetUserById)
    .delete('/:id/delete', userController.onDeleteUserById)
    .post('/login', userController.onUserLogin)
    .put('/:id/update', authMiddleware, isAdmin, userController.onUpdateUserById)
    .put('/update/profile', authMiddleware, userController.handleMyProfileUpdate)
    .put('/:id/blocked', authMiddleware, isAdmin, userController.handleBlockedUser)
    .put('/:id/unblock', authMiddleware, isAdmin, userController.handleUnblockUser)
    .put('/refresh/token', userController.handleRefreshToken)
    .get('/logout', authMiddleware, userController.handleLogout);

export default router;
