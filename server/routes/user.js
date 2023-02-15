import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router
    .get('/', userController.onGetAllUsers)
    .post('/create', userController.onCreateUser)
    .get('/:id/details', userController.onGetUserById)
    .delete('/:id/delete', userController.onDereleteUserById)
    .post('/login', userController.onUserLogin);

export default router;
