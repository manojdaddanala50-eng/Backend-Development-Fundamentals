const express = require('express');
const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

// Support serverless (Vercel) /tmp directory for SQLite writable database
let dbPath = path.join(__dirname, 'books.db');
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'books.db');
  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpDbPath);
      }
    } catch (err) {
      console.warn('Could not copy books.db to /tmp:', err.message);
    }
  }
  dbPath = tmpDbPath;
}

let db = null;
let isInitialized = false;
const PORT = process.env.PORT || 3000;

/**
 * Initialize SQLite Database connection and create tables if needed
 */
const initializeDBAndServer = async () => {
  if (isInitialized && db) return db;

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
    if (countResult && countResult.count === 0) {
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

    isInitialized = true;

    // Start standalone listener when executed directly
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
      app.listen(PORT, () => {
        console.log(`Lab 3 Server running at http://localhost:${PORT}/`);
      });
    }
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    if (!process.env.VERCEL) process.exit(1);
  }
};

// Start initial setup
initializeDBAndServer();

// Ensure DB is ready before every request
app.use(async (req, res, next) => {
  if (!db) {
    await initializeDBAndServer();
  }
  next();
});

// Root welcome endpoint for Lab 3
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Lab 3: REST API with Query Parameters, Validation & SQLite',
    student: {
      name: 'DADDANALA RANGA MANOJ KUMAR REDDY',
      registrationNumber: '252U2R5033',
      section: 'AI AND DE 2A',
      course: 'ADBMS - Backend Development Fundamentals',
      experiment: 'Lab report 3'
    },
    endpoints: {
      getAllBooks: '/books',
      searchBooks: '/books?search_q=Clean',
      sortBooks: '/books?order_by=price&order=DESC',
      filterPriceRange: '/books?min_price=500&max_price=800',
      getSingleBook: '/books/2',
      createBook: 'POST /books',
      updateBook: 'PUT /books/2',
      deleteBook: 'DELETE /books/10'
    }
  });
});

/**
 * Task 1, 2, 3: GET /books/
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

    const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];
    const validOrderBy = allowedColumns.includes(order_by) ? order_by : 'id';
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedMinPrice = Math.max(0, parseFloat(min_price) || 0);
    const parsedMaxPrice = parseFloat(max_price) || 1000000;

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
 * GET /books/:bookId/ - Retrieve single book
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
 * POST /books/ - Create book with validation
 */
app.post('/books', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        message: "Validation Error: 'title' is required and must be a non-empty string."
      });
    }

    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({
        message: "Validation Error: 'author' is required and must be a non-empty string."
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        message: "Validation Error: 'price' is required and must be a non-negative number."
      });
    }

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
 * PUT /books/:bookId/ - Update book
 */
app.put('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found` });
    }

    const { title, author, price, pages } = req.body;

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({
        message: "Validation Error: 'price' must be a non-negative number."
      });
    }

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
 * DELETE /books/:bookId/ - Delete book
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
