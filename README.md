# Collaborative Workspace MVP

This project is a Notion-like collaborative workspace prototype for small student teams. It lets users create a workspace, manage projects, invite members, create pages, assign tasks, and track progress in one place.

## MVP Workflow

The prototype tests whether a small team can coordinate project work without switching between chat, spreadsheets, and separate task tools.

Core workflow:

1. Sign up or sign in.
2. Create or open a workspace.
3. Create a project inside the workspace.
4. Create a task with title, description, assignee, status, priority, and due date.
5. View the task in the workspace task table and dashboard analytics.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Radix UI, TanStack Query
- Backend: Node.js, Express, TypeScript
- Database: MongoDB
- Authentication: Local auth and Google OAuth support

## Run With Docker

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

## Manual Setup

Backend:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

## Assignment Report

The written report for Software Development Case Studies Assignment 4 is included as:

- `ASSIGNMENT_4_REPORT.md`
- `ASSIGNMENT_4_REPORT.docx`
