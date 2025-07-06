# Aristocrat Messenger

## Introduction

Aristocrat Messenger is a web application that simulates sending and receiving messages with a medieval theme, allowing users to interact through letters, a real-time chat system, and an interactive map. The project is an immersive Single Page Application (SPA) designed to provide a unique messaging experience.

# Project Requirements Checklist

## Mandatory Requirements (60 points)

* [ ] **Correct Submission (0p - Mandatory)**
    * [ ] No `node_modules` folder submitted.
    * [ ] `README.md` file is included.
    * [ ] `README.md`: Contains a detailed description of how to start and test the project.
    * [ ] `README.md`: Lists which criteria have been implemented and which have not.
    * [ ] `README.md`: Includes database credentials.
    * [ ] `README.md`: Includes credentials for two users (one with Admin rights, one without).
    * [ ] Project runs correctly after `npm install` & `node app.js`.
* [x] **User Management (10p)**
    * [x] Users can be displayed.
    * [x] Users can be added.
    * [x] Users can be updated.
    * [x] Users can be deleted.
* [ ] **Design (5p)**
    * [ ] Nice, consistent, and appealing overall design throughout all views.
* [x] **User Registration (5p)**
    * [x] New users can register themselves.
    * [x] Passwords are saved encrypted in the database.
* [x] **User Authentication (5p)**
    * [x] Users can log in and log out (using JWT).
* [x] **Authorization (5p)**
    * [x] Only users with the role "Administrator" can change data.
    * [x] Only "Administrators" can delete profiles of any user.
    * [x] Normal users can only edit their own profile.
* [ ] **Database Entities (10p)**
    * [x] At least 4 other tables (entities) exist in correspondence with users.
    * [x] Connections between entities follow an ER-diagram relationship.
    * [x] At least two of the other tables have a full model, view, and controller implementation (for getting and displaying data).
* [x] **Chat Functionality (5p) (works only when hosted locally. there are some problems with ports and sockete.io)**
    * [x] Chat has different rooms.
    * [x] Users can switch between rooms.
* [x] **Error Handling & Stability (5p)**
    * [x] Everything works as expected.
    * [x] No unhandled errors (server does not crash, no "Internal Server Error" or EJS errors).
    * [x] No blank pages are displayed.
* [x] **Deployment (10p)**
    * [x] Project is hosted online via Campus Cloud.
    * [ ] The hosted project works correctly.
    * [x] The project is shared with the lecturer with the correct rights to start and stop it.

## Optional Criteria (50 points)

* [x] **User Experience (5p)**
    * [x] User-friendly interface that is easy to navigate and understand (self-explaining).
    * [ ] Design is visually appealing, creative, and functional.
* [x] **Documentation (5p)**
    * [x] Functions have comments explaining their purpose.
* [x] **Advanced Error Handling (5p)**
    * [X] All errors are handled properly.
    * [x] A nice/funny "404 not found" page is shown to users.
* [x] **Code Quality (5p)**
    * [x] Code follows naming conventions.
    * [x] Code is tidy, clean, and self-explanatory.
* [x] **Picture Upload (5p)**
    * [x] Picture upload works and uses UUID for naming.
* [x] **Profile Pictures (5p)**
    * [x] Users can upload/update their profile pictures.
    * [x] Old pictures are deleted upon update.
    * [x] The new relation between the user and picture is saved in the database.
* [x] **Chat User Names (5p)**
    * [x] The chat uses the full name of the user when logged in.
    * [ ] The chat uses "guest" for users who are not logged in.
* [x] **JWT Handling (5p)**
    * [x] JWT is passed in the HTTP header, not in cookies.
* [x] **Data Visibility (5p)**
    * [x] Only administrators can view all user data.
    * [x] Users can only see that other users exist and view their "public" profiles.
