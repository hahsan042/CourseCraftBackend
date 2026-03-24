import { Schema, model } from 'mongoose';
import { ICourse } from '../types/course.interface';

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },

    videos: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Course = model<ICourse>('Course', courseSchema);