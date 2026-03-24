import { Types } from "mongoose";

export interface ITransaction {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  transactionId: string;
  status: "pending" | "verified" | "rejected";
}