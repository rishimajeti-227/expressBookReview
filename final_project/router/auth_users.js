const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username already exists
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token
    let accessToken = jwt.sign({ data: username }, "access", {
      expiresIn: "1h",
    });

    // Store token in session
    req.session.authorization = { accessToken };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add or update a book review (authenticated users only)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.data; // set by JWT middleware in index.js

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    reviews: books[isbn].reviews,
  });
});

// Delete a book review (authenticated users only)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data; // set by JWT middleware in index.js

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // Delete only this user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted`,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
