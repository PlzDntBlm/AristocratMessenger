# Aristocrat Messenger

## Introduction

Aristocrat Messenger is a planned web application to simulate sending and receiving messages with a medieval theme, allowing users to interact through letters, maps, and potentially chat rooms. The project aims to create an immersive Single Page Application (SPA) experience.

The primary requirements and user flows are defined in the `Aristocrat Messenger User Map.pdf` document.

## Target Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** Vanilla JavaScript (Custom Component-Based Architecture, History API for routing)
* **Styling:** TailwindCSS
* **Database:** MySQL
* **ORM:** Sequelize
* **Authentication:** `express-session` for session management, `bcrypt` for password hashing.

**Current Dependencies:**

* `express`
* `express-session`
* `bcrypt`
* `dotenv`
* `mysql2` (MySQL driver)
* `sequelize`
* `sequelize-cli`
* `ejs` (Only for the main `index.ejs` shell)

**Current Dev Dependencies:**

* `tailwindcss`
* `@tailwindcss/cli`
* `nodemon` (Recommended for development)

## Target Architecture (Current SPA Implementation)

The application is built as a Single Page Application (SPA) using client-side rendering and routing:

* **Server (Express):**
    * Serves a minimal main HTML shell (`views/index.ejs`).
    * Provides a JSON API for data operations and authentication (`/api/*`, `/auth/*` routes).
    * Interacts with the MySQL database via Sequelize for data persistence (Users, Messages, etc.).
    * Handles authentication using `express-session` and `bcrypt`.
    * Organizes routes using `express.Router` (`/routes` directory).
    * Uses middleware for sessions and serves the SPA shell for client-side routes (catch-all middleware).
    * Serves static assets (CSS, client-side JS) from the `/public` directory.
* **Client (Vanilla JS):**
    * Main script (`public/js/app.js`) acts as the entry point.
    * Handles client-side routing using the History API (`pushState`, `popstate`).
    * Navigation triggers rendering of appropriate JavaScript components (`public/js/components/*`).
    * Components generate and return DOM elements, manually appended to the content container (`#content`) via helper functions (`public/js/ui.js`).
    * Manages shared application state (`public/js/state.js`).
    * Uses a Publish/Subscribe system (`public/js/pubsub.js`) for reactivity, decoupling state changes from UI updates (e.g., Navbar).
    * Interacts with the backend JSON API using `fetch` via helper functions (`public/js/api.js`).

## Planned Features (Derived from User Map)

### User Authentication & Core

* **Login Page:**
    * User Story: As a resuming user, I want to enter my credentials, so that I can access my account.
    * Features: Login form with email/username & password; Error messaging if invalid.
* **Register Page:**
    * User Story: As a new user, I want to create an account, so that I can send and receive letters.
    * Features: Registration form (username, email, password); On success redirect to login.
* **Logout:**
    * User Story: As an authenticated user I want to log out, so that I can end my session.
    * Features: Clears session.
* **Password Hashing:** Use `bcrypt`.
* **Session Management:** Use `express-session`.

### Main Application Features

* **Solar / Home:**
    * User Story: As a logged-in user, I want to see an overview of my main castle name, new letters, so I know if any new mail arrived.
    * Features: Thematic medieval background; Quick summary of new or in-transit letters.
* **Scriptorium (Compose/Edit):**
    * User Story: As a user, I want a direct entry point to writing new letters, so I can quickly compose. As a user, I want to open a writing desk interface to compose a new letter or edit a draft, so I can send messages with a medieval vibe.
    * Features: Button to open composer; Rich text input; Recipient autocomplete/search; Optional attachments or seals.
* **Cabinet (Letters Overview):**
    * User Story: As a user, I want to view my received letters (inbox), so I can read them. As user, I want to track sent letters (Outbox), so I can see their delivery status.
    * Features: Lists of messages received & sent; Visual "seal" icons for status (in-transit, delivered, read); Mark letter read/unread.
* **Letter Detail:**
    * User Story: As a user, I want to open a specific letter, so I can read its contents or see its travel timeline.
    * Features: Detailed letter view; Possibly includes date/time sent, travel distance, sender signature.
* **Interactive Map:**
    * User Story: As a user, I want to see all users' castles on the map, so I can decide whom to message. As a user I want to see my messenger traveling in real time (or a progress bar), so I know how long it takes.
    * Features: Custom or tile-based map with pinned user castles; On-click show user profile or link to composer; Animated messenger icons or timed progress bar.
* **Profile Page:**
    * User Story: As a user, I want to update my castle name or location, so I can adjust where my messenger is based.
    * Features: Form for changing castle name/coordinates; Possibly upload a user crest or banner image.

### Real-time & Social Features

* **Chat Rooms Overview:**
    * User Story: As a user I want a list of chat rooms, like different taverns, so I can see where discussions happen.
    * Features: Displays existing chat rooms; Option to create or join rooms if allowed.
* **Chat Room (Tavern Interior):**
    * User Story: As a user, I want to join a conversation with multiple users in real-time group chat, so I can quickly discuss or role-play with others.
    * Features: Inside the "room" view; Real-time updates with Socket.IO or polling; List of participants in the room.
