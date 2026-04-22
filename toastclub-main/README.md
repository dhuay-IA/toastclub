# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Backend API

This repo now also includes a Node.js + Express API under [`server/`](./server) for authentication and OTP flows.

### API setup

1. Copy `server/.env.local.example` to `server/.env.local`
2. Fill in the backend values in `server/.env.local`
3. Run the SQL in [`server/models/schema.sql`](./server/models/schema.sql)
4. Start the API with `npm run dev:api`

### Available endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/send-otp`
- `POST /api/verify-otp`
- `GET /api/profile`

## Environment files

- Frontend example: [`.env.local.example`](./.env.local.example)
- Backend example: [`server/.env.local.example`](./server/.env.local.example)

Do not commit real `.env.local` files or production secrets.

## Deployment notes

This project is split into two parts:

- Frontend (`Vite/React`): can be built with `npm run build` and uploaded from `dist/`
- Backend (`Node/Express`): must be hosted on a Node-compatible platform

Recommended setup:

- Frontend on SiteGround
- MySQL database on SiteGround
- Backend API on a Node-compatible host such as Render or Railway

Production checklist:

1. Set `VITE_API_URL` in the frontend environment to your public API URL
2. Set backend environment variables from `server/.env.local.example`
3. Add your admin emails in `ADMIN_EMAILS`
4. Set `CORS_ORIGIN` to your real frontend domain
5. Point `VR_API_BASE_URL` to your public backend URL

## Railway + PPT/PPTX

If you deploy the backend to Railway and want PPT/PPTX conversion to work, use the included [`Dockerfile`](./Dockerfile) instead of the default Railpack builder. The Docker image installs LibreOffice so the `soffice` command is available to the API.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
