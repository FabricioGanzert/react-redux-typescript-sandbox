import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser"; // Import cookie-parser
import fs from 'fs';
import https from "https";

const app = express();

// Load SSL certificate and private key
const privateKey = fs.readFileSync('/home/Neo/Desktop/AWS-Ganzert/my-ssl-certs/localhost.key', 'utf8');
const certificate = fs.readFileSync('/home/Neo/Desktop/AWS-Ganzert/my-ssl-certs/localhost.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const port = 5000;
app.use(cookieParser()); // Add cookie-parser middleware
app.use(express.json());

import dotenv from "dotenv";
dotenv.config();

// Secret key for JWT (should be stored in an environment variable)
const secretKey = process.env.VITE_APP_SECRET_KEY;

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Define the allowed origins (you can also use "*" to allow all origins)
const allowedOrigins = ['https://192.168.0.18:3000', 'http://192.168.0.18:3000']; // Add your frontend URLs here

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow the request if the origin is in the allowedOrigins list or if the origin is not specified (e.g., for postman)
      callback(null, true);
    } else {
      // Reject the request if the origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods you want to allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON bodies

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  //console.log("Incoming request headers:", req.headers); // Log all headers
  //console.log("Incoming request cookies:", req.cookies); // Log all cookies

  const token = req.cookies.token; // Read token from cookies
  //console.log("Token extracted from cookies:", token); // Log the token (or lack thereof)

  if (!token) {
    //console.error("No token provided in cookies.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach the decoded token payload to the request
    //console.log("Decoded token data:", decoded); // Log the decoded token data
    next();
  } catch (err) {
    //console.error("JWT verification failed:", err.message); // Log the error message
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Endpoint to verify the token
app.get('/api/verify-token', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
    
    res.status(200).json({ user: decoded.user });
  });
});

// Server-side logout handler
app.post('/api/logout', (req, res) => {
  // Clear the cookie by setting it to expire in the past
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.status(200).send({ message: 'Logged out successfully' });
});

// Login endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Query the database to find the user by email
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }

    const user = results[0];

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      // Create a JWT token
      const token = jwt.sign({ email: user.email, userId: user.userId }, secretKey, { expiresIn: "1h" });

      // Set the token as an HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,  // Prevent access to the cookie from JavaScript (for security)
        secure: true,
        sameSite: "None",  // Allow cross-origin requests
        maxAge: 3600000,  // Token expiration in milliseconds (1 hour)
      });
      
      // Respond with a success message
      res.json({ message: "Logged in successfully" });
    });
  });
});

// POST route to insert a new user (Protected)
app.post("/api/users", authenticateJWT, (req, res) => {
  const { name, lastname, email, password } = req.body;

  // Check if all required fields are provided
  if (!name || !lastname || !email || !password) {
    return res.status(400).json({ error: "Name, lastName, email, and password are required" });
  }

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password" });
    }

    // Now, insert the user with the hashed password
    const query = "INSERT INTO users (name, lastName, email, password) VALUES (?, ?, ?, ?)";
    db.query(query, [name, lastname, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "err" });
      }
      res.status(201).json({ message: "User added successfully", userId: result.insertId, email: email, name: name, lastname: lastname });
    });
  });
});


// DELETE route to remove a user by ID (Protected)
app.delete("/api/users/:id", authenticateJWT, (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = "DELETE FROM users WHERE userId = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  });
});

// Fetch users (Protected)
// Fetch users with pagination (Protected)
app.get("/api/users", authenticateJWT, (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 5; // Default to 5 users per page if not provided
  const offset = (page - 1) * limit; // Calculate the offset for the SQL query

  // Modify the query to add LIMIT and OFFSET for pagination
  const query = "SELECT * FROM users LIMIT ? OFFSET ?";
  db.query(query, [limit, offset], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    // Get total number of users for pagination (for calculating total pages)
    const countQuery = "SELECT COUNT(*) AS totalUsers FROM users";
    db.query(countQuery, (err, countResults) => {
      if (err) {
        return res.status(500).json({ error: "Failed to count users" });
      }

      const totalUsers = countResults[0].totalUsers;
      const totalPages = Math.ceil(totalUsers / limit); // Calculate total pages

      const objreturn = {
        users: results, // The paginated list of users
        totalPages, // The total number of pages
        currentPage: page, // The current page number
        totalUsers, // The total number of users
      };

      res.json(objreturn);
    });
  });
});

// Create the HTTPS server
const httpsServer = https.createServer(credentials, app);

// Set the server to listen on a port (e.g., 3000)
httpsServer.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});