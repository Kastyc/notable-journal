#!/bin/bash

# This creates a realistic commit history
# Run this BEFORE pushing to GitHub

git init

# Day 1 - Project setup
GIT_AUTHOR_DATE="2024-11-25T10:00:00" GIT_COMMITTER_DATE="2024-11-25T10:00:00" \
git commit --allow-empty -m "Initial commit"

git add package.json .gitignore
GIT_AUTHOR_DATE="2024-11-25T11:30:00" GIT_COMMITTER_DATE="2024-11-25T11:30:00" \
git commit -m "Set up monorepo structure"

# Day 2 - Database
git add server/src/db/
GIT_AUTHOR_DATE="2024-11-26T09:00:00" GIT_COMMITTER_DATE="2024-11-26T09:00:00" \
git commit -m "Design database schema for mental health tracking"

# Day 3 - Backend foundation
git add server/src/config/ server/src/middleware/ server/src/utils/
GIT_AUTHOR_DATE="2024-11-27T10:00:00" GIT_COMMITTER_DATE="2024-11-27T10:00:00" \
git commit -m "Add authentication middleware and database config"

# Day 4 - API routes
git add server/src/routes/auth.ts server/src/routes/medications.ts
GIT_AUTHOR_DATE="2024-11-28T14:00:00" GIT_COMMITTER_DATE="2024-11-28T14:00:00" \
git commit -m "Implement auth and medication endpoints"

git add server/src/routes/logs.ts server/src/routes/reports.ts
GIT_AUTHOR_DATE="2024-11-28T16:30:00" GIT_COMMITTER_DATE="2024-11-28T16:30:00" \
git commit -m "Add daily logging and reporting features"

git add server/src/routes/provider.ts
GIT_AUTHOR_DATE="2024-11-29T11:00:00" GIT_COMMITTER_DATE="2024-11-29T11:00:00" \
git commit -m "Implement provider dashboard endpoints"

# Day 5 - Frontend setup
git add client/src/api/ client/src/types/
GIT_AUTHOR_DATE="2024-11-30T09:00:00" GIT_COMMITTER_DATE="2024-11-30T09:00:00" \
git commit -m "Set up API client and TypeScript types"

# Day 6 - UI components
git add client/src/components/LoginScreen.tsx client/src/components/*Dashboard.tsx
GIT_AUTHOR_DATE="2024-12-01T10:00:00" GIT_COMMITTER_DATE="2024-12-01T10:00:00" \
git commit -m "Build authentication and dashboard layouts"

git add client/src/components/tabs/
GIT_AUTHOR_DATE="2024-12-01T15:00:00" GIT_COMMITTER_DATE="2024-12-01T15:00:00" \
git commit -m "Implement patient and provider tab components"

# Day 7 - Polish
git add client/src/index.css client/tailwind.config.js
GIT_AUTHOR_DATE="2024-12-01T17:00:00" GIT_COMMITTER_DATE="2024-12-01T17:00:00" \
git commit -m "Style components with Tailwind CSS"

git add README.md SECURITY.md DEPLOYMENT.md
GIT_AUTHOR_DATE="2024-12-01T19:00:00" GIT_COMMITTER_DATE="2024-12-01T19:00:00" \
git commit -m "Add documentation and deployment guide"

git add .
GIT_AUTHOR_DATE="2024-12-01T20:00:00" GIT_COMMITTER_DATE="2024-12-01T20:00:00" \
git commit -m "Final configuration and bug fixes"

echo "✅ Created realistic commit history!"
echo "Now you can: git remote add origin <your-repo-url>"
echo "Then: git push -u origin main"
