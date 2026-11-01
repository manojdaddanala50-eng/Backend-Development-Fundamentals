/**
 * ============================================================================
 * Lab 1: Node.js and Express Server
 * File: basic-server.js
 * Description: Basic web server built using Node.js built-in 'http' module.
 * Student Name: D. Manoj
 * ============================================================================
 */

// Step 1: Import the built-in HTTP module provided by Node.js.
// No external npm installation is needed for this module.
const http = require('http');

// Step 2: Define the port number where our server will listen for requests.
const PORT = 3000;

// Step 3: Create an HTTP server using http.createServer().
// The callback function takes two arguments:
// - req (IncomingMessage): Contains details about the incoming client request.
// - res (ServerResponse): Used to send data and headers back to the client.
const server = http.createServer((req, res) => {
    // Log incoming request method and URL to the console
    console.log(`[HTTP Server] Received ${req.method} request for: ${req.url}`);

    // Set the response HTTP status code to 200 (OK)
    // and specify the response format as plain text.
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    // Send the response body "Hello" and end the request-response cycle.
    res.end('Hello');
});

// Step 4: Start the server and listen on the specified port.
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  Built-in HTTP Server is successfully running!`);
    console.log(`  Access URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
