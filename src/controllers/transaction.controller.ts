

// import { Request, Response } from "express";
// import { Transaction } from "../models/transaction.model";
// import { User } from "../models/user.model";

// // ================= CREATE =================
// const createTransaction = async (req: any, res: Response) => {
//   try {
//     const { courseId, transactionId } = req.body;

//     if (!courseId || !transactionId) {
//       return res.status(400).json({
//         success: false,
//         message: "courseId and transactionId required",
//       });
//     }

//     const userId = req.user._id;

//     // ✅ Duplicate check
//     const existing = await Transaction.findOne({ transactionId });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "This transaction already submitted",
//       });
//     }

//     const transaction = await Transaction.create({
//       userId,
//       courseId,
//       transactionId,
//       status: "pending",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Transaction created",
//       data: transaction,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// // ================= GET ALL (ADMIN) =================
// const getTransactions = async (_req: Request, res: Response) => {
//   try {
//     const transactions = await Transaction.find()
//       .populate("courseId")
//       .populate("userId");

//     res.json({
//       success: true,
//       data: transactions,
//     });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ================= GET SINGLE =================
// const getTransactionById = async (req: any, res: Response) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id)
//       .populate("courseId")
//       .populate("userId");

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: "Not found",
//       });
//     }

//     // ✅ Security: only owner দেখতে পারবে
//     if (transaction.userId._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     res.json({
//       success: true,
//       data: transaction,
//     });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ================= UPDATE (ADMIN VERIFY/REJECT) =================
// const updateTransaction = async (req: Request, res: Response) => {
//   try {
//     const transaction = await Transaction.findById(req.params.id);

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: "Not found",
//       });
//     }

//     // ❌ already verified হলে stop
//     if (transaction.status === "verified") {
//       return res.json({
//         success: false,
//         message: "Already verified",
//       });
//     }

//     // ✅ update status
//     transaction.status = req.body.status;
//     await transaction.save();

//     // ✅ verified হলে course assign
//     if (req.body.status === "verified") {
//       await User.findByIdAndUpdate(transaction.userId, {
//         $addToSet: {
//           courses: transaction.courseId,
//         },
//       });
//     }

//     res.json({
//       success: true,
//       message: "Updated successfully",
//       data: transaction,
//     });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ================= DELETE =================
// const deleteTransaction = async (req: Request, res: Response) => {
//   try {
//     await Transaction.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: "Deleted successfully",
//     });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ================= MY TRANSACTIONS =================
// const getMyTransactions = async (req: any, res: Response) => {
//   try {
//     const transactions = await Transaction.find({ userId: req.user._id })
//       .populate("courseId");

//     res.json({
//       success: true,
//       data: transactions,
//     });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const transactionControllers = {
//   createTransaction,
//   getTransactions,
//   getTransactionById,
//   updateTransaction,
//   deleteTransaction,
//   getMyTransactions,
// };
import { Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { User } from "../models/user.model";

// ================= CREATE TRANSACTION =================
const createTransaction = async (req: any, res: Response) => {
  try {
    const { courseId, transactionId } = req.body;

    if (!courseId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "courseId and transactionId are required",
      });
    }

    // Auth Middleware থেকে userId নেওয়া
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    // ✅ Duplicate Check (একই TrxID দ্বিতীয়বার ব্যবহার ঠেকানো)
    const existing = await Transaction.findOne({ transactionId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This transaction ID has already been submitted",
      });
    }

    const transaction = await Transaction.create({
      userId,
      courseId,
      transactionId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Transaction submitted successfully. Please wait for admin approval.",
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create transaction",
    });
  }
};

// ================= GET ALL (ADMIN ONLY) =================
const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate("courseId")
      .populate("userId", "-password") // পাসওয়ার্ড বাদে ইউজার ডাটা
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET SINGLE TRANSACTION =================
const getTransactionById = async (req: any, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("courseId")
      .populate("userId", "-password");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // ✅ Security: অ্যাডমিন অথবা ট্রানজ্যাকশনটির মালিক ছাড়া অন্য কেউ দেখতে পারবে না
    const isOwner = transaction.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden Access" });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE (ADMIN VERIFY/REJECT) =================
const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // ❌ যদি অলরেডি ভেরিফাইড থাকে তবে নতুন করে প্রসেস করার দরকার নেই
    if (transaction.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "This transaction is already verified.",
      });
    }

    // ✅ স্ট্যাটাস আপডেট
    transaction.status = status;
    await transaction.save();

    // ✅ যদি স্ট্যাটাস 'verified' হয়, তবে ইউজারের 'courses' অ্যারেতে কোর্সটি পুশ করা
    if (status === "verified") {
      await User.findByIdAndUpdate(
        transaction.userId, 
        { 
          $addToSet: { courses: transaction.courseId } 
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DELETE TRANSACTION =================
const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= MY TRANSACTIONS (USER SIDE) =================
const getMyTransactions = async (req: any, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate("courseId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const transactionControllers = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMyTransactions,
};