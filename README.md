# Backend Development Fundamentals & ADBMS Labs

Node.js, Express.js, SQLite, and Backend REST API Lab Assignments.

---

## 👨‍🎓 Student Details

- **Student Name:** DADDANALA RANGA MANOJ KUMAR REDDY
- **Registration Number:** `252U1R5033`
- **Class / Section:** `AI & DE 2A`
- **Subject:** ADBMS (Advanced Database Management Systems) & Backend Development Fundamentals
- **Academic Year:** Year II Term II · Aurora
- **Faculty:** Joel Prashanth D

---

## 🌐 Live Permanent Deployment

- **Production URL:** [https://backend-development-fundamentals-zeta.vercel.app](https://backend-development-fundamentals-zeta.vercel.app)
- **Live Lab 1 Endpoints:**
  - [GET /](https://backend-development-fundamentals-zeta.vercel.app/) (Welcome message)
  - [GET /about](https://backend-development-fundamentals-zeta.vercel.app/about) (Student profile with registration number `252U2R5033`)
  - [GET /time](https://backend-development-fundamentals-zeta.vercel.app/time) (Server timestamp JSON)
  - [GET /invalid](https://backend-development-fundamentals-zeta.vercel.app/invalid) (404 error handler JSON)

---

## 📚 Labs Directory

| Lab Number | Title | Directory | Status |
| :--- | :--- | :--- | :--- |
| **Lab 01** | Node.js and Express Server | [`lab-01/`](./lab-01/) | Completed |
| **Lab 03** | REST API, Query Parameters, Validation & Debugging | [`lab-03/`](./lab-03/) | Completed |

---

## 🚀 Lab 03 Overview

Lab 03 covers:
- Designing a stateless RESTful API adhering to noun-based URIs (`/books`) and standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- Integrating SQLite database with async/await and parameterized SQL queries (`?`) to prevent SQL Injection.
- Implementing dynamic query parameter handling on `GET /books`:
  - `search_q`: Partial title match using SQL `LIKE ?`
  - `order_by`: Dynamic column sorting with whitelist protection
  - `order`: `ASC` or `DESC` sort direction
  - `min_price` & `max_price`: Numerical range filter using SQL `BETWEEN ? AND ?`
  - `limit` & `offset`: Scalable pagination
- Robust request body validation on `POST /books`:
  - Rejection of missing `title`, missing `author`, or invalid `price` with `400 Bad Request` and structured error JSON `{ "message": "..." }`.
- Proper HTTP response status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
- Solutions to 4 key backend bugs: `EADDRINUSE` port conflict, broken module imports, table name typos, and missing `await` statements.
- Complete Postman test collection with 13 requests and an automated test runner (`npm run test-api`).

For detailed documentation, endpoints table, debugging log, and viva answers, refer to [lab-03/README.md](./lab-03/README.md) and [lab-03-report.html](./lab-03/lab-03-report.html).
