import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true, // MongoDB refuses two accounts with the same email
      lowercase: true,
      trim: true,
    },
    // select: false means queries do NOT return the hash unless we ask for it
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String },

    // Career profile and preferences
    profile: {
      degree: { type: String, default: '' },
      headline: { type: String, default: '' },
      targetRole: { type: String, default: '' },
      location: { type: String, default: '' },
      portfolioUrl: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      preferredRoles: { type: [String], default: [] },
      preferredIndustries: { type: [String], default: [] },
      preferredLocations: { type: [String], default: [] },
      preferredWorkMode: { type: String, default: 'Any' },
      employmentType: { type: String, default: '' },
      preferredDuration: { type: String, default: '' },
      technicalSkills: { type: [String], default: [] },
      toolsAndTechnologies: { type: [String], default: [] },
      areasToLearn: { type: [String], default: [] },
      defaultApplicationView: { type: String, default: 'table' },
      defaultSortBy: { type: String, default: 'newest' },
      followUpReminderDays: { type: Number, default: 3 },
      themePreference: { type: String, default: 'Light' },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: {
      // Shape the user the way your frontend expects (id, not _id)
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.profile; // profile has its own route
        return ret;
      },
    },
  }
);

export default mongoose.model('User', userSchema);