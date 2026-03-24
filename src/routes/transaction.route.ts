import express from "express";
import { transactionControllers } from "../controllers/transaction.controller";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/",auth, transactionControllers.createTransaction);
router.get("/", transactionControllers.getTransactions);
router.get("/:id", transactionControllers.getTransactionById);
router.patch("/:id", transactionControllers.updateTransaction);
router.delete("/:id", transactionControllers.deleteTransaction);

export const TransactionRoutes = router;