# Aristocrat Messenger

## Introduction

Aristocrat Messenger is a planned web application to simulate sending and receiving messages with a medieval theme, allowing users to interact through letters, maps, and potentially chat rooms. The project aims to create an immersive Single Page Application (SPA) experience.

The primary requirements and user flows are defined in the `Aristocrat Messenger User Map.pdf`  and `Aristocrat Messenger User Flow.pdf` documents.

## Target Tech Stack

* **Backend:** Node.js, Express.js
* **Templating:** EJS (Embedded JavaScript Templating)
* **Frontend:** Vanilla JavaScript
* **Styling:** TailwindCSS
* **Database:** MySQL
* **ORM:** Sequelize (or Prisma) - To be used for database interaction and modeling.
* **Authentication:** `express-session` for session management, `bcrypt` for password hashing. (JWT is noted as a potential alternative in the User Map ).

**Planned Initial Dependencies:**

* `express` 
* `ejs` 
* `express-session`
* `bcrypt`
* `dotenv`
* `mysql2` (MySQL driver)
* `sequelize` (or `prisma`)
* `sequelize-cli` (if using Sequelize)

**Planned Initial Dev Dependencies:**

* `tailwindcss` 
* `@tailwindcss/cli` 
* `nodemon` (Recommended for development)

## Target Architecture

The application will be built as a Single Page Application (SPA) using dynamic content loading:

* **Server (Express):**
    * Serves a main HTML shell (`views/index.ejs`).
    * Provides API endpoints to fetch EJS partials (`views/partials/`) and handle data operations.
    * Interacts with the MySQL database via an ORM (Sequelize) for data persistence (Users, Messages, etc.).
    * Handles authentication (`/auth/*` routes) and other API logic.
    * Organizes routes using `express.Router` (e.g., in a `/routes` directory).
    * Uses middleware for sessions, global data (`res.locals`), and auth checks.
    * Serves static assets (CSS, client-side JS) from a `/public` directory.
* **Client (Vanilla JS):**
    * The main script in `index.ejs` handles client-side routing using the History API (`pushState`, `popstate`).
    * Navigation triggers fetching of relevant EJS partial HTML via `fetch`.
    * Fetched HTML is injected into a content container (e.g., `#content`) in `index.ejs`.
    * JavaScript behavior specific to partials will be managed (likely via separate JS files in `/public/js/partials/` loaded dynamically, potentially using an `init`/`destroy` pattern) to keep `index.ejs` focused on routing and core state.

## Planned Features (Derived from User Map )

### User Authentication & Core

* **Login Page:**
    * User Story: As a resuming user, I want to enter my credentials, so that I can access my account.
    * Features: Login form with email/username & password; Error messaging if invalid.
* **Register Page:**
    * User Story: As a new user, I want to create an account, so that I can send and receive letters.
    * Features: Registration form (username, email, password); On success redirect to login.
* **Logout:**
    * User Story: As an authenticated user I want to log out, so that I can end my session.
    * Features: Clears JWT or removes session.
* **Password Hashing:** Use `bcrypt`.
* **Session Management:** Use `express-session` or JWT.

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

* **Secure Authentication:** JWT or Session verified on every request.
* **Responsive Design:** User interface functional and usable on desktop and mobile devices.

## Proposed Project Structure

```
/
├── app.js              # Main Express server setup
├── package.json
├── tailwind.config.js
├── .env                # Environment variables (Secrets, DB Config)
├── .gitignore
├── .sequelizerc        # (If using Sequelize) ORM config
├── config/             # (If using Sequelize) DB connection config
│   └── config.json
├── migrations/         # (If using Sequelize) Database migration files
├── seeders/            # (If using Sequelize) Database seed files
├── models/             # Database models (Sequelize or Prisma schema)
│   └── index.js        # (If using Sequelize) Model loader
│   └── user.js
│   └── ...
├── sequelize/             # (If using squelize) Schema and client setup
├── src/
│   └── input.css       # Tailwind input source
├── public/             # Static assets
│   ├── css/
│   │   └── output.css  # Generated Tailwind CSS
│   └── js/
│       └── partials/   # For partial-specific JS (planned)
├── views/
│   ├── index.ejs       # Main SPA layout/shell
│   └── partials/       # EJS partial views (home, login, etc.)
├── routes/             # Express routers
│   └── auth.js         # Router for auth endpoints (planned)
└── middleware/         # Express middleware (planned)
├── authMiddleware.js
└── localsMiddleware.js
```
*(Structure includes directories commonly used with ORMs like Sequelize)*

## Setup Instructions (Initial)

1.  **Clone:** `git clone <repository-url>`
2.  **Install Dependencies:** `npm install` (ensure planned dependencies like `sequelize`, `mysql2`, `dotenv`, `bcrypt`, `express-session` are added to `package.json` first).
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
        NODE_ENV=development
        ```
    * Use `dotenv` package (`npm install dotenv`) to load these in `app.js` and ORM config files.
5.  **ORM Setup:**
    * **(If Sequelize):** Initialize Sequelize (`npx sequelize-cli init`), update `config/config.json` to use environment variables. Create models (e.g., `npx sequelize-cli model:generate --name User --attributes ...`). Run migrations (`npx sequelize-cli db:migrate`).
6.  **Tailwind CSS:** Run `npx tailwindcss -i ./src/input.css -o ./public/css/output.css --watch` during development. (Consider adding this as an npm script).

## Running the Application (Initial)

1.  **Build CSS:** Ensure `output.css` is generated.
2.  **Run Migrations:** Ensure the database schema is up to date (e.g., `npx sequelize-cli db:migrate` or `npx prisma migrate deploy`).
3.  **Start Server:** `node app.js` (or `npm start` / `npm run dev` if scripts are added).
4.  **Access:** `http://localhost:3000` (or configured port).

## Development Process

This project will be built iteratively, starting with the basic server and SPA structure, integrating the ORM and database, followed by authentication, and then implementing core features based on the User Map. Development will be guided by an AI assistant (Gemini).