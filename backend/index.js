const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const app = express();
const port = 3000;

app.use(express.json()); // For parsing application/json
app.use(cors());

// Protected routes
app.get("/home.html", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "../../story/home.html"));
});

app.get("/dashboard.html", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "../../story/dashboard.html"));
});

// Serve static files (CSS, JS, images, etc.) for unprotected routes
app.use(express.static(path.join(__dirname, "../../story")));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware to protect routes
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.redirect("/login.html"); // Redirect to login if no token

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    console.error("Authentication error:", error);
    return res.redirect("/login.html"); // Redirect to login if token is invalid
  }
  req.user = data.user;
  next();
}

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("your_table_name").select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Supabase registration error:", error);
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json({
    message: "Registration successful",
    user: data.user,
    session: data.session,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) return res.status(401).json({ error: error.message });
  res.status(200).json({
    message: "Login successful",
    user: data.user,
    session: data.session,
  });
});

app.post("/stories", async (req, res) => {
  const { title, content } = req.body;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const { data, error } = await supabase
    .from("stories")
    .insert([{ title, content, author_id: user.id }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: "Story added successfully", data });
});

app.get("/stories", async (req, res) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized: User not logged in" });
  }

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("author_id", user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
