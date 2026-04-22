import express from 'express';
import { userControllers } from '../controllers/user.controller';
import { auth } from '../middlewares/auth'; // মিডলওয়্যারটি ইম্পোর্ট করা আছে

const router = express.Router();

// Register & Login (এগুলোতে auth লাগে না)
router.post('/register', userControllers.register);
router.post('/login', userControllers.login);

// ✅ এটি শুধুমাত্র এডমিন দেখতে পারবে
router.get('/', auth('admin'), userControllers.getUsers);

// ✅ এটিই আপনার সমস্যার সমাধান! এখানে auth('user') যোগ করতে হবে
// যাতে টোকেন চেক করে req.user এর ভেতর আইডি সেট হয়
router.get("/me", auth('user', 'admin'), userControllers.getMe);

router.post("/forgot-password", userControllers.forgotPassword);
router.post("/reset-password", userControllers.resetPassword);

export const UserRoutes = router;