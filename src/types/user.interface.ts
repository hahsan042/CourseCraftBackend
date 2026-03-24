import { Schema } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  
  // ✅ পাসওয়ার্ড রিসেট করার জন্য এই দুটি যোগ করুন
  resetToken?: string;
  resetTokenExpire?: Date;

  // ✅ এনরোল করা কোর্সগুলো সেভ করার জন্য এটি যোগ করুন
  courses?: Schema.Types.ObjectId[]; 
  
  // ঐচ্ছিক: টাইমস্ট্যাম্পের জন্য এগুলো রাখতে পারেন
  createdAt?: Date;
  updatedAt?: Date;
}