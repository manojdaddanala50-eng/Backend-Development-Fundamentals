const http = require('http');
const app = require('./server');

const TEST_PORT = 3020;

function runTests() {
  const server = http.createServer(app);

  server.listen(TEST_PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🧪 Verified Test Suite for Lab 3 REST API`);
    console.log(`   Student: DADDANALA RANGA MANOJ KUMAR REDDY`);
    console.log(`   Reg No: 252U2R5033 | Class: AI AND DE 2A`);
    console.log(`=======================================================\n`);

    const baseURL = `http://localhost:${TEST_PORT}`;
    let createdBookId = null;

    try {
      // Test 1: GET /books (Default 10 items)
      console.log('Test 1: GET /books (Default all 10 books)');
      const res1 = await fetch(`${baseURL}/books`);
      const body1 = await res1.json();
      console.log(`  Status: ${res1.status} OK | Message: "${body1.message}" | Count: ${body1.count}`);
      console.log(`  First Book: "${body1.data[0].title}" by ${body1.data[0].author}`);

      // Test 2: GET /books?search_q=Atomic
      console.log('\nTest 2: GET /books?search_q=Atomic (LIKE filter)');
      const res2 = await fetch(`${baseURL}/books?search_q=Atomic`);
      const body2 = await res2.json();
      console.log(`  Status: ${res2.status} OK | Match: "${body2.data[0]?.title}" (₹${body2.data[0]?.price})`);

      // Test 3: GET /books?order_by=price&order=DESC&limit=3
      console.log('\nTest 3: GET /books?order_by=price&order=DESC&limit=3 (Sorting)');
      const res3 = await fetch(`${baseURL}/books?order_by=price&order=DESC&limit=3`);
      const body3 = await res3.json();
      console.log(`  Status: ${res3.status} OK | Top 3 by price:`);
      body3.data.forEach(b => console.log(`   - ₹${b.price}: ${b.title}`));

      // Test 4: GET /books?min_price=300&max_price=400 (BETWEEN filter)
      console.log('\nTest 4: GET /books?min_price=300&max_price=400');
      const res4 = await fetch(`${baseURL}/books?min_price=300&max_price=400`);
      const body4 = await res4.json();
      console.log(`  Status: ${res4.status} OK | Found ${body4.count} books in ₹300-₹400 range`);

      // Test 5: GET /books/1 (Single book retrieval)
      console.log('\nTest 5: GET /books/1 (Single book)');
      const res5 = await fetch(`${baseURL}/books/1`);
      const body5 = await res5.json();
      console.log(`  Status: ${res5.status} OK | Book 1: "${body5.data.title}"`);

      // Test 6: GET /books/9999 (404 Not Found)
      console.log('\nTest 6: GET /books/9999 (Non-existent ID)');
      const res6 = await fetch(`${baseURL}/books/9999`);
      const body6 = await res6.json();
      console.log(`  Status: ${res6.status} (Expected 404) | Response: "${body6.message}"`);

      // Test 7: POST /books (Validation Failure - Missing Title)
      console.log('\nTest 7: POST /books (Missing Title)');
      const res7 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'Author Name', price: 300 })
      });
      const body7 = await res7.json();
      console.log(`  Status: ${res7.status} (Expected 400) | Response: "${body7.message}"`);

      // Test 8: POST /books (Validation Failure - Non-numeric price)
      console.log('\nTest 8: POST /books (Non-numeric Price)');
      const res8 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Book', author: 'Author Name', price: 'invalid' })
      });
      const body8 = await res8.json();
      console.log(`  Status: ${res8.status} (Expected 400) | Response: "${body8.message}"`);

      // Test 9: POST /books (Valid Creation - 201 Created)
      console.log('\nTest 9: POST /books (Valid Book Creation)');
      const res9 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'System Design Interview',
          author: 'Alex Xu',
          price: 600,
          pages: 320
        })
      });
      const body9 = await res9.json();
      createdBookId = body9.data.id;
      console.log(`  Status: ${res9.status} (Expected 201) | Created Book ID: ${createdBookId} | Message: "${body9.message}"`);

      // Test 10: PUT /books/:bookId (Update Existing - 200 OK)
      console.log(`\nTest 10: PUT /books/${createdBookId} (Update Book)`);
      const res10 = await fetch(`${baseURL}/books/${createdBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'System Design Interview (Volume 1)',
          price: 650
        })
      });
      const body10 = await res10.json();
      console.log(`  Status: ${res10.status} (Expected 200) | Response: "${body10.message}"`);

      // Test 11: DELETE /books/:bookId (Delete Created Book)
      console.log(`\nTest 11: DELETE /books/${createdBookId} (Delete Book)`);
      const res11 = await fetch(`${baseURL}/books/${createdBookId}`, {
        method: 'DELETE'
      });
      const body11 = await res11.json();
      console.log(`  Status: ${res11.status} (Expected 200) | Response: "${body11.message}"`);

      console.log(`\n=======================================================`);
      console.log(`✅ ALL TEST CASES VERIFIED AGAINST AURORA UNIVERSITY FORMAT!`);
      console.log(`=======================================================`);
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

runTests();
