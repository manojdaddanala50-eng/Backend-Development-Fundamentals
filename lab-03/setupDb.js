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

    const countRow = await db.get(`SELECT COUNT(*) AS count FROM book;`);
    if (countRow.count === 0) {
      console.log('Seeding initial records...');
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
      console.log('10 sample books inserted successfully.');
    } else {
      console.log(`Database already has ${countRow.count} records.`);
    }

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
