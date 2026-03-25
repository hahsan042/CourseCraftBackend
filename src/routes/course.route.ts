// src/routes/course.route.ts

import express from 'express';
import { courseControllers } from '../controllers/course.controller';
import { auth } from '../middlewares/auth';

const router = express.Router();

router.post('/', courseControllers.createCourse);
router.get('/', courseControllers.getCourses);
router.get('/:id',auth, courseControllers.getCourseById);
router.patch('/:id', courseControllers.updateCourse);
router.delete('/:id', courseControllers.deleteCourse);

export const CourseRoutes = router;