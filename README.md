# AnimeVerse - Project Overview & Technical Plan

## 1. Project Overview
AnimeVerse is a premium full-stack anime streaming platform designed to bridge the gap between studios and viewers. The platform allows **Studios** to manage their content (Uploading episodes, editing metadata) while providing **Viewers** with a seamless, cinematic browsing and watching experience.

### Architecture
- **Frontend**: Single Page Application (SPA) with Server-Side capabilities for SEO.
- **Backend**: Express.js REST API handling Auth, RBAC, and Database transactions.
- **Database**: PostgreSQL (Relational) for structured data integrity.
- **Storage**: Firebase Storage for video (MP4) and images.

## Feature Breakdown

| Feature | Description | User Role |
| :--- | :--- | :--- |
| **Anime Browse Page** | Grid display of available shows | Everyone |
| **Studio Dashboard** | Content management for creators | Studio Owner |
| **Video Player** | High-quality streaming with controls | Everyone |
| **Role-Based Access** | Secure access control based on user type | System |

### UI Components
- **Header**: Includes logo and Navigation Bar.
- **Anime Card**: Displays poster and ratings.
- **Upload Form**: Facilitates uploading new episodes.
- **Toast Notifications**: Communicates success or failure states.

- **Front-end**: React 18, Vite, TailwindCSS (Responsive/Dark Theme), motion/react (Animations).
- **Back-end**: Node.js + Express.js.
- **Database**: PostgreSQL (Prisma ORM for migrations).
- **Authentication**: JWT stored in **HttpOnly SameSite=Strict** cookies.
- **Video Player**: HTML5 Video + YouTube IFrame API integration.

---

## 3. Database Schema (PostgreSQL)

```sql
-- Users and Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('viewer', 'studio_owner', 'admin')) DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Studios
CREATE TABLE studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anime Series
CREATE TABLE anime (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    japanese_title TEXT,
    thumbnail TEXT,
    synopsis TEXT,
    rating DECIMAL(3,2),
    release_date DATE,
    studio_id UUID REFERENCES studios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Episodes
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anime_id UUID REFERENCES anime(id),
    season INTEGER,
    episode_number INTEGER,
    title TEXT,
    description TEXT,
    video_url TEXT,
    thumbnail TEXT,
    metadata_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. REST API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get HttpOnly cookie |
| GET | `/api/anime` | Public | List all anime |
| GET | `/api/anime/:id` | Public | Get anime details |
| POST | `/api/anime` | Owner/Admin | Create new anime series |
| POST | `/api/episodes` | Owner/Admin | Add episode to series |
| GET | `/api/studios/:id/dashboard` | Owner | Get studio analytics/content |

---

## 5. Security & Best Practices
- **Role-Based Access Control (RBAC)**: Middleware checks `req.user.role` before sensitive CRUD operations.
- **Input Validation**: **Zod** schema validation for all API requests.
- **Cookies**: JWTs are never accessible to Client JS, mitigating XSS.
- **Security Headers**: **Helmet** middleware configured for XSS, sniffing, and framing protection.
- **Rate Limiting**: Protected routes limited to 100 requests per 15 minutes.

---

## 6. Hosting & Setup Guide (Firebase + Gemini)

Here is the step-by-step guide to set up your Gemini API key and host the website on Firebase.

### Step 1: Add Gemini API Key
To make sure the Gemini AI features work, you need your API key from Google AI Studio.
1. Create a file named `.env` in the root folder of the project.
2. Add your Gemini API key like this:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Note: Replace `your_gemini_api_key_here` with your actual key from https://aistudio.google.com/app/apikey)*

### Step 2: Install Node Modules
Before testing or deploying, install all the required packages:
```bash
npm install
```

### Step 3: Test Locally (Optional)
To test the website on your computer before hosting:
```bash
npm run dev
```

### Step 4: Install Firebase Configuration
You need the Firebase CLI to host the site. Install it globally using npm:
```bash
npm install -g firebase-tools
```

### Step 5: Login to Firebase
Login to your Google account that has the Firebase project:
```bash
firebase login
```

### Step 6: Build the Project
Build the production-ready files for your website:
```bash
npm run build
```

### Step 7: Deploy to Firebase Hosting!
Finally, deploy your website to live:
```bash
firebase deploy --only hosting
```
Your website is now live! 🚀🔥
