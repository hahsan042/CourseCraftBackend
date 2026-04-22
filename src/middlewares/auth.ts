import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const auth = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    try {
      // ১. টোকেন চেক করা
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided or invalid format",
        });
      }

      const token = authHeader.split(" ")[1];

      // ২. টোকেন ভেরিফাই করা (পেলোড ডাটা বের করা)
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // ৩. ডাটা ম্যানুয়ালি req.user এ বসানো (যাতে কন্ট্রোলার সহজে পায়)
      // আপনার টোকেনে যেহেতু _id আছে, আমরা সেটিই এখানে এসাইন করছি
      req.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };

      // ৪. রোল চেক করা
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden (No Permission)",
        });
      }

      next();
    } catch (error: any) {
      // টার্মিনালে আসল কারণ দেখার জন্য (যেমন: সিক্রেট কি না মিললে Invalid Signature আসবে)
      console.error("JWT Auth Error:", error.message);

      return res.status(401).json({
        success: false,
        message: error.message === "jwt expired" ? "Token expired" : "Invalid token",
        error: error.message, // ডেভেলপার হিসেবে আপনি এখন মেসেজটি দেখতে পাবেন
      });
    }
  };
};