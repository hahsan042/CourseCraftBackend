import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import config from '../config';
import { User } from '../models/user.model';
import nodemailer from "nodemailer";


// Register user
const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists!',
      });
    }

    const savedUser = await User.create(req.body);
    
    // Generate token
    const token = jwt.sign(
      {_id: savedUser._id, email: savedUser.email, role: savedUser.role },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any }
    );

    // Omit password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message,
    });
  }
};

// Login user

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // ইউজার খুঁজে বের করা
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // পাসওয়ার্ড চেক করা
    const isPasswordMatch = await bcrypt.compare(password, user.password as string);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ✅ এখানে টোকেনের ভেতর _id দিয়ে দিন
    const token = jwt.sign(
      { 
        _id: user._id,    // এই লাইনটি অবশ্যই যোগ করবেন
        email: user.email, 
        role: user.role 
      },
      config.jwt_secret as Secret,
      { expiresIn: config.jwt_expires_in as any }
    );

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      data: user, 
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
};

// Get all users
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: err.message,
    });
  }
};
// ১. লগইন করা ইউজারের প্রোফাইল এবং কোর্স ডিটেইলস পাওয়ার জন্য
const getMe = async (req: any, res: Response) => {
  try {
    // এখানে .populate("courses") ব্যবহার করা হয়েছে যাতে শুধু ID না এসে কোর্সের সব তথ্য আসে
    const user = await User.findById(req.user._id).populate("courses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};
// ১. ইমেইল পাঠানোর ফাংশন
const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // ১০ মিনিট মেয়াদ

    await User.updateOne(
      { _id: user._id },
      { $set: { resetToken, resetTokenExpire } }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // জিমেইল অ্যাপ পাসওয়ার্ড
      },
    });

  await transporter.sendMail({
  from: `"CourseCraft" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Password Reset Request",
  html: `
    <h3>পাসওয়ার্ড রিসেট করতে নিচের লিঙ্কে ক্লিক করুন:</h3>
    
    <a href="${(process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')}/reset-password/${resetToken}" 
       style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
       Reset Password
    </a>

    <p>এই লিঙ্কটি ১০ মিনিট পর আর কাজ করবে না।</p>
  `,
});

    res.status(200).json({ success: true, message: "Reset link sent to email!" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ২. নতুন পাসওয়ার্ড সেভ করার ফাংশন
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }, // মেয়াদ চেক করা
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token!" });
    }

    // নতুন পাসওয়ার্ড হ্যাশ করা
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword }, 
        $unset: { resetToken: 1, resetTokenExpire: 1 } // কাজ শেষ হলে টোকেন মুছে ফেলা
      }
    );

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ২. সবশেষে export এ getMe যোগ করুন
export const userControllers = {
  register,
  login,
  getUsers,
  getMe, // এটি যোগ করুন
  forgotPassword,
  resetPassword
};