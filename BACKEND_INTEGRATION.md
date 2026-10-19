# Backend Integration Guide (MERN Architecture)

This document outlines the architecture and endpoint contracts for connecting Internly to a future **Node.js, Express, and MongoDB Atlas (MERN)** backend.

> **Note on Prototype Status**: In this frontend demo, user authentication, profile photos, and application records are handled locally by browser services (`src/services/authService.ts`, `src/services/photoStorageService.ts`, and `src/services/applicationService.ts`). Real password hashing with bcrypt, JWT token generation, database persistence with Mongoose, and cloud image uploads will be handled by the Express backend.

---

## 1. Authentication & Profile Service Contract

The frontend exposes clean async service functions in `src/services/authService.ts`. To transition to a live backend, replace the local storage logic with `fetch` or `axios` calls to the following Express routes:

### Endpoints Overview

| Service Function | HTTP Method | Express Endpoint | Description |
|---|---|---|---|
| `signIn(credentials)` | `POST` | `/api/auth/login` | Validates credentials, verifies bcrypt hash, returns JWT and user payload |
| `createAccount(data)` | `POST` | `/api/auth/register` | Hashes password, creates MongoDB `User` document, returns JWT session |
| `signOut()` | `POST` | `/api/auth/logout` | Invalidates refresh token / clears HTTP-only session cookie |
| `getCurrentUser()` | `GET` | `/api/auth/me` | Authenticates via `Authorization: Bearer <token>`, returns current profile |
| `updateProfile(updates)` | `PUT` | `/api/users/profile` | Updates candidate preferences, target roles, and skill lists in MongoDB |
| `uploadProfilePhoto(file)` | `POST` | `/api/users/avatar` | Accepts `multipart/form-data`, uploads to S3/Cloudinary, saves URL |
| `removeProfilePhoto()` | `DELETE` | `/api/users/avatar` | Removes cloud image and resets `avatarUrl` to null |

---

## 2. Example Express Route Handlers (Reference)

### A. User Registration (`POST /api/auth/register`)

```typescript
// server/controllers/authController.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  // Salt and hash password (e.g. 12 rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    token,
  });
};
```

### B. Profile Avatar Upload (`POST /api/users/avatar`)

```typescript
// server/controllers/userController.ts
import multer from 'multer';
import { Request, Response } from 'express';
import { User } from '../models/User';

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type'));
    }
  },
});

export const uploadAvatar = async (req: Request, res: Response) => {
  // Upload to AWS S3, Cloudinary, or MongoDB GridFS
  const avatarUrl = await uploadToCloudStorage(req.file);

  await User.findByIdAndUpdate(req.user.id, { avatarUrl });
  res.json({ avatarUrl });
};
```

---

## 3. MongoDB Data Models (Mongoose Schemas)

### User Schema (`server/models/User.ts`)

```typescript
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    degree: { type: String, default: 'B.S. Computer Science' },
    headline: { type: String },
    targetRole: { type: String },
    location: { type: String },
    preferredRoles: [String],
    preferredLocations: [String],
    preferredWorkMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site', 'Any'],
      default: 'Hybrid',
    },
    technicalSkills: [String],
    toolsAndTechnologies: [String],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
```

### Application Schema (`server/models/Application.ts`)

```typescript
const ApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true },
    jobTitle: { type: String, required: true },
    role: { type: String },
    jobDescription: { type: String },
    applicationUrl: { type: String },
    location: { type: String },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'] },
    status: {
      type: String,
      enum: ['Interested', 'Applied', 'Interview', 'Offered', 'Rejected'],
      default: 'Interested',
    },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    applicationDate: { type: String },
    deadline: { type: String },
    interviewDate: { type: String },
    followUpDate: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);
```

---

## 4. Frontend Environment Variables

When connecting to the live backend, configure your client environment:

```env
# .env (local development)
VITE_API_BASE_URL="http://localhost:5000/api"
```

In `src/services/authService.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```
