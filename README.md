# MedVault

MedVault is a medical-record dashboard for keeping health information in one place. The app includes pages for reports, AI summaries, medicines, appointments, family records, and analytics.

I put this project together with React and TypeScript, with Firebase for sign-in and data storage and Gemini for some of the AI-powered report features.

## Features

- Sign in with Google using Firebase Authentication
- Upload and manage medical reports
- Generate plain-language summaries of report text with Gemini
- Compare two reports to help spot changes over time
- Keep track of medicines and appointments
- Add family members and organize records
- View health-related information through the dashboard and analytics pages
- Export report information

Some features depend on Firebase and Gemini being configured correctly. This is a project for organizing information and exploring AI-assisted summaries, not a medical diagnosis tool. Check AI-generated explanations with a qualified healthcare professional.

## Tech stack

- React and TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Firebase Authentication and Cloud Firestore
- Google Gemini API
- Express
- Recharts

## Getting started

You'll need a recent version of Node.js and npm.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd MedVault-main
```

Replace `<YOUR_REPOSITORY_URL>` with your repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example` and add the values required for your setup. At minimum, configure a Gemini API key if you want to use the AI summary features.

```bash
cp .env.example .env
```

On Windows, you can copy the file manually or run:

```powershell
Copy-Item .env.example .env
```

Use your own Firebase project configuration as well. Check the Firebase Authentication and Firestore settings in the Firebase console before running the app.

**Keep real API keys, database credentials, and cloud-service secrets out of Git.** If any real credentials have already been pushed to a public repository, revoke or rotate them; deleting them from the file alone is not enough.

### 4. Start the development server

```bash
npm run dev
```

The development server is configured to run at:

```text
http://localhost:3000
```

### 5. Build for production

```bash
npm run build
```

To preview the built app locally:

```bash
npm run preview
```

To check TypeScript types:

```bash
npm run lint
```

## Project structure

```text
MedVault-main/
├── components/ui/       # Reusable UI components
├── src/
│   ├── components/      # App components, upload and export UI
│   ├── lib/             # Firebase, Gemini and export helpers
│   ├── pages/           # Dashboard and feature pages
│   ├── store/           # Client-side state
│   ├── App.tsx
│   └── main.tsx
├── server.ts            # Express + Vite development server
├── firestore.rules      # Firestore access rules
├── package.json
└── README.md
```

## A note about privacy and safety

Medical records are sensitive. Before using this with real patient information, review the data flow, access controls, Firebase rules, logging, and any third-party services that receive report text. Make sure your deployment and data handling meet the requirements that apply to your use case.

AI summaries can miss context or produce incorrect information. They should be used to prepare questions or understand terminology, not to make treatment decisions or replace advice from a healthcare professional.

## Current limitations

This repository is still a work in progress. Some server-side API routes are placeholders, and the available features depend on how Firebase and Gemini are configured. Test the full upload, storage, export, and sign-in flows in your own environment before relying on them.

## Ideas for future work

- Add tests for the main report and account flows
- Improve loading, error, and empty states
- Add a clear way to remove stored reports and account data
- Document deployment and production security settings
- Review AI output handling and privacy safeguards

## Contributing

If you'd like to improve MedVault, open an issue to discuss the change or submit a pull request.
