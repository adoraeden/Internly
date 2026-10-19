import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: String, required: true }, // YYYY-MM-DD
    jobCompany: { type: String, trim: true, maxlength: 100 },
    jobTitle: { type: String, trim: true, maxlength: 100 },
    matchPercentage: { type: Number, required: true, min: 0, max: 100 },
    matchedCount: { type: Number, required: true, min: 0 },
    missingCount: { type: Number, required: true, min: 0 },
    // The full report (keywords, suggestions, checklist...). Validated before saving.
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.owner;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

resumeAnalysisSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);