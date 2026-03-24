import express from 'express';
import { userControllers } from '../controllers/user.controller';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Register user
router.post('/register', userControllers.register);
// Login user
router.post('/login', userControllers.login);
// Get all users
router.get('/', userControllers.getUsers);
router.get("/me", auth, userControllers.getMe);
router.post("/forgot-password", userControllers.forgotPassword);
router.post("/reset-password", userControllers.resetPassword);

export const UserRoutes = router;
