// import express from "express";
// import { transactionControllers } from "../controllers/transaction.controller";
// import { auth } from "../middlewares/auth";

// const router = express.Router();

// // ✅ user create transaction
// router.post("/", auth("user"), transactionControllers.createTransaction);

// // ✅ ONLY ADMIN দেখতে পারবে সব transaction
// router.get("/", auth("admin"), transactionControllers.getTransactions);

// // ✅ user নিজেরটা দেখতে পারবে (optional)
// router.get("/:id", auth("user"), transactionControllers.getTransactionById);

// // ✅ ONLY ADMIN verify/reject করতে পারবে
// router.patch("/:id", auth("admin"), transactionControllers.updateTransaction);

// // ✅ ONLY ADMIN delete করতে পারবে
// router.delete("/:id", auth("admin"), transactionControllers.deleteTransaction);

// export const TransactionRoutes = router;
import express from "express";
import { transactionControllers } from "../controllers/transaction.controller";
import { auth } from "../middlewares/auth";

const router = express.Router();

// ✅ user create transaction
router.post("/", auth("user"), transactionControllers.createTransaction);

// ✅ user নিজের সব transaction (IMPORTANT)
router.get("/my", auth("user"), transactionControllers.getMyTransactions);

// ✅ ONLY ADMIN দেখতে পারবে সব transaction
router.get("/", auth("admin"), transactionControllers.getTransactions);

// ✅ user নিজেরটা দেখতে পারবে (single)
router.get("/:id", auth("user"), transactionControllers.getTransactionById);

// ✅ ONLY ADMIN verify/reject করতে পারবে
router.patch("/:id", auth("admin"), transactionControllers.updateTransaction);

// ✅ ONLY ADMIN delete করতে পারবে
router.delete("/:id", auth("admin"), transactionControllers.deleteTransaction);

export const TransactionRoutes = router;