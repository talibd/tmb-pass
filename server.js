const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
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

    const response = await fetch("http://localhost:3001/accounts");
    let cards = await response.json();
    // Decrypt passwords
    cards = cards.map((card) => ({
      ...card,
      password: card.password ? decrypt(card.password) : "",
    }));
    // const isAdmin = req.query.admin === "true";
    res.render("index", { title: "home", cards, isAdmin: req.session.isAdmin || false, });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Server error");
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




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
