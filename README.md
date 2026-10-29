# Loop

Loop is a short-form social media app for discovering creators and sharing video or image posts. It has a responsive browser-based frontend and a Node.js/Express API backed by MongoDB.

## Deployed links

Add your deployment URLs here when they are ready:

| Service | URL |
| --- | --- |
| Frontend | `` |
| Backend API | `https://codealpha-task-2-socialmedia.onrender.com` |

The backend health check is available at `/api/health` (for example, `https://your-backend.example/api/health`).

## Features

- Browse a paginated, newest-first feed or a feed of followed creators.
- Register with email and password, log in, and optionally sign in with Google.
- Create posts with a caption and an image/video upload or direct media URL.
- Like posts, comment, and delete your own posts and comments.
- Search for creators, view profiles, edit your profile, and follow or unfollow people.
- Upload media to Cloudinary when its credentials are configured.

## Tech stack

- **Frontend:** HTML, CSS, and vanilla JavaScript
- **Backend:** Node.js, Express, and Passport
- **Database:** MongoDB with Mongoose
- **Media uploads:** Cloudinary (optional; direct media URLs can be used instead)

## Getting started

### Requirements

- Node.js and npm
- A MongoDB instance (local or hosted)
- Cloudinary credentials if you want to upload files rather than post media URLs

### Configure the backend

From the repository root, install the backend dependencies:

```bash
cd backend
npm install
```

Create `backend/.env` with the following settings:

```dotenv
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/loop
JWT_SECRET=
JWT_EXPIRES_IN=30d

# Optional: required for uploading image/video files to Cloudinary.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: enables Google sign-in when both client credentials are set.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:4000

# Optional: password used for accounts created by the seed script.
SEED_PASSWORD=
```

`MONGO_URI` and `JWT_SECRET` are required for normal operation. Keep real credentials in your local environment or deployment provider's secret settings; do not commit them.

### Run locally

Make sure MongoDB is running, then start the app from `backend/`:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000). The Express server serves the frontend files from `frontend/` as well as the API, so a separate frontend server is not required for local development.

For a regular start without the development watcher, use:

```bash
npm start
```

### Run the tests

From `backend/`, run:

```bash
npm test
```

The tests connect to the database specified by `MONGO_URI`, create temporary test records, and remove those records afterward. Use a test database rather than a database containing important data.

### Optional: add sample data

From `backend/`, run:

```bash
npm run seed
```

**Warning:** the seed script deletes all users, posts, and comments in the configured database before inserting sample data. Only run it against a disposable database. Set `SEED_PASSWORD` to choose the password for the seeded accounts; otherwise the script uses its built-in default.

## Deployment

The backend starts on `PORT` (default `4000`) and serves the files in `frontend/`. You can deploy the combined app as one Node.js service using `backend/` as the service root and `npm start` as its start command. Configure `MONGO_URI` and `JWT_SECRET` in the hosting provider's environment settings.

If you deploy the frontend and backend separately, configure the frontend API base URL to the backend's origin. The frontend reads `window.MEDIA_API_URL`, `window.SOCIAL_API_BASE`, or the `api-base` meta tag, in that order. The current HTML pages initialize these values as empty strings, so set the value in each page (before `api.js` loads) or inject it through your frontend host's configuration. The backend currently enables CORS for browser requests.

For Google sign-in, configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and `FRONTEND_URL` on the backend. Register the exact callback URL with Google; the frontend URL should point to the deployed frontend.

## API overview

All API routes are under `/api`:

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Check that the backend is responding |
| `/api/auth` | Register, log in, retrieve the current user, and optionally use Google sign-in |
| `/api/posts` | Read feeds and posts, create or delete posts, like posts, and manage post comments |
| `/api/comments` | Delete comments |
| `/api/users` | Search creators, view and edit profiles, follow users, and list followers/following |

Most read endpoints are public. Creating posts, liking, commenting, following, and editing or deleting content require authentication.

## Project structure

```text
backend/
  Config/       Database, Cloudinary, and Passport configuration
  Controllers/  API request handlers
  Middleware/   Authentication, uploads, rate limits, and error handling
  Models/       Mongoose models
  Routes/       Express API routes
  Scripts/      Database seed script
  Services/     Media upload service
  Validations/  Request validation
  _tests_/      API tests
  app.js        Express app and route setup
  server.js     Database connection and HTTP server
frontend/
  index.html    Main feed
  login.html    Login
  register.html Account registration
  profile.html  Creator profiles
  upload.html   Post creation
  api.js          Frontend behavior and API client
  profile.js
  auth.js
  feed.js
  upload.js
  styles.css    App styles
```
