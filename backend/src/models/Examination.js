import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [3, 'Question text must be at least 3 characters'],
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (opts) {
          return (
            Array.isArray(opts) &&
            opts.length === 4 &&
            opts.every((opt) => typeof opt === 'string' && opt.trim().length > 0)
          );
        },
        message: 'Each question must have exactly four non-empty options',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
      validate: {
        validator: function (val) {
          return this.options && this.options.includes(val);
        },
        message: 'Correct answer must match one of the four available options',
      },
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [1, 'Marks must be at least 1'],
    },
  },
  { _id: true }
);

const examinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference is required'],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
      min: [0, 'Passing marks cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'PUBLISHED', 'CLOSED'],
        message: '{VALUE} is not a valid examination status',
      },
      default: 'DRAFT',
      index: true,
    },
    questions: [questionSchema],
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

// Pre-validation hook: Enforce server-side calculated totalMarks and date sequencing
examinationSchema.pre('validate', function () {
  // Automatically compute totalMarks from question marks (never trust client input)
  if (Array.isArray(this.questions) && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );
  } else {
    this.totalMarks = 0;
  }

  // Validate timing
  if (this.startTime && this.endTime) {
    const start = new Date(this.startTime).getTime();
    const end = new Date(this.endTime).getTime();
    if (end <= start) {
      this.invalidate('endTime', 'End time must be later than start time');
    }
  }

  // Validate passing marks against total marks
  if (this.totalMarks > 0 && this.passingMarks > this.totalMarks) {
    this.invalidate('passingMarks', 'Passing marks cannot exceed total marks');
  }
});

const Examination = mongoose.model('Examination', examinationSchema);

export default Examination;

