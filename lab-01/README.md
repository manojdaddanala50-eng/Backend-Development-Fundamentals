# Lab 1: Node.js and Express Server

---

## 👨‍🎓 Student Profile

- **Lab Title:** Lab 1: Node.js and Express Server
- **Student Name:** D. Manoj
- **Registration Number:** 252U1R5033
- **Section:** `[Enter Your Section Here]`
- **Academic Year:** 2026-2027
- **Live Deployed URL:** [https://agile-tin-oyyr1rx.tmp.now](https://agile-tin-oyyr1rx.tmp.now)

---

## 🎯 Project Objective

The primary objective of this laboratory assignment is to gain hands-on experience in server-side JavaScript development using **Node.js** and the **Express.js** web framework. 

Specifically, this lab demonstrates:
1. Setting up and initializing a structured Node.js project environment using npm.
2. Understanding the role, structure, and key fields of `package.json`.
3. Creating a low-level HTTP web server using Node.js's built-in `http` module.
4. Installing, configuring, and building an expressive REST web server using the `express` framework.
5. Implementing HTTP route handlers (`GET /`, `GET /about`, `GET /time`).
6. Handling client requests with appropriate HTTP status codes (such as `200 OK` and `404 Not Found`).
7. Formatting responses as both plain text and structured JSON.

---

## 💻 Technologies Used

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v20+ LTS)
- **Web Framework:** [Express.js](https://expressjs.com/) (v5.x)
- **Built-in Modules:** `http`, `path`
- **Package Manager:** `npm` (Node Package Manager)
- **Language:** JavaScript (ES6+ / CommonJS)

---

## 📁 Project Directory Structure

```text
lab-01/
├── package.json         # Project metadata, scripts, and dependencies
├── package-lock.json    # Exact dependency tree lockfile
├── server.js            # Express.js server with routes and 404 handler
├── basic-server.js      # Minimal HTTP server using Node.js built-in 'http'
├── README.md            # Comprehensive project documentation
├── .gitignore           # Ignores node_modules, logs, and OS files
└── screenshots/         # Captured verification screenshots
    ├── 01_server_startup.png
    ├── 02_welcome_route.png
    ├── 03_about_route.png
    ├── 04_time_route.png
    └── 05_404_route.png
```

---

## 📦 Detailed Explanation of `package.json`

The `package.json` file is the heart of any Node.js project. It serves as the project manifest containing metadata, dependency declarations, and automation scripts.

Below is the annotated `package.json` created for this assignment:

```json
{
  "name": "lab-01",
  "version": "1.0.0",
  "description": "Lab 1: Node.js and Express Server practical assignment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "start:basic": "node basic-server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "nodejs",
    "express",
    "http",
    "server",
    "lab-01"
  ],
  "author": "D. Manoj",
  "license": "ISC",
  "dependencies": {
    "express": "^5.3.0"
  }
}
```

### Important Fields Explained:

| Field | Purpose | Significance |
| :--- | :--- | :--- |
| **`name`** | Unique package identifier | Names the project (`lab-01`). Must be lowercase and URL-friendly. |
| **`version`** | Project version number | Follows Semantic Versioning (SemVer: `MAJOR.MINOR.PATCH`). Starts at `1.0.0`. |
| **`description`** | Short summary | Explains the intent of the project for faculty or other developers. |
| **`main`** | Entry point | The primary script executed when loading the package (`server.js`). |
| **`scripts`** | Command shortcuts | Defines custom terminal commands (e.g., `npm start` runs `node server.js`). |
| **`dependencies`** | Production libraries | Lists external packages required for runtime execution (e.g., `express`). The caret (`^`) permits minor/patch updates. |
| **`author`** | Developer credit | States the creator's name (`D. Manoj`). |
| **`license`** | Usage permissions | Specifies open-source licensing terms (e.g., `ISC` or `MIT`). |

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Steps to Run:

1. **Open your terminal or command prompt** and navigate to the project root directory:
   ```bash
   cd lab-01
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```
   *(Note: This creates the `node_modules` folder and validates `package-lock.json`.)*

3. **Running the Built-in HTTP Server (`basic-server.js`):**
   ```bash
   npm run start:basic
   # OR directly:
   node basic-server.js
   ```
   - Opens on: `http://localhost:3000`
   - Response: Returns `"Hello"` in plain text.
   - Press `Ctrl + C` to stop the server before starting the Express server.

4. **Running the Express.js Server (`server.js`):**
   ```bash
   npm start
   # OR directly:
   node server.js
   ```
   - Opens on: `http://localhost:3000`
   - Available endpoints are detailed below.

---

## 🌐 API Endpoints Specification

### 1. Welcome Endpoint
* **Endpoint:** `GET /`
* **Description:** Serves as the default root landing route, returning a friendly welcome message.
* **HTTP Status Code:** `200 OK`
* **Response Content-Type:** `text/html; charset=utf-8`
* **Response Body:**
  ```text
  Welcome to Lab 1: Node.js and Express Server!
  ```

---

### 2. About Endpoint
* **Endpoint:** `GET /about`
* **Description:** Returns author profile information including student name, registration number (252U1R5033), and section placeholder in structured JSON.
* **HTTP Status Code:** `200 OK`
* **Response Content-Type:** `application/json; charset=utf-8`
* **Sample Response Body:**
  ```json
  {
    "studentName": "D. Manoj",
    "registrationNumber": "252U1R5033",
    "section": "[Your Section]"
  }
  ```

---

### 3. Current Time Endpoint
* **Endpoint:** `GET /time`
* **Description:** Returns the real-time server timestamp dynamically generated using JavaScript's native `new Date()`.
* **HTTP Status Code:** `200 OK`
* **Response Content-Type:** `application/json; charset=utf-8`
* **Sample Response Body:**
  ```json
  {
    "currentTime": "2026-11-01T13:35:22.263Z",
    "formattedDateTime": "Sun Nov 01 2026 19:05:22 GMT+0530 (India Standard Time)",
    "timestamp": 1793540122263
  }
  ```

---

### 4. Catch-All 404 Route (Unknown Endpoints)
* **Endpoint:** `GET /*` (e.g., `GET /invalid` or `GET /not-found`)
* **Description:** Any undefined route triggers the custom 404 error middleware, notifying the client that the requested resource is missing.
* **HTTP Status Code:** `404 Not Found`
* **Response Content-Type:** `application/json; charset=utf-8`
* **Sample Response Body:**
  ```json
  {
    "statusCode": 404,
    "error": "Not Found",
    "message": "The requested endpoint '/invalid' does not exist on this server."
  }
  ```

---

## 📸 Screenshots & Output Verification

All screenshots verifying successful implementation are stored in the `screenshots/` directory:

| Screenshot | Description | File Path |
| :--- | :--- | :--- |
| **Server Startup** | Terminal console showing `node server.js` listening on port 3000 and logging incoming requests | `screenshots/01_server_startup.png` |
| **Welcome Route** | Browser response for `GET http://localhost:3000/` returning `200 OK` | `screenshots/02_welcome_route.png` |
| **About Route** | Browser JSON response for `GET http://localhost:3000/about` with student details | `screenshots/03_about_route.png` |
| **Time Route** | Browser JSON response for `GET http://localhost:3000/time` with dynamic `new Date()` | `screenshots/04_time_route.png` |
| **404 Route** | Browser JSON error response for `GET http://localhost:3000/invalid` returning `404 Not Found` | `screenshots/05_404_route.png` |

---

## 🛠️ Problems Faced & Solutions

### 1. Port Conflict (`EADDRINUSE`)
- **Problem:** Attempting to start the Express server while `basic-server.js` was still listening on port 3000 caused Node.js to crash with `Error: listen EADDRINUSE: address already in use :::3000`.
- **Solution:** Terminated the previous process using `Ctrl + C` (or killing the process via task manager/PowerShell) before launching `server.js`. In production or multi-server scenarios, different ports (e.g. 3000 and 3001) or dynamic port configuration via `process.env.PORT` should be utilized.

### 2. Accidental Inclusion of `node_modules`
- **Problem:** The `node_modules` directory contains hundreds of third-party files totaling many megabytes, which slows down source control and causes repository bloat.
- **Solution:** Added a `.gitignore` file specifying `node_modules/` before staging or committing any code. All dependencies are reliably reinstalled with a single command (`npm install`) through `package.json`.

### 3. Handling 404 Routes Without Crashing
- **Problem:** Default Express behavior for undefined routes returns an unformatted HTML error (`Cannot GET /route`).
- **Solution:** Implemented a dedicated catch-all middleware (`app.use((req, res) => { ... })`) placed strictly after all defined route handlers. This explicitly sets `res.status(404)` and sends a clean, structured JSON response.

### 4. Setting Correct HTTP Headers and Content Types
- **Problem:** When sending JSON in the native `http` module, manually configuring `res.writeHead(200, { 'Content-Type': 'application/json' })` and calling `JSON.stringify()` is required, which is verbose and prone to formatting mistakes.
- **Solution:** Switched to Express's built-in `res.json()` and `res.status()`, which automatically stringify JavaScript objects and assign the appropriate `Content-Type: application/json; charset=utf-8` header.

---

## 🎓 Viva Questions & Answers (Faculty Preparation)

**Q1: What is the difference between Node.js and Express.js?**  
*Answer:* Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine that allows JavaScript to run outside the browser. Express.js is a lightweight, flexible web application framework built on top of Node.js that simplifies routing, middleware integration, and request/response handling.

**Q2: Why do we need `package-lock.json` when we already have `package.json`?**  
*Answer:* `package.json` defines version ranges (e.g., `^5.3.0`), while `package-lock.json` records the exact version of every installed package and dependency down to the SHA hash. This ensures that every developer and build system installs the exact same dependency tree.

**Q3: What does middleware mean in Express?**  
*Answer:* Middleware functions are functions that have access to the request object (`req`), the response object (`res`), and the `next` function in the application’s request-response cycle. They can execute code, modify `req` and `res`, end the request-response cycle, or call `next()` to pass control to the next middleware.

**Q4: Why must the 404 handler be placed at the bottom of `server.js`?**  
*Answer:* Express processes routes and middleware sequentially from top to bottom. If a 404 handler is placed above valid routes, it will intercept all requests before they can reach their intended route handlers. Placing it at the bottom ensures it only triggers when no matching route was found.
