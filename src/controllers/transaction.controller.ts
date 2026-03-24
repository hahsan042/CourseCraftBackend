import { Request, Response } from "express";
import { Transaction } from "../models/transaction.model";
import { User } from "../models/user.model";

// CREATE
const createTransaction = async (req: any, res: Response) => {
  try {
    const { courseId, transactionId } = req.body;

    if (!courseId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "courseId and transactionId required",
      });
    }

    // ✅ get userId from token (middleware)
    const userId = req.user._id;

    const transaction = await Transaction.create({
      userId,
      courseId,
      transactionId,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate("courseId")
      .populate("userId");

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("courseId")
      .populate("userId");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE STATUS
const updateTransaction = async (req: Request, res: Response) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    // ✅ If verified → assign course to user
    if (req.body.status === "verified") {
      await User.findByIdAndUpdate(updatedTransaction.userId, {
        $addToSet: {
          courses: updatedTransaction.courseId,
        },
      });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: updatedTransaction,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteTransaction = async (req: Request, res: Response) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
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
};