const express = require("express");
const path = require("path");
const app = express();
const PORT =  3000;
const isConnectedToAuthorizedWifi = require("./utils/wifiCheckSSID");
const { encrypt, decrypt } = require("./utils/passwordEncryption");
const session = require("express-session");
const STATIC_ADMIN_PASSWORD = "talib11112005"; // your admin password
const ENCRYPTED_ADMIN_PASSWORD = "0427ca563ab1f5da92825a924b5153c3:c1777194458f2ea52f1a9b972dec3747"; // You can also hardcode this after first run
// console.log("Encrypted admin password:", ENCRYPTED_ADMIN_PASSWORD);



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(express.static("public"));

app.use(
  session({
    secret: "snoidsjfoisdjvoinDSOUHVui",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", async (req, res) => {
  try {
    const { authorized, bssid } = await isConnectedToAuthorizedWifi();

    if (!authorized) {
      return res.render("accessDenied", {
        title: "Access Denied",
        ip: req.ip,
        bssid: bssid || "Unknown",
      });
    }

    // If trying to access admin features via ?admin, let it proceed to render index.ejs
    // The client-side script in index.ejs will handle the admin password prompt.
    // Otherwise, if not logged in as a regular user AND not already an admin, redirect to login.
    if (req.query.admin === undefined && !req.session.user && !req.session.isAdmin) {
      return res.redirect("/login");
    }

    // At this point, user is either:
    // 1. A logged-in regular user (req.session.user exists)
    // 2. An admin (req.session.isAdmin exists)
    // 3. Attempting admin login via ?admin (req.query.admin is present) - client script will handle

    const response = await fetch("http://localhost:3001/accounts");
    let cards = await response.json();
    
    const currentIsAdminSession = req.session.isAdmin || false;
    const currentIsLoggedInSession = !!req.session.user;
    console.log("isLoggedIn (session):", currentIsLoggedInSession, "isAdmin (session):", currentIsAdminSession);

    let users = [];
    // If admin, fetch users from JSON server
    if (currentIsAdminSession) {
      const userResponse = await fetch("http://localhost:3001/users");
      users = await userResponse.json();
    }
    // Decrypt passwords
    cards = cards.map((card) => ({
      ...card,
      password: card.password ? decrypt(card.password) : "",
    }));

    res.render("index", { title: "home", cards, users, isAdmin: currentIsAdminSession, isLoggedIn: currentIsLoggedInSession });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Server error");
  }
});

app.get("/login", (req, res) => {
  // If already logged in (as user or admin), redirect to home
  if (req.session.user || req.session.isAdmin) {
    return res.redirect("/");
  }
  res.render("login", {
    title: "Login",
    error: null,
    // Pass these for header/footer partials if they expect them
    isLoggedIn: false,
    isAdmin: false
  });
});

app.post("/user-login", async (req, res) => {
  const { username } = req.body;

  try {
    // 1. Fetch users from the JSON server
    const response = await fetch("http://localhost:3001/users");
    const users = await response.json();

    // 2. Find the user by username or email
    const user = users.find((u) => (u.username === username || u.email === username) && !u.blocked);

    // 3. If user not found or is blocked, return an error by re-rendering login page
    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid username/email or your account is blocked.",
        isLoggedIn: false,
        isAdmin: false
      });
    }

    // 4. Set session data
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      // No need to store 'blocked' in session if checked at login
    };

    // 5. Redirect to home page or send success response
    return res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("login", {
      title: "Login",
      error: "Server error during login. Please try again.",
      isLoggedIn: false,
      isAdmin: false
    });
  }
});


app.post("/add-password", async (req, res) => {
  try {
    // Prepare the new account object
    const { platform, email, username, password, tags, favicon } = req.body;
    const labels = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const newAccount = {
      platform: platform, // fallback if platform is empty
      email,
      username,
      password: encrypt(password), // Encrypt the password
      labels,
      favicon: favicon || "/images/logo.png",
    };

    // Send POST request to JSON server
    const response = await fetch("http://localhost:3001/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });

    if (!response.ok) throw new Error("Failed to add account");

    res.redirect("/");
  } catch (err) {
    console.error("Error adding account:", err.message);
    res.status(500).send("Error adding account");
  }
});

// Find account by platform+email+username (for edit)
app.post("/api/find-account", async (req, res) => {
  const { platform, email, username } = req.body;
  const response = await fetch("http://localhost:3001/accounts");
  const accounts = await response.json();
  const found = accounts.find(
    (acc) =>
      acc.platform === platform &&
      acc.email === email &&
      acc.username === username
  );
  if (found) res.json({ id: found.id });
  else res.status(404).json({ error: "Not found" });
});

// Edit account
app.post("/edit-password/:id", async (req, res) => {
  const { id } = req.params;
  const { platform, email, username, password, labels, favicon } = req.body;
  const updatedAccount = {
    platform,
    email,
    username,
    password: encrypt(password), // Encrypt the password
    labels,
    favicon,
  };
  const response = await fetch(`http://localhost:3001/accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedAccount),
  });
  if (!response.ok) return res.status(500).send("Failed to update");
  res.sendStatus(200);
});

app.delete("/delete-password/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`http://localhost:3001/accounts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return res.status(500).send("Failed to delete");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Server error");
  }
});


app.post("/api/validate-admin", (req, res) => {
  const { password } = req.body;
  const decrypted = decrypt(ENCRYPTED_ADMIN_PASSWORD);

  if (password === decrypted) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }

  res.status(403).json({ success: false });
});

app.get("/api/check-admin", (req, res) => {
  res.json({ isAdmin: req.session.isAdmin || false });
});


app.post("/add-user", async (req, res) => {
  try {
    const { username, email } = req.body;
    // You can generate a random id or let JSON server do it
    const newUser = {
      username,
      email,
      blocked: false
    };

    const response = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) throw new Error("Failed to add user");

    res.redirect("/");
  } catch (err) {
    console.error("Error adding user:", err.message);
    res.status(500).send("Error adding user");
  }
});


app.post('/api/block-user', async (req, res) => {
  const { id, blocked } = req.body;
  try {
    // Fetch the user to preserve other fields
    const userRes = await fetch(`http://localhost:3001/users/${id}`);
    if (!userRes.ok) return res.status(404).send('User not found');
    const user = await userRes.json();

    // Update the user
    const response = await fetch(`http://localhost:3001/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, blocked })
    });
    if (!response.ok) return res.status(500).send('Failed to update user');
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Server error');
  }
});


app.delete("/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`http://localhost:3001/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return res.status(500).send("Failed to delete user");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Server error");
  }
});





app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
