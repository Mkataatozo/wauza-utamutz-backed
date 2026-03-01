const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();

const JWT_SECRET = "wauza_utamutz_secret_key";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Wauza Utamutz Backend Running 🚀");
});

// TEST DATABASE
app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

// REGISTER USER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, password]
    );

    res.json(newUser.rows[0]);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE USERS TABLE
app.get("/create-users-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
      );
    `);

    res.send("Users table created successfully ✅");

  } catch (err) {
    res.status(500).send(err.message);
  }
});
// LOGIN USER
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if(result.rows.length === 0){

      return res.json({
        success:false,
        message:"Invalid credentials"
      });

    }

    const user = result.rows[0];

    // CREATE TOKEN
    const token = jwt.sign(

      {
        id:user.id,
        email:user.email
      },

      JWT_SECRET,

      {
        expiresIn:"7d"
      }

    );

    res.json({

      success:true,
      message:"Login successful",
      token:token,
      user:user

    });

  }
  catch(err){

    res.status(500).json({error:err.message});

  }

});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});