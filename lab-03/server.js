const express = require('express');
const path = require('path');
const fs = require('fs');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

// Support serverless (Vercel) writable DB in /tmp
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
 * Initialize SQLite Database connection
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

    // Verify record count and seed exactly the 10 Aurora university books if empty
    const countResult = await db.get(`SELECT COUNT(*) AS count FROM book;`);
    if (countResult && countResult.count === 0) {
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('The Alchemist', 'Paulo Coelho', 250, 208),
        ('Atomic Habits', 'James Clear', 450, 320),
        ('Rich Dad Poor Dad', 'Robert Kiyosaki', 300, 336),
        ('Wings of Fire', 'A.P.J. Abdul Kalam', 200, 180),
        ('Ikigai', 'Hector Garcia', 350, 194),
        ('Think Like a Monk', 'Jay Shetty', 400, 288),
        ('Deep Work', 'Cal Newport', 500, 304),
        ('The Power of Now', 'Eckhart Tolle', 280, 236),
        ('Zero to One', 'Peter Thiel', 320, 210),
        ('The 5 AM Club', 'Robin Sharma', 380, 336);
      `);
    }

    isInitialized = true;

    if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
      app.listen(PORT, () => {
        console.log(`Lab 3 Server running at http://localhost:${PORT}/books`);
      });
    }
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    if (!process.env.VERCEL) process.exit(1);
  }
};

initializeDBAndServer();

// Ensure DB is ready before every request
app.use(async (req, res, next) => {
  if (!db) {
    await initializeDBAndServer();
  }
  next();
});

// Root redirects directly to /books so browser immediately shows the books output
app.get('/', (req, res) => {
  res.redirect('/books');
});

/**
 * Task 1, 2, 3: GET /books/
 * Output format exactly matches faculty specification:
 * {
 *   "message": "Books retrieved successfully.",
 *   "count": 10,
 *   "data": [ ... ]
 * }
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

    res.status(200).json({
      message: 'Books retrieved successfully.',
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * GET /books/:bookId/ - Retrieve single book by ID
 */
app.get('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await db.get(getBookQuery, [bookId]);

    if (!book) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found.` });
    }

    res.status(200).json({
      message: 'Book retrieved successfully.',
      data: book
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 4 & 5: POST /books/
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
      message: 'Book created successfully.',
      data: {
        id: result.lastID,
        title: title.trim(),
        author: author.trim(),
        price: Math.round(Number(price)),
        pages: pages ? Math.round(Number(pages)) : 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 5: PUT /books/:bookId/
 */
app.put('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found.` });
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
      message: 'Book updated successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

/**
 * Task 5: DELETE /books/:bookId/
 */
app.delete('/books/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const checkQuery = `SELECT * FROM book WHERE id = ?;`;
    const existingBook = await db.get(checkQuery, [bookId]);

    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${bookId} not found.` });
    }

    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    await db.run(deleteBookQuery, [bookId]);

    res.status(200).json({
      message: 'Book deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;
