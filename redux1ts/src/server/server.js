import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser"; // Import cookie-parser

const app = express();
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

const corsOptions = {
  origin: process.env.SERVER_ORIGIN_APP,  // Adjust if needed
  methods: "GET,POST,PUT,DELETE",
  credentials: true,  // Allow cookies or authorization headers
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
app.get("/api/verify-token", authenticateJWT, (req, res) => {
  //console.log("Received token:", req.cookies.token); // Log the token
  try {
    const decoded = jwt.verify(req.cookies.token, secretKey);
    //console.log("Decoded token:", decoded);
    res.json({ message: "Token is valid", user: decoded });
  } catch (err) {
    //console.error("Token verification failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000, // Token expiration in milliseconds (1 hour)
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
        return res.status(500).json({ error: "Failed to insert user" });
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


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