* **Notifications:**
    * User Story: As a user I want an alert when a messenger arrives (delivered), so I don't miss important messages.
    * Features: Popup or toast notification in UI; Optional medieval trumpet sound.

### Admin Features

* **Admin Dashboard:**
    * User Story: As an admin, I want to see a quick overview of total users, messages, and active chat sessions, so I can monitor system activity.
    * Features: Basic statistics; Quick links to management sections.
* **User Management:**
    * User Story: As an admin, I want to list all users, so I can handle rule violations or check accounts. As an admin I want to edit or remove any user, so I can manage the user base.
    * Features: Tabular listing of users; Edit user info, location, or role; Option to delete user.
* **Message Management:**
    * User Story: As an admin I want to search or oversee messages in the system, so I can investigate spam or stuck deliveries.
    * Features: Table of all messages (sender, recipient, status); Force delete or resend.
* **Chat Room Management:**
    * User Story: As an admin, I want to create, rename, or remove chat rooms, so I can keep the group chats organized.
    * Features: Add, rename, or delete rooms; Possibly moderate or read chat logs if required.
* **Role-Based Access Control:**
    * User Story: As an admin, I want to access privileged routes (admin panel) that normal users cannot, so I can manage the system.
    * Features: Middleware checking user's role (admin); Hiding admin links/routes from non-admins.

### Global/Technical Goals

* **Secure Authentication:** Session verified on API requests requiring authentication.
* **Responsive Design:** User interface functional and usable on desktop and mobile devices.

## Current Project Structure

```
/
├── app.js              # Main Express server setup
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── .env                # Environment variables (Secrets, DB Config)
├── .gitignore
├── .sequelizerc        # Sequelize ORM config file location
├── config/             # Sequelize DB connection config
│   └── config.js       # Using JS format for env vars
├── migrations/         # Sequelize database migration files
├── seeders/            # Sequelize database seed files (if any)
├── models/             # Database models (Sequelize)
│   └── index.js        # Sequelize model loader
│   └── user.js         # User model definition
│   └── ...             # Other models (e.g., messages - TODO)
├── src/
│   └── input.css       # Tailwind input source
├── public/             # Static assets served by Express
│   ├── css/
│   │   └── output.css  # Generated Tailwind CSS
│   └── js/             # Client-side JavaScript modules
│       ├── app.js      # Main client application logic, routing, event handling
│       ├── api.js      # Client-side fetch calls to backend API
│       ├── state.js    # Client-side state management
│       ├── ui.js       # Generic UI rendering functions (renderContent, etc.)
│       ├── pubsub.js   # Publish/Subscribe system for reactivity
│       └── components/ # Reusable UI component functions
│           ├── Navbar.js
│           ├── LoginPage.js
│           ├── RegisterPage.js
│           └── HomePage.js
│           └── ...     # Future components (e.g., MessageList.js)
├── views/
│   └── index.ejs       # Main SPA layout/shell (served for SPA routes)
├── routes/             # Express routers
│   ├── api.js          # Router for general JSON API endpoints
│   └── auth.js         # Router for authentication API endpoints
└── middleware/         # Express middleware
└── authMiddleware.js # Middleware to protect routes
```

## Setup Instructions

1.  **Clone:** `git clone <repository-url>`
2.  **Install Dependencies:** `npm install`.
3.  **Database Setup:**
    * Ensure you have a MySQL server running locally or accessible.
    * Create a dedicated database for this project (e.g., `aristocrat_messenger_db`).
4.  **Environment Variables:**
    * Create a `.env` file in the root directory (add `.env` to your `.gitignore`).
    * Define necessary variables:
        ```env
        SESSION_SECRET=replace_this_with_a_very_long_random_secure_string
        DB_HOST=localhost
        DB_PORT=3306 # Or your MySQL port
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=aristocrat_messenger_db
        NODE_ENV=development # Or 'production'
        ```
    * Ensure `dotenv` is loaded early in `app.js` and Sequelize `config/config.js`.
5.  **ORM Setup (Sequelize):**
    * Update `config/config.js` to use environment variables.
    * Create models if needed (e.g., `npx sequelize-cli model:generate --name Message --attributes ...`).
    * Run migrations to create/update database tables: `npx sequelize-cli db:migrate`.

## Running the Application

1.  **Build CSS:** Ensure `public/css/output.css` is generated/up-to-date (`npm run build:css` or keep `npm run watch:css` running).
2.  **Run Migrations:** Ensure the database schema is up to date (`npx sequelize-cli db:migrate`).
3.  **Start Server:** `npm run dev` (uses nodemon) or `node app.js`.
4.  **Access:** `http://localhost:3000` (or configured port).

## Development Process

This project is being built iteratively, following the roadmap outlined initially and refined during development. The focus shifted from server-rendered EJS partials to a client-side rendered Single Page Application using Vanilla JavaScript components, the History API, and a central state management approach enhanced by a Pub/Sub system. Development continues to be guided by an AI assistant (Gemini).