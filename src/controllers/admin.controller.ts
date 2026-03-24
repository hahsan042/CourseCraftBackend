import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
import { Transaction } from "../models/transaction.model";

const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();

    // only verified transactions count হবে revenue
    const transactions = await Transaction.find({ status: "verified" }).populate("courseId");

    const totalRevenue = transactions.reduce((sum, tx: any) => {
      return sum + (tx.courseId?.price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        users: totalUsers,
        courses: totalCourses,
        revenue: totalRevenue,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Failed to load stats",
      error: err.message,
    });
  }
};

export const adminControllers = {
  getAdminStats,
};