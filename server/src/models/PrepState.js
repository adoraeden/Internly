import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  questionIds: { type: [String], default: [] },
  completedCount: { type: Number, default: 0 },
  averageConfidence: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 1 },
});

const prepStateSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // { "<resourceId>": { bookmarked: true, completed: false } }
    resources: { type: mongoose.Schema.Types.Mixed },
    // { "1": true, "3": true }  (day number -> completed)
    studyDays: { type: mongoose.Schema.Types.Mixed },
    sessions: [sessionSchema],
  },
  { timestamps: true }
);

export default mongoose.model('PrepState', prepStateSchema);