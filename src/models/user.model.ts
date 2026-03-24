import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../config';
import { IUser } from '../types/user.interface';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  resetToken: { type: String },
resetTokenExpire: { type: Date },
  
  // ✅ এই অংশটি অবশ্যই যোগ করুন
  // এটি না থাকলে পেমেন্ট ভেরিফাই করার সময় কোর্স আইডি সেভ হবে না
  courses: [
    { 
      type: Schema.Types.ObjectId, 
      ref: 'Course' // নিশ্চিত করুন আপনার কোর্স মডেলের নাম 'Course'
    }
  ],
}, {
  timestamps: true,
});

// Pre-save middleware (পাসওয়ার্ড হ্যাশ করার জন্য)
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  user.password = await bcrypt.hash(
    user.password as string,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// Post-save middleware
userSchema.post('save', function (user, next) {
  user.password = '';
  next();
});

export const User = model<IUser>('User', userSchema);