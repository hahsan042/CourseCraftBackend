import { Request, Response } from 'express';
import { Course } from '../models/course.model'
import { Transaction } from '../models/transaction.model';

const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    // @ts-ignore (আপনার auth middleware থেকে আসা user id)
    const userId = req.user?.id; 
    // @ts-ignore
    const userRole = req.user?.role;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // ১. ইউজার যদি অ্যাডমিন হয়, তাকে সব ভিডিও দেখাও
    if (userRole === 'admin') {
      return res.json({ success: true, data: course });
    }

    // ২. চেক করো এই ইউজার কি কোর্সটি কিনেছে?
    const isEnrolled = await Transaction.findOne({
      userId: userId,
      courseId: courseId,
      status: 'verified' // শুধুমাত্র ভেরিফাইড হলে ভিডিও এক্সেস পাবে
    });

    if (!isEnrolled) {
      // যদি কোর্স না কিনে থাকে, তবে ভিডিও লিঙ্কগুলো ডিলিট করে ডাটা পাঠাও
      const courseWithoutVideos = course.toObject();
      courseWithoutVideos.videos = []; // ভিডিও লিস্ট খালি করে দেওয়া হলো

      return res.json({ 
        success: true, 
        data: courseWithoutVideos, 
        isEnrolled: false, 
        message: "Please purchase this course to watch lessons." 
      });
    }

    // ৩. যদি ইউজার কিনে থাকে, তবে সব ডাটা পাঠাও
    res.json({ success: true, data: course, isEnrolled: true });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE
const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, price, image, videos } = req.body;

    if (!title || !description || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing',
      });
    }

    const course = await Course.create({
      title,
      description,
      price,
      image,
      videos, // ✅ important
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL
const getCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find();

    res.json({
      success: true,
      data: courses,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
// const getCourseById = async (req: Request, res: Response) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: 'Not found',
//       });
//     }

//     res.json({ success: true, data: course });
//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// UPDATE
const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: course });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteCourse = async (req: Request, res: Response) => {
  try {
    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Deleted successfully',
    });
  }
  catch (err: any) {
  console.log("EMAIL ERROR:", err); // 👈 এটা add করো

  res.status(500).json({
    success: false,
    message: "Failed to send email",
    error: err.message,
  });
}
};

export const courseControllers = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};