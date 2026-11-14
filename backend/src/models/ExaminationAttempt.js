import mongoose from 'mongoose';

const answerSubSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    selectedAnswer: {
      type: String,
      required: [true, 'Selected answer is required'],
      trim: true,
    },
  },
  { _id: false }
);

const examinationAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: [true, 'Examination reference is required'],
      index: true,
    },
    answers: [answerSubSchema],
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Authoritative deadline is required'],
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['IN_PROGRESS', 'SUBMITTED', 'EXPIRED'],
        message: '{VALUE} is not a valid attempt status',
      },
      default: 'IN_PROGRESS',
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Enforce exactly ONE attempt per student per examination
examinationAttemptSchema.index({ student: 1, examination: 1 }, { unique: true });

const ExaminationAttempt = mongoose.model(
  'ExaminationAttempt',
  examinationAttemptSchema
);

export default ExaminationAttempt;
