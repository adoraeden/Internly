# Internly — Internship & Career Management Workspace

Internly is a personal career and internship workspace built with React, TypeScript, and Tailwind CSS. It is styled in an editorial **Deep Teal × Snow** aesthetic with an emphasis on readable typography, clear information hierarchy, and intuitive career workflows.

## Features

- **Candidate Overview**: Approved dashboard tracking active applications, interview milestones, upcoming deadlines, and key recruitment metrics.
- **Applications Workspace**: Full-width sortable table and Kanban board with status dropdowns, priority tags, and work mode filters.
- **Resume Alignment Checker**: ATS match scoring, matched and missing keyword analysis, actionable suggestions, and direct import from active job listings.
- **Interview Prep Suite**: Categorized technical and behavioral question tracks, interactive practice modes with timers, and confidence tracking.
- **Recruitment Analytics**: Conversion funnels, velocity trends, and breakdown charts built with Recharts using the Deep Teal color palette.
- **Candidate Profile**: Personal dossier with target career criteria, skills inventory with proficiency tags, education history, and portfolio links.
- **Customizable Profile Photos**: Local photo selection, file size/format validation (<= 2MB, JPEG/PNG/WebP), instant preview, photo replacement/removal, initials fallback, and IndexedDB persistence.
- **Authentication UI**: Complete sign-in, account registration, password requirements validation, session persistence, and sign-out menu.

## Quick Start (Local Development)

To run Internly locally in VS Code:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open your browser
# Navigate to http://localhost:3000
```

## Architecture & Demo Mode

This project is configured as a standalone frontend demo ready for export:
- **No external API keys or paid services required**: Runs completely offline using mock services.
- **Safe Demo Data**: All sample accounts (`alex.johnson@demo.college.edu`) and companies are purely fictional demo records. No real credentials or database secrets are included.
- **Modular Service Layer**: Data management is abstracted into `src/services/authService.ts`, `src/services/photoStorageService.ts`, and `src/services/applicationService.ts`.

For instructions on connecting this frontend to a production Node.js, Express, and MongoDB Atlas backend, see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).
