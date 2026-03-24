import { Request, Response } from 'express';
import { Course } from '../models/course.model';

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
const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Not found',
      });
    }

    res.json({ success: true, data: course });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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