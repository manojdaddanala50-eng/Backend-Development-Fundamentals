# Lab 3: REST API, Query Parameters, Validation, and Debugging

**Course:** ADBMS — Backend Development Fundamentals  
**Academic Year:** Year II Term II · Aurora  
**Faculty:** Joel Prashanth D  
**Department:** Department of Computer Science & Engineering  

---

## 👨‍🎓 Student Profile

- **Student Name:** DADDANALA RANGA MANOJ KUMAR REDDY
- **Registration Number:** `252U2R5033`
- **Class / Section:** `AI AND DE 2A`
- **Subject / Course:** ADBMS (Advanced Database Management Systems) & Backend Development Fundamentals
- **Date of Execution:** 08/11/2026
- **GitHub Repository Link:** [https://github.com/manojdaddanala50-eng/Backend-Development-Fundamentals](https://github.com/manojdaddanala50-eng/Backend-Development-Fundamentals)

---

## 🌐 Live Deployment Link

- **Production URL:** [https://backend-development-fundamentals-zeta.vercel.app](https://backend-development-fundamentals-zeta.vercel.app) *(or Local Environment: `http://localhost:3000`)*

---

## 🎯 Lab Objectives

1. Refactor CRUD endpoints into a production-grade, stateless **RESTful API** adhering to standard HTTP verbs and noun-based URI resources (`/books`).
2. Implement expressive **query parameters** on `GET /books`:
   - `search_q`: Case-insensitive partial title matching with SQL `LIKE ?`.
   - `order_by`: Dynamic column sorting (`id`, `title`, `author`, `price`, `pages`).
   - `order`: Direction of sorting (`ASC` / `DESC`).
   - `limit` & `offset`: Scalable pagination with sensible defaults.
   - `min_price` & `max_price`: Range filtering using SQL `BETWEEN ? AND ?`.
3. Enforce **input validation** on request payloads:
   - Reject missing `title` or `author` with `400 Bad Request` and structured JSON `{ "message": "..." }`.
   - Reject non-numeric or negative `price` with `400 Bad Request`.
4. Apply correct **HTTP status codes**:
   - `200 OK` on successful read, update, or delete.
   - `201 Created` on successful entity creation.
   - `400 Bad Request` on malformed or failing client validation.
   - `404 Not Found` when requesting, updating, or deleting a non-existent entity.
5. Practice real-world **debugging** by diagnosing and resolving four critical Node.js / Express / SQLite runtime errors.

---

## ⚙️ How to Install and Run

### Prerequisites
- Node.js (v18.x or v20+ LTS)
- npm (v9+ or v10+)

### 1. Installation
Navigate into the `lab-03` directory and install project dependencies:
```bash
cd lab-03
npm install
```

### 2. Database Initialization (Auto or Manual)
The server automatically initializes SQLite and seeds 10 sample books if empty on startup. You can also seed manually:
```bash
npm run setup-db
```

### 3. Start Server
Run the production server:
```bash
npm start
```
Or start in development mode with auto-reload using `nodemon`:
```bash
npm run dev
```
The server will be accessible at:
```text
http://localhost:3000/
```

### 4. Run Automated Test Suite
To execute all 15 automated validation and endpoint tests:
```bash
npm run test-api
```

---

## 📡 Endpoints Table

| Method | Endpoint Path | Query / Body Parameters | Success Status | Error Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | None | `200 OK` | `500` | Welcome message & student metadata |
| **GET** | `/books` | `search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price` | `200 OK` | `500` | Fetch books with search, sort, filter, and pagination |
| **GET** | `/books/:bookId` | `bookId` (path parameter) | `200 OK` | `404`, `500` | Retrieve single book by primary key ID |
| **POST** | `/books` | Body: `{ title, author, price, pages }` | `201 Created` | `400`, `500` | Create new book; validates required fields |
| **PUT** | `/books/:bookId` | `bookId` + Body: fields to update | `200 OK` | `400`, `404`, `500` | Update existing book by ID |
| **DELETE** | `/books/:bookId` | `bookId` (path parameter) | `200 OK` | `404`, `500` | Delete book record by ID |
| **ALL** | `/*` | Any undefined path | — | `404 Not Found` | Catch-all handler for undefined endpoints |

---

## 🔍 Detailed Query Parameters Specification (`GET /books`)

| Parameter | Type | Default | Example Value | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `search_q` | String | `""` | `?search_q=Clean` | Filters titles containing substring using `title LIKE ?` |
| `order_by` | String | `"id"` | `?order_by=price` | Whitelist sorted (`id`, `title`, `author`, `price`, `pages`) |
| `order` | String | `"ASC"` | `?order=DESC` | Sort direction (`ASC` or `DESC`) |
| `limit` | Number | `10` | `?limit=5` | Limits the number of returned rows |
| `offset` | Number | `0` | `?offset=10` | Skips specified number of rows (pagination) |
| `min_price` | Number | `0` | `?min_price=400` | Minimum price inclusive |
| `max_price` | Number | `1000000`| `?max_price=800` | Maximum price inclusive via `BETWEEN ? AND ?` |

---

## 🛠️ Debugging Exercise Walkthrough

As part of the laboratory debugging exercise, four standard defects were introduced, identified, and systematically fixed:

### Bug 1: Port Conflict (`EADDRINUSE`)
- **Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Root Cause:** A previous server instance or background process was already occupying port `3000`.
- **Solution:** 
  1. Configured dynamic port assignment via environment variable with fallback: `const PORT = process.env.PORT || 3000;`.
  2. In Windows PowerShell, located and terminated the hanging process using:
     ```powershell
     netstat -ano | findstr :3000
     Stop-Process -Id <PID> -Force
     ```

### Bug 2: Wrong Import Path
- **Symptom:** `Error: Cannot find module './db/connection'` or incorrect relative path.
- **Root Cause:** Inconsistent directory reference when importing the SQLite database handle or native drivers.
- **Solution:** Utilized standard `path.join(__dirname, 'books.db')` and destructured `{ open }` directly from `sqlite` alongside `sqlite3.Database`.

### Bug 3: Table-Name Typo (`no such table: books`)
- **Symptom:** `SQLITE_ERROR: no such table: books`
- **Root Cause:** Schema defined the table singular as `book`, while endpoint queries erroneously referenced plural `books`.
- **Solution:** Audited and synchronized the SQL schema and queries to strictly reference the single unified table name `book`.

### Bug 4: Missing `await` in Database Operations
- **Symptom:** Route returns `Promise { <pending> }` or response sent before query finishes, causing empty array or unresolved data.
- **Root Cause:** Omitting the `await` keyword before `db.all()`, `db.get()`, or `db.run()`.
- **Solution:** Declared all route handlers as `async (req, res) => { ... }` and strictly awaited all asynchronous database calls before executing `res.status().json()`.

---

## 💬 Viva Voce Questions & Answers

### Q1: What is the difference between a Query Parameter and a Path Parameter?
- **Path Parameter (e.g. `/books/:bookId`):** Identifies a specific, individual resource. It is part of the URI path and is mandatory for locating that entity (e.g. `GET /books/4` identifies book with ID 4).
- **Query Parameter (e.g. `/books?order_by=price&limit=5`):** Modifies, filters, sorts, or paginates the resource collection. It appears after the `?` symbol as key-value pairs and is optional with predefined defaults.

### Q2: What does "stateless" mean in the context of REST architecture?
- In a **stateless REST architecture**, the server does not store any client context or session state between requests.
- Every individual client request must contain all information, credentials, headers, and parameters required for the server to understand and process the request independently.

### Q3: Which HTTP status code should be returned for bad client input versus a missing record?
- **Bad Client Input:** `400 Bad Request` — Used when the client submits invalid, missing, or malformed payload data (e.g., missing book title or non-numeric price).
- **Missing Record:** `404 Not Found` — Used when the request syntax is valid, but the target resource ID does not exist in the database (e.g., requesting `GET /books/9999`).

### Q4: What is SQL Injection and how do parameterized queries (`?`) prevent it?
- **SQL Injection:** A vulnerability where malicious SQL commands are entered through client inputs and concatenated directly into the SQL string, altering the query logic.
- **Parameterized Queries:** The SQL engine compiles the query template first with `?` placeholders. Values supplied in the parameters array are strictly treated as literal data values, never as executable SQL code.

---

## 📸 Testing Evidence & Verification

Testing was conducted using Postman and the automated test harness (`test-api.js`). All 15 endpoints and validation rules passed successfully.

### Automated Console Verification Output:
```text
=======================================================
🧪 Starting Automated Verification for Lab 3 REST API
   Student: DADDANALA RANGA MANOJ KUMAR REDDY
   Reg No: 252U2R5033 | Class: AI AND DE 2A
=======================================================

Test 1: Health check / Root
  Status: 200 OK | Message: "Welcome to Lab 3: REST API with Query Parameters, Validation & SQLite"

Test 2: GET /books (Default limit 10)
  Status: 200 OK | Retrieved 10 books

Test 3: GET /books?search_q=Clean (LIKE filter)
  Status: 200 OK | Match: "Clean Code" (Author: Robert C. Martin)

Test 4: GET /books?order_by=price&order=DESC (Sorting)
  Status: 200 OK | Top 3 by price:
   - ₹950: Introduction to Algorithms
   - ₹850: Designing Data-Intensive Applications
   - ₹800: Design Patterns: Elements of Reusable Object-Oriented Software

Test 5: GET /books?min_price=600&max_price=800 (BETWEEN filter)
  Status: 200 OK | Found 4 books in range ₹600-₹800

Test 6: GET /books/2 (Single book retrieval)
  Status: 200 OK | Book ID 2: "Clean Code"

Test 7: GET /books/9999 (Non-existent ID)
  Status: 404 (Expected 404) | Response: "Book with ID 9999 not found"

Test 8: POST /books (Missing Title)
  Status: 400 (Expected 400) | Response: "Validation Error: 'title' is required and must be a non-empty string."

Test 9: POST /books (Non-numeric Price "three-hundred")
  Status: 400 (Expected 400) | Response: "Validation Error: 'price' is required and must be a non-negative number."

Test 10: POST /books (Valid Book Creation)
  Status: 201 (Expected 201) | Created Book ID: 11 | Message: "Book Added Successfully"

Test 11: PUT /books/11 (Update Book)
  Status: 200 (Expected 200) | Response: "Book with ID 11 updated successfully"

Test 12: PUT /books/9999 (Update Non-existent ID)
  Status: 404 (Expected 404) | Response: "Book with ID 9999 not found"

Test 13: DELETE /books/11 (Delete Created Book)
  Status: 200 (Expected 200) | Response: "Book with ID 11 deleted successfully"

Test 14: DELETE /books/9999 (Delete Non-existent ID)
  Status: 404 (Expected 404) | Response: "Book with ID 9999 not found"

Test 15: GET /undefined-endpoint
  Status: 404 (Expected 404) | Response: "Endpoint not found"

=======================================================
✅ ALL 15 VERIFICATION TESTS PASSED SUCCESSFULLY!
=======================================================
```

---

## 📝 Notes & Challenges Overcome

1. **SQL Injection Security:** Dynamically constructing `ORDER BY` cannot use `?` placeholders in SQLite. Addressed by implementing whitelist validation against valid column names (`['id', 'title', 'author', 'price', 'pages']`), defaulting safely to `'id'`.
2. **Robust Type Coercion:** Ensured `limit`, `offset`, and prices sent as query strings are parsed with `parseInt()` and `parseFloat()`, guarding against `NaN` or negative values.
3. **Structured Error Consistency:** Guaranteed that every failure status code (`400`, `404`, `500`) consistently returns a standard JSON envelope: `{ "message": "<Detailed Error>" }`.