* [x] **Soft Delete (5p)**
    * [x] Users can delete their own profile via soft-delete (e.g., setting `deleted = true`).


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
      * Handles stateless authentication using JSON Web Tokens (JWT). The `authMiddleware` protects routes by verifying a `Bearer` token in the `Authorization` header.
      * Manages the real-time chat system using `socket.io`, with its own JWT-based authentication for socket connections.
      * Interacts with the MySQL database via Sequelize models for all CRUD operations.
      * Serves static assets (CSS, client-side JS) and user-uploaded files (profile pictures) from the `/public` and `/uploads` directories, respectively.

  * **Client (Vanilla JS):**

      * **`app.js`**: The main entry point that orchestrates routing, event handling, and component rendering.
      * **Routing**: Uses the browser's History API (`pushState`, `popstate`) to handle navigation without full page reloads.
      * **Components (`/public/js/components`)**: The UI is broken down into modular, reusable components (e.g., `HomePageComponent`, `ProfilePaneComponent`, `ChatRoomPageComponent`). Each component is a function that returns a DOM element.
      * **State Management (`/public/js/state.js`)**: A centralized `appState` object holds all shared client-side data (e.g., `isLoggedIn`, `currentUser`). State modifications are handled by dedicated functions.
      * **Reactivity (`/public/js/pubsub.js`)**: A simple Publish/Subscribe system decouples components. State changes `publish` events, and components `subscribe` to these events to reactively update the UI (e.g., the Navbar re-renders when `authStateChanged` is published).
      * **API Communication (`/public/js/api.js`)**: A dedicated module manages all `fetch` calls to the backend API, automatically attaching the JWT for authenticated requests.

## Implemented Features

  * **Full User CRUD & JWT Authentication:** Secure user registration, login, profile updates, and account deletion. Authentication is handled via JWTs, which are stored on the client.
  * **Role-Based Access Control (RBAC):** A distinction between `Admin` and `User` roles, with protected API routes and UI components for administrative functions.
  * **Profile Management:** Users can update their username and email and can upload a profile picture, which is stored on the server.
  * **Location-Based Registration:** New users select a unique starting location on an interactive map, which becomes their home base.
  * **Private Messaging System:** A complete "letter" system allowing users to compose, send, and view private messages (inbox/outbox).
  * **Interactive Map:** A Leaflet.js map displaying all user locations. Users can click on a location to view details and initiate actions like sending a message or joining a chat.
  * **Real-Time Chat:**
      * Each user location has an associated chat room (e.g., "The Great Hall of Dragonstone Keep").
      * Users can join these rooms from the map to engage in real-time conversations with other users.
      * The chat is powered by `socket.io`, with secure, token-authenticated connections.
  * **Admin Panel:** A dedicated page for administrators to manage users, including promoting/demoting users and deleting accounts.

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

1.  **Clone the repository.**

2.  **Install Dependencies:** `npm install`.

3.  **Database Setup:**

      * Ensure a MySQL server is running.
      * Create a database (e.g., `aristocrat_messenger_db`).

4.  **Environment Variables:**

      * Create a `.env` file in the root directory.
      * Add the following variables, replacing the placeholder values:
        ```env
        # General Application Settings
        NODE_ENV=development
        PORT=3000
        JWT_SECRET=a_very_secret_and_long_random_string_for_jwt

        # --- Development Environment (Local Machine) ---
        DB_HOST=your_local_db_host
        DB_PORT=your_local_db_port
        DB_USER=your_local_db_user
        DB_PASSWORD=your_local_db_password
        DB_NAME=aristocrat_messenger_db
        CORS_ORIGIN_DEV=http://localhost:3000

        # --- Production Environment (Hosted Server) ---
        DB_HOST_PROD=your_hosted_db_host
        DB_PORT_PROD=your_hosted_db_port
        DB_USER_PROD=your_hosted_db_user
        DB_PASSWORD_PROD=your_hosted_db_password
        DB_NAME_PROD=your_hosted_db_name
        CORS_ORIGIN_PROD=https://your_production_app_url
        SOCKET_URL_PROD=https://your_production_socket_url:port
        ```

5.  **Run Database Migrations and Seeding:**

      * To set up a fresh database, run the following commands in order. This will clear any existing data, apply all migrations, and run the seeder to populate the database with initial users, locations, and chat rooms.
        ```bash
        npx sequelize-cli db:migrate:undo:all
        npx sequelize-cli db:migrate
        npx sequelize-cli db:seed:all
        ```

6.  **Run the Application:**

      * **Build CSS:** `npm run build:css` (or `npm run watch:css` for development).
      * **Start Server:** `npm run dev` (uses `nodemon` for auto-restarting) or `node app.js`.
      * Access the application at `http://localhost:3000`.
