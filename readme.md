Of course. Here is the updated `README.md` file with the new database seeding instructions. You can copy and paste the
content directly.

# Aristocrat Messenger

## Introduction

Aristocrat Messenger is a web application that simulates sending and receiving messages with a medieval theme, allowing
users to interact through letters, a real-time chat system, and an interactive map. The project is an immersive Single
Page Application (SPA) designed to provide a unique messaging experience.

## Tech Stack

* **Backend:**
  * Node.js, Express.js
  * MySQL with Sequelize ORM
  * `jsonwebtoken` (JWT) for stateless API authentication
  * `bcrypt` for password hashing
  * `socket.io` for real-time chat functionality
  * `multer` for handling file uploads (profile pictures)
* **Frontend:**
  * Vanilla JavaScript (ES Modules)
  * Custom Component-Based Architecture
  * History API for client-side routing
  * Centralized state management with a Publish/Subscribe system
* **Styling:**
  * Tailwind CSS v4 (with JIT compilation)

## Architecture

The application is built as a Single Page Application (SPA) with a distinct client-server architecture:

* **Server (Express):**

  * Serves a minimal main HTML shell (`views/index.ejs`).
  * Provides a RESTful JSON API for all data operations (`/api/*`, `/auth/*`, `/api/chat/*`).
  * Handles stateless authentication using JSON Web Tokens (JWT). The `authMiddleware` protects routes by verifying a
    `Bearer` token in the `Authorization` header.
  * Manages the real-time chat system using `socket.io`, with its own JWT-based authentication for socket connections.
  * Interacts with the MySQL database via Sequelize models for all CRUD operations.
  * Serves static assets (CSS, client-side JS) and user-uploaded files (profile pictures) from the `/public` and
    `/uploads` directories, respectively.

* **Client (Vanilla JS):**

  * **`app.js`**: The main entry point that orchestrates routing, event handling, and component rendering.
  * **Routing**: Uses the browser's History API (`pushState`, `popstate`) to handle navigation without full page
    reloads.
  * **Components (`/public/js/components`)**: The UI is broken down into modular, reusable components (e.g.,
    `HomePageComponent`, `ProfilePaneComponent`, `ChatRoomPageComponent`). Each component is a function that returns a
    DOM element.
  * **State Management (`/public/js/state.js`)**: A centralized `appState` object holds all shared client-side data (
    e.g., `isLoggedIn`, `currentUser`). State modifications are handled by dedicated functions.
  * **Reactivity (`/public/js/pubsub.js`)**: A simple Publish/Subscribe system decouples components. State changes
    `publish` events, and components `subscribe` to these events to reactively update the UI (e.g., the Navbar
    re-renders when `authStateChanged` is published).
  * **API Communication (`/public/js/api.js`)**: A dedicated module manages all `fetch` calls to the backend API,
    automatically attaching the JWT for authenticated requests.

## Implemented Features

* **Full User CRUD & JWT Authentication:** Secure user registration, login, profile updates, and account deletion.
  Authentication is handled via JWTs, which are stored on the client.
* **Role-Based Access Control (RBAC):** A distinction between `Admin` and `User` roles, with protected API routes and UI
  components for administrative functions.
* **Profile Management:** Users can update their username and email and can upload a profile picture, which is stored on
  the server.
* **Location-Based Registration:** New users select a unique starting location on an interactive map, which becomes
  their home base.
* **Private Messaging System:** A complete "letter" system allowing users to compose, send, and view private messages (
  inbox/outbox).
* **Interactive Map:** A Leaflet.js map displaying all user locations. Users can click on a location to view details and
  initiate actions like sending a message or joining a chat.
* **Real-Time Chat:**
  * Each user location has an associated chat room (e.g., "The Great Hall of Dragonstone Keep").
  * Users can join these rooms from the map to engage in real-time conversations with other users.
  * The chat is powered by `socket.io`, with secure, token-authenticated connections.
* **Admin Panel:** A dedicated page for administrators to manage users, including promoting/demoting users and deleting
  accounts.

## Project Structure

```
/
├── app.js              # Main Express server, middleware, and socket.io setup
├── package.json
├── tailwind.config.js
├── .env                # Environment variables (DB credentials, JWT_SECRET)
├── config/
│   └── config.js       # Sequelize configuration
├── migrations/         # Database schema migrations
├── seeders/            # Database seed files
├── models/             # Sequelize ORM models (User, Location, Message, etc.)
├── public/
│   ├── css/output.css  # Compiled Tailwind CSS
│   └── js/             # Client-side JavaScript
│       ├── app.js      # Main SPA logic, router, and event listeners
│       ├── api.js      # All client-side API fetch calls
│       ├── state.js    # Global state management
│       ├── pubsub.js   # Publish/Subscribe event system
│       ├── ui.js       # Core UI rendering functions
│       ├── socketService.js # Singleton for managing the socket.io client
│       └── components/ # All UI components (Navbar, HomePage, ProfilePane, etc.)
├── routes/
│   ├── api.js          # General API routes (users, messages, locations)
│   ├── auth.js         # Authentication routes (login, register)
│   └── chat.js         # API routes for chat rooms and messages
├── socket/
│   └── chatHandler.js  # Server-side logic for all socket.io events
├── src/
│   └── input.css       # Tailwind CSS source file
├── uploads/            # Directory for user-uploaded profile pictures
└── views/
    └── index.ejs       # The single HTML shell for the SPA
```

## Setup & Running

1. **Clone the repository.**

2.  **Install Dependencies:** `npm install`.

3.  **Database Setup:**

* Ensure a MySQL server is running.
* Create a database (e.g., `aristocrat_messenger_db`).

4.  **Environment Variables:**

* Create a `.env` file in the root directory.
* Add the following variables, replacing the placeholder values:
  ```env
  JWT_SECRET=a_very_secret_and_long_random_string_for_jwt
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  DB_NAME=aristocrat_messenger_db
  NODE_ENV=development
  ```

5. **Run Database Migrations and Seeding:**

* To set up a fresh database, run the following commands in order. This will clear any existing data, apply all
  migrations, and run the seeder to populate the database with initial users, locations, and chat rooms.
  ```bash
  npx sequelize-cli db:migrate:undo:all
  npx sequelize-cli db:migrate
  npx sequelize-cli db:seed:all
  ```

6. **Run the Application:**

* **Build CSS:** `npm run build:css` (or `npm run watch:css` for development).
* **Start Server:** `npm run dev` (uses `nodemon` for auto-restarting) or `node app.js`.
* Access the application at `http://localhost:3000`.