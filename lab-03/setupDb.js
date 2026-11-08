const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'books.db');

async function setupDatabase() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log('Connected to SQLite database at:', dbPath);

    // Drop and re-create to match faculty exact 10 books
    await db.exec(`DROP TABLE IF EXISTS book;`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);
    console.log('Table "book" verified/created successfully.');

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
    console.log('Exact 10 faculty sample books inserted successfully.');

    const countRow = await db.get(`SELECT COUNT(*) AS count FROM book;`);
    console.log(`Verified total books in DB: ${countRow.count}`);

    await db.close();
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, dbPath };
