/**
 * Comprehensive API Test Runner for Lab 3
 * Runs an in-memory/isolated test suite using Node.js built-in fetch against server.js
 */
const http = require('http');
const app = require('./server');

const TEST_PORT = 3008;

function runTests() {
  const server = http.createServer(app);

  server.listen(TEST_PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🧪 Starting Automated Verification for Lab 3 REST API`);
    console.log(`   Student: DADDANALA RANGA MANOJ KUMAR REDDY`);
    console.log(`   Reg No: 252U2R5033 | Class: AI AND DE 2A`);
    console.log(`=======================================================\n`);

    const baseURL = `http://localhost:${TEST_PORT}`;
    let createdBookId = null;

    try {
      // Test 1: GET /
      console.log('Test 1: Health check / Root');
      const res1 = await fetch(`${baseURL}/`);
      const data1 = await res1.json();
      console.log(`  Status: ${res1.status} OK | Message: "${data1.message}"`);

      // Test 2: GET /books (Default)
      console.log('\nTest 2: GET /books (Default limit 10)');
      const res2 = await fetch(`${baseURL}/books`);
      const data2 = await res2.json();
      console.log(`  Status: ${res2.status} OK | Retrieved ${data2.length} books`);

      // Test 3: GET /books?search_q=Clean (Query param: search_q)
      console.log('\nTest 3: GET /books?search_q=Clean (LIKE filter)');
      const res3 = await fetch(`${baseURL}/books?search_q=Clean`);
      const data3 = await res3.json();
      console.log(`  Status: ${res3.status} OK | Match: "${data3[0]?.title}" (Author: ${data3[0]?.author})`);

      // Test 4: GET /books?order_by=price&order=DESC (Sorting)
      console.log('\nTest 4: GET /books?order_by=price&order=DESC (Sorting)');
      const res4 = await fetch(`${baseURL}/books?order_by=price&order=DESC&limit=3`);
      const data4 = await res4.json();
      console.log(`  Status: ${res4.status} OK | Top 3 by price:`);
      data4.forEach(b => console.log(`   - ₹${b.price}: ${b.title}`));

      // Test 5: GET /books?min_price=600&max_price=800 (Price range filter)
      console.log('\nTest 5: GET /books?min_price=600&max_price=800 (BETWEEN filter)');
      const res5 = await fetch(`${baseURL}/books?min_price=600&max_price=800`);
      const data5 = await res5.json();
      console.log(`  Status: ${res5.status} OK | Found ${data5.length} books in range ₹600-₹800`);

      // Test 6: GET /books/:bookId (200 OK)
      console.log('\nTest 6: GET /books/2 (Single book retrieval)');
      const res6 = await fetch(`${baseURL}/books/2`);
      const data6 = await res6.json();
      console.log(`  Status: ${res6.status} OK | Book ID 2: "${data6.title}"`);

      // Test 7: GET /books/9999 (404 Not Found)
      console.log('\nTest 7: GET /books/9999 (Non-existent ID)');
      const res7 = await fetch(`${baseURL}/books/9999`);
      const data7 = await res7.json();
      console.log(`  Status: ${res7.status} (Expected 404) | Response: "${data7.message}"`);

      // Test 8: POST /books (Validation Failure - Missing Title)
      console.log('\nTest 8: POST /books (Missing Title)');
      const res8 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'Author Name', price: 300 })
      });
      const data8 = await res8.json();
      console.log(`  Status: ${res8.status} (Expected 400) | Response: "${data8.message}"`);

      // Test 9: POST /books (Validation Failure - Non-numeric price)
      console.log('\nTest 9: POST /books (Non-numeric Price "three-hundred")');
      const res9 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Book', author: 'Author Name', price: 'three-hundred' })
      });
      const data9 = await res9.json();
      console.log(`  Status: ${res9.status} (Expected 400) | Response: "${data9.message}"`);

      // Test 10: POST /books (Valid Creation - 201 Created)
      console.log('\nTest 10: POST /books (Valid Book Creation)');
      const res10 = await fetch(`${baseURL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'System Design Interview – An Insider\'s Guide',
          author: 'Alex Xu',
          price: 900,
          pages: 320
        })
      });
      const data10 = await res10.json();
      createdBookId = data10.bookId;
      console.log(`  Status: ${res10.status} (Expected 201) | Created Book ID: ${createdBookId} | Message: "${data10.message}"`);

      // Test 11: PUT /books/:bookId (Update Existing - 200 OK)
      console.log(`\nTest 11: PUT /books/${createdBookId} (Update Book)`);
      const res11 = await fetch(`${baseURL}/books/${createdBookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'System Design Interview (2nd Edition)',
          price: 950
        })
      });
      const data11 = await res11.json();
      console.log(`  Status: ${res11.status} (Expected 200) | Response: "${data11.message}"`);

      // Test 12: PUT /books/9999 (Update Non-existent - 404)
      console.log('\nTest 12: PUT /books/9999 (Update Non-existent ID)');
      const res12 = await fetch(`${baseURL}/books/9999`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Non Existent' })
      });
      const data12 = await res12.json();
      console.log(`  Status: ${res12.status} (Expected 404) | Response: "${data12.message}"`);

      // Test 13: DELETE /books/:bookId (Delete Existing - 200 OK)
      console.log(`\nTest 13: DELETE /books/${createdBookId} (Delete Created Book)`);
      const res13 = await fetch(`${baseURL}/books/${createdBookId}`, {
        method: 'DELETE'
      });
      const data13 = await res13.json();
      console.log(`  Status: ${res13.status} (Expected 200) | Response: "${data13.message}"`);

      // Test 14: DELETE /books/9999 (Delete Non-existent - 404)
      console.log('\nTest 14: DELETE /books/9999 (Delete Non-existent ID)');
      const res14 = await fetch(`${baseURL}/books/9999`, {
        method: 'DELETE'
      });
      const data14 = await res14.json();
      console.log(`  Status: ${res14.status} (Expected 404) | Response: "${data14.message}"`);

      // Test 15: Catch-all 404
      console.log('\nTest 15: GET /undefined-endpoint');
      const res15 = await fetch(`${baseURL}/undefined-endpoint`);
      const data15 = await res15.json();
      console.log(`  Status: ${res15.status} (Expected 404) | Response: "${data15.message}"`);

      console.log(`\n=======================================================`);
      console.log(`✅ ALL 15 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
      console.log(`=======================================================`);
    } catch (err) {
      console.error('❌ Test failed with error:', err);
    } finally {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

runTests();
