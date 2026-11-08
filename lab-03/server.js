const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');
let db = null;
const PORT = process.env.PORT || 3000;

/**
 * Initialize SQLite Database connection and start Express server
 */
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure the book table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // Seed data if table is empty
    const countResult = await db.get(`SELECT COUNT(*) AS count FROM book;`);
    if (countResult.count === 0) {
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 450, 320),
        ('Clean Code', 'Robert C. Martin', 650, 464),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 350, 176),
        ('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma', 800, 395),
        ('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 550, 278),
        ('The Pragmatic Programmer', 'Andrew Hunt', 700, 352),
        ('Eloquent JavaScript', 'Marijn Haverbeke', 400, 472),
        ('Introduction to Algorithms', 'Thomas H. Cormen', 950, 1312),
        ('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 600, 448),
        ('Designing Data-Intensive Applications', 'Martin Kleppmann', 850, 616);
      `);
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
      });
    }
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Health check / Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Lab 3: REST API with Query Parameters, Validation & SQLite',
    student: {
      name: 'DADDANALA RANGA MANOJ KUMAR REDDY',
      registrationNumber: '252U2R5033',
      section: 'AI AND DE 2A',
      course: 'ADBMS - Backend Development Fundamentals'
    },
    documentation: '/books'
  });
});

/**
 * Task 1, 2, 3: GET /books/
 * Supports Query Parameters:
 * - search_q: partial search on title using LIKE
 * - order_by: column name (id, title, author, price, pages)
 * - order: ASC or DESC
 * - limit: max number of books (default 10)
 * - offset: pagination offset (default 0)
 * - min_price, max_price: price range filter using BETWEEN
 */
app.get('/books', async (req, res) => {
  try {
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = 10,
      offset = 0,
      min_price = 0,
      max_price = 1000000
    } = req.query;

    // Sanitize and validate ORDER BY to protect against SQL injection
    const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];
    const validOrderBy = allowedColumns.includes(order_by) ? order_by : 'id';
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Parse numeric query parameters
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedMinPrice = Math.max(0, parseFloat(min_price) || 0);
    const parsedMaxPrice = parseFloat(max_price) || 1000000;

    // Parameterized SQL query
    const getBooksQuery = `
      SELECT * FROM book
      WHERE title LIKE ?
        AND price BETWEEN ? AND ?
      ORDER BY ${validOrderBy} ${validOrder}
      LIMIT ? OFFSET ?;
    `;

    const queryParams = [
      `%${search_q}%`,
      parsedMinPrice,
      parsedMaxPrice,
      parsedLimit,
      parsedOffset
    ];

    const books = await db.all(getBooksQuery, queryParams);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * GET /books/:bookId/ - Retrieve a single book by ID
 */
app.get('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found` });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 4 & 5: POST /books/
 * Creates a new book record with comprehensive body validation.
 * Rejects missing title, missing author, or non-numeric price with 400 Bad Request.
 * Returns 201 Created on success.
 */
app.post('/books', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // Validation 1: Title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        message: "Validation Error: 'title' is required and must be a non-empty string."
      });
    }

    // Validation 2: Author
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({
        message: "Validation Error: 'author' is required and must be a non-empty string."
      });
    }

    // Validation 3: Price (must be numeric and non-negative)
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        message: "Validation Error: 'price' is required and must be a non-negative number."
      });
    }

    // Validation 4: Pages (optional or must be positive integer)
    if (pages !== undefined && (isNaN(Number(pages)) || Number(pages) <= 0)) {
      return res.status(400).json({
        message: "Validation Error: 'pages' must be a positive integer."
      });
    }

    const insertBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const result = await db.run(insertBookQuery, [
      title.trim(),
      author.trim(),
      Math.round(Number(price)),
      pages ? Math.round(Number(pages)) : 100
    ]);

    res.status(201).json({
      message: 'Book Added Successfully',
      bookId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 5: PUT /books/:bookId/
 * Updates an existing book.
 * Returns 200 OK after update, 404 when ID does not exist, 400 for bad input.
 */
app.put('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found` });
    }

    const { title, author, price, pages } = req.body;

    // Validate price if supplied
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({
        message: "Validation Error: 'price' must be a non-negative number."
      });
    }

    // Validate pages if supplied
    if (pages !== undefined && (isNaN(Number(pages)) || Number(pages) <= 0)) {
      return res.status(400).json({
        message: "Validation Error: 'pages' must be a positive integer."
      });
    }

    const updatedTitle = title !== undefined && String(title).trim() !== '' ? String(title).trim() : existingBook.title;
    const updatedAuthor = author !== undefined && String(author).trim() !== '' ? String(author).trim() : existingBook.author;
    const updatedPrice = price !== undefined ? Math.round(Number(price)) : existingBook.price;
    const updatedPages = pages !== undefined ? Math.round(Number(pages)) : existingBook.pages;

    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;

    await db.run(updateBookQuery, [
      updatedTitle,
      updatedAuthor,
      updatedPrice,
      updatedPages,
      bookId
    ]);

    res.status(200).json({
      message: `Book with ID ${bookId} updated successfully`
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 5: DELETE /books/:bookId/
 * Deletes a book record.
 * Returns 200 OK after delete, 404 when ID does not exist.
 */
app.delete('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found` });
    }

    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: `Book with ID ${bookId} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

// Catch-all 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;
