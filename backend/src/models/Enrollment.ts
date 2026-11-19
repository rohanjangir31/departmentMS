import { Schema, model, Document } from "mongoose";

export interface IEnrollment extends Document {
  student: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  status: "active" | "dropped" | "completed";
  engagementScore: number;
  lastAccessedAt: Date;
  enrolledAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["active", "dropped", "completed"],
      default: "active",
    },
    engagementScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness: a student can only have one enrollment record per course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);
