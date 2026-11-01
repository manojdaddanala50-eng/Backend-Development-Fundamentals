/**
 * ============================================================================
 * Lab 1: Node.js and Express Server
 * File: server.js
 * Description: Express.js web server implementing RESTful routing, status codes,
 *              JSON responses, and 404 error handling.
 * Student Name: D. Manoj
 * ============================================================================
 */

// Step 1: Import the Express framework
const express = require('express');

// Step 2: Initialize an Express application instance
const app = express();

// Step 3: Define the server port
const PORT = 3000;

// Optional built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Request logger middleware: prints method, path, and timestamp for every request
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} request to: ${req.url}`);
    next(); // Pass control to the next route or middleware handler
});

/**
 * ----------------------------------------------------------------------------
 * Route 1: GET /
 * Purpose: Root endpoint returning a friendly welcome message.
 * HTTP Method: GET
 * Status Code: 200 OK
 * ----------------------------------------------------------------------------
 */
app.get('/', (req, res) => {
    res.status(200).send('Welcome to Lab 1: Node.js and Express Server!');
});

/**
 * ----------------------------------------------------------------------------
 * Route 2: GET /about
 * Purpose: Returns student profile details as JSON.
 * HTTP Method: GET
 * Status Code: 200 OK
 * Response: Student name and placeholders for registration number and section.
 * ----------------------------------------------------------------------------
 */
app.get('/about', (req, res) => {
    res.status(200).json({
        studentName: 'D. Manoj',
        registrationNumber: '[Your Registration Number]', // Placeholder - to be filled by student
        section: '[Your Section]'                         // Placeholder - to be filled by student
    });
});

/**
 * ----------------------------------------------------------------------------
 * Route 3: GET /time
 * Purpose: Returns the current system date and time using new Date().
 * HTTP Method: GET
 * Status Code: 200 OK
 * Response: Formatted ISO string, readable local string, and UNIX timestamp.
 * ----------------------------------------------------------------------------
 */
app.get('/time', (req, res) => {
    const now = new Date();
    res.status(200).json({
        currentTime: now.toISOString(),
        formattedDateTime: now.toString(),
        timestamp: now.getTime()
    });
});

/**
 * ----------------------------------------------------------------------------
 * Route 4: Catch-all 404 Handler for Unknown Routes
 * Purpose: Intercepts all requests that do not match any defined endpoint above.
 * HTTP Method: ALL
 * Status Code: 404 Not Found
 * Response: JSON object detailing the error and missing path.
 * ----------------------------------------------------------------------------
 */
app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        error: 'Not Found',
        message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`
    });
});

/**
 * Step 4: Start the Express server on port 3000
 */
app.listen(PORT, () => {
    console.log('====================================================');
    console.log('  Express Server is running successfully!');
    console.log(`  Server listening on: http://localhost:${PORT}`);
    console.log('  Available endpoints:');
    console.log(`   - GET  http://localhost:${PORT}/`);
    console.log(`   - GET  http://localhost:${PORT}/about`);
    console.log(`   - GET  http://localhost:${PORT}/time`);
    console.log(`   - GET  http://localhost:${PORT}/invalid  (Tests 404 handler)`);
    console.log('====================================================');
});
