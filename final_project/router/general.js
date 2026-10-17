const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Task 1: Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Return books directly (Axios variant shown in Task 10/11)
    const getAllBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };

    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books", error: err.message });
  }
});

// Task 2: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Using Promise callback
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });

  getBookByISBN
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 3: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;

    // Fetch all books via Axios, then filter
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const matchingBooks = {};
    Object.keys(allBooks).forEach((isbn) => {
      if (
        allBooks[isbn].author.toLowerCase() === author.toLowerCase()
      ) {
        matchingBooks[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }

    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books by author", error: err.message });
  }
});

// Task 4: Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;

    // Fetch all books via Axios, then filter
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const matchingBooks = {};
    Object.keys(allBooks).forEach((isbn) => {
      if (
        allBooks[isbn].title.toLowerCase() === title.toLowerCase()
      ) {
        matchingBooks[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({ message: "No books found for this title" });
    }

    return res.status(200).json(matchingBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books by title", error: err.message });
  }
});

// Task 5: Get book review using async/await with Axios
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;

    // Fetch book by ISBN via Axios, then return its reviews
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    const book = response.data;

    return res.status(200).json(book.reviews);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error retrieving reviews", error: err.message });
  }
});

module.exports.general = public_users;
