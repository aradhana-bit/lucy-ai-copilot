<h1 align="center">Lucy AI</h1>

<p align="center">
  The AI Workforce That Builds Your Business.
</p>

<p align="center">
  A founder-focused workspace that brings AI assistance, projects, tasks, documents, files, and team workflows together in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack_Start-1.x-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Start" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database_&_Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI_SDK-Streaming-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="AI SDK" />
</p>

---

## Overview

**Lucy AI** is an AI-powered workspace designed to help founders organize and execute their ideas. Instead of switching between separate tools for conversations, project tracking, documents, tasks, and files, Lucy brings these workflows into a single application.

The platform combines an AI chat workspace with project-aware context and productivity tools. Users can manage startup projects, track work, organize knowledge, and interact with AI models through a streaming chat experience.

Lucy is being developed toward a broader AI workforce: specialized capabilities for strategy, research, engineering, design, writing, and analysis.

## Key Features

### AI Workspace

- Streaming AI conversations
- Switch between supported AI models
- Conversation history and search
- Pin, archive, duplicate, edit, and delete conversations
- Regenerate assistant responses
- Export conversations as Markdown or JSON
- Markdown and code rendering
- Project-linked conversations and context

### Project Management

- Create and manage startup projects
- Track project status and progress
- View project details
- Organize work around individual projects

### Task Management

- Kanban-style task board
- Backlog, To Do, In Progress, Review, and Done stages
- Task priorities
- Project association
- Due-date tracking and progress

### Documents

- Create and organize documents
- Support for briefs, specifications, research, memos, plans, and code
- Search documents by title
- Mark documents as favourites

### File Management

- Upload multiple files
- Drag-and-drop file uploads
- Workspace-based file organization
- Download files using secure, time-limited links
- Remove uploaded files

### Calendar

- Monthly calendar view
- View tasks by due date
- Navigate between months

### Workspace Dashboard

- Overview of projects and tasks
- Completed and open task counts
- Document and conversation activity
- Recent projects and workspace activity

### Authentication and Workspace

- Supabase authentication
- Session management
- Workspace-based data access
- User profile and settings pages

## AI Model Support

The AI workspace includes model selection for the following models:

| Provider | Available Models |
|---|---|
| Google | Gemini 3 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Flash |
| OpenAI | GPT-5, GPT-5 mini, GPT-5 nano |

AI requests are handled through the server-side chat endpoint and the Lovable AI Gateway. Model availability may depend on the configured gateway and account credits.

## Specialized AI Roles

Lucy is designed around specialized startup functions. The current chat system uses an assistant identity that can help across these areas:

- **Strategist** — product direction and business planning
- **Researcher** — research and analysis
- **Engineer** — technical guidance and development
- **Designer** — product and user experience direction
- **Writer** — documentation and communication
- **Analyst** — structured reasoning and insights

The broader multi-agent workforce is part of Lucy's evolving product vision.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Application Framework | TanStack Start, TanStack Router |
| Build Tool | Vite |
| Styling | Tailwind CSS, Radix UI |
| UI Components | shadcn/ui-style components, Lucide React |
| Animations | Framer Motion |
| State Management | Zustand, TanStack Query |
| Backend / Server Routes | TanStack Start server handlers |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| AI Integration | Vercel AI SDK, Lovable AI Gateway |
| Validation | Zod |
| Analytics | PostHog |
| Error Reporting | Sentry integration |
| Code Quality | ESLint, Prettier |

## Project Structure

```text
lucy-ai-copilot/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── app/
│   │   └── ui/
│   ├── hooks/
│   ├── integrations/
│   │   ├── lovable/
│   │   └── supabase/
│   ├── lib/
│   │   ├── ai-gateway.server.ts
│   │   ├── analytics.ts
│   │   ├── error-capture.ts
│   │   ├── prompt-library.ts
│   │   └── utils.ts
│   ├── routes/
│   │   ├── api/
│   │   │   └── chat.ts
│   │   ├── _app.*.tsx
│   │   ├── auth.tsx
│   │   ├── index.tsx
│   │   └── reset-password.tsx
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── supabase/
│   └── migrations/
├── .gitignore
├── components.json
├── package.json
├── package-lock.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) (compatible with the installed Vite version)
- npm (included with Node.js)
- A [Supabase](https://supabase.com/) project
- A Lovable AI Gateway API key for AI chat functionality

### 1. Clone the Repository

```bash
git clone https://github.com/aradhana-bit/lucy-ai-copilot.git
cd lucy-ai-copilot
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file in the project root. Add your own project configuration:

```env
SUPABASE_PROJECT_ID=your_supabase_project_id
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
LOVABLE_API_KEY=your_lovable_ai_gateway_key
```

Use the values from your Supabase project settings and Lovable AI Gateway configuration. The Lovable AI key is a server-side secret: never expose it in client-side code or commit it to the repository.

### 4. Set Up Supabase

1. Create or select your Supabase project.
2. Apply the SQL migrations located in `supabase/migrations/` to your project.
3. Configure the required Supabase Storage bucket and access policies for workspace file uploads.
4. Confirm that the Supabase URL and publishable key are configured in your environment.

### 5. Run the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal to access Lucy AI.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development-mode build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format project files using Prettier |

## AI Chat Workflow

The AI chat functionality is implemented through the `/api/chat` server endpoint.

1. The signed-in client sends a message with its Supabase access token.
2. The server validates the user's authentication.
3. The conversation history is loaded from Supabase.
4. When a conversation is linked to a project, relevant project and startup memory context is included.
5. The selected model is called through the Lovable AI Gateway.
6. The response is streamed back to the client.
7. The assistant response and token usage are saved to the conversation history.

## Database

Lucy uses **Supabase PostgreSQL** for persistent application data.

The database schema includes workspace-oriented records such as:

- User profiles and workspaces
- Projects and tasks
- Conversations and messages
- Documents and document versions
- Uploaded file metadata
- Startup profiles and project memories
- Activity logs
- Billing and agent session records

Database migrations are maintained in the `supabase/migrations/` directory.

## Development Roadmap

Lucy is evolving toward a more capable AI workforce and unified founder workspace.

- Expand specialized AI agent capabilities
- Improve project-aware memory and knowledge management
- Build richer research and document workflows
- Extend collaboration and workspace functionality
- Add further integrations and automation capabilities

## Design Principles

- **AI-first:** Make AI useful in real project workflows.
- **Unified workspace:** Keep projects, tasks, conversations, and documents connected.
- **Clarity:** Keep the interface focused and easy to navigate.
- **Privacy-conscious:** Keep provider credentials on the server and use authenticated access to workspace data.
- **Scalability:** Build on modular application routes and managed backend services.

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Commit your changes with a clear message.
5. Open a pull request describing your contribution.

## Project Status

Lucy AI is under active development. Features, integrations, and architecture may evolve as the project grows. Some capabilities described in the product vision are planned for future iterations and are not yet implemented as a complete autonomous multi-agent system.

## Purpose

Lucy aims to become a unified AI workspace that helps founders move from ideas to execution by bringing intelligent assistance and essential startup workflows together.

---

<p align="center">
  <strong>Lucy AI</strong><br/>
  The AI Workforce That Builds Your Business.
</p>

<p align="center">
  Developed by <strong>Aaru</strong><br/>
  <a href="https://github.com/aradhana-bit">GitHub Profile</a>
</p>
