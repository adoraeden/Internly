import mongoose from 'mongoose';

const LIBRARY_ONLY_HIDDEN = [
  'question',
  'category',
  'learningPath',
  'topic',
  'subCategory',
  'difficulty',
  'assessing',
  'conceptRefresher',
  'exampleAnswer',
  'preparationTips',
];

const userQuestionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // For library questions this matches the id in seedData.ts (e.g. "q-tech-1").
    // For custom questions the server generates it ("custom-...").
    questionId: { type: String, required: true },
    isCustom: { type: Boolean, default: false },

    // Your personal progress (used for both library and custom questions)
    status: {
      type: String,
      enum: ['Not Started', 'Practicing', 'Completed'],
      default: 'Not Started',
    },
    saved: { type: Boolean, default: false },
    notes: { type: String, default: '', maxlength: 5000 },
    userPracticeAnswer: { type: String, default: '', maxlength: 10000 },
    confidenceRating: { type: Number, min: 1, max: 5 },

    // Content: only filled in for custom questions
    question: { type: String, maxlength: 300 },
    category: { type: String, enum: ['Technical', 'HR & Behavioral', 'Role-Specific'] },
    learningPath: { type: String },
    topic: { type: String, maxlength: 100 },
    subCategory: { type: String, maxlength: 100 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    assessing: { type: String, maxlength: 500 },
    conceptRefresher: { type: String, maxlength: 5000 },
    exampleAnswer: { type: String, maxlength: 5000 },
    preparationTips: { type: [String], default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      // Shape it like the InterviewQuestion your frontend uses (id = questionId)
      transform(doc, ret) {
        ret.id = ret.questionId;
        delete ret._id;
        delete ret.__v;
        delete ret.owner;
        delete ret.questionId;
        if (!ret.isCustom) {
          for (const key of LIBRARY_ONLY_HIDDEN) delete ret[key];
          delete ret.isCustom;
        }
        return ret;
      },
    },
  }
);

// One record per user per question
userQuestionSchema.index({ owner: 1, questionId: 1 }, { unique: true });

export default mongoose.model('UserQuestion', userQuestionSchema);