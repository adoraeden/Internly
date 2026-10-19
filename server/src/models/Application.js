import mongoose from 'mongoose';

const STATUSES = ['Interested', 'Applied', 'Interview', 'Offered', 'Rejected'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const SOURCES = [
  'Company Website',
  'LinkedIn',
  'Job Board',
  'Referral',
  'University Portal',
  'Other',
];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

const timelineSchema = new mongoose.Schema(
  {
    // "type: { type: String }" because "type" is a special word in Mongoose
    type: {
      type: String,
      enum: [
        'created',
        'status_change',
        'interview_scheduled',
        'follow_up_set',
        'follow_up_completed',
        'note_added',
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const applicationSchema = new mongoose.Schema(
  {
    // Who owns this record. Every query filters by this.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    company: { type: String, required: true, trim: true, maxlength: 100 },
    jobTitle: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, trim: true, maxlength: 100 }, // your UI uses both; we keep them equal
    jobDescription: { type: String, default: '', maxlength: 10000 },
    applicationUrl: { type: String, default: '', maxlength: 500 },
    companyWebsite: { type: String, default: '', maxlength: 500 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    workMode: { type: String, enum: WORK_MODES, required: true },

    // Dates are kept as "YYYY-MM-DD" text, exactly like your frontend uses them
    applicationDate: { type: String, required: true },
    deadline: { type: String, required: true },
    followUpDate: { type: String, default: '' },
    followUpCompleted: { type: Boolean, default: false },
    interviewDate: { type: String, default: '' },

    status: { type: String, enum: STATUSES, required: true, default: 'Applied' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    source: { type: String, enum: SOURCES, default: 'Company Website' },
    salary: { type: String, default: '', maxlength: 100 },
    currency: { type: String, default: 'USD', maxlength: 10 },
    notes: { type: String, default: '', maxlength: 5000 },

    timeline: [timelineSchema],
  },
  {
    timestamps: true, // createdAt and updatedAt
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.owner; // the browser doesn't need to see this

        // Your UI expects these to be missing, not empty
        for (const key of ['companyWebsite', 'followUpDate', 'interviewDate', 'salary']) {
          if (ret[key] === '') delete ret[key];
        }
        return ret;
      },
    },
  }
);

applicationSchema.index({ owner: 1, createdAt: -1 });

export const APPLICATION_STATUSES = STATUSES;
export const APPLICATION_PRIORITIES = PRIORITIES;
export const APPLICATION_WORK_MODES = WORK_MODES;
export default mongoose.model('Application', applicationSchema);