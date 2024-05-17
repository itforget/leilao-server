"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// api/index.ts
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"));
var import_mongoose2 = __toESM(require("mongoose"));

// routes/user.ts
var import_express = require("express");

// models/user.ts
var import_mongoose = __toESM(require("mongoose"));
var userSchema = new import_mongoose.default.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmpassword: { type: String, required: true }
});
var User = import_mongoose.default.model("User", userSchema);
var user_default = User;

// controllers/user.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
async function registerUser(req, res) {
  const { name, email, password, confirmpassword } = req.body;
  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ error: "Please provide all the required fields" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ error: "Passwords do not match" });
  }
  const verifyEmail = await user_default.findOne({ email });
  if (verifyEmail) {
    return res.status(422).json({ error: "Email already exists" });
  }
  const salt = await import_bcrypt.default.genSalt(12);
  const passwordHash = await import_bcrypt.default.hash(password, salt);
  const user = new user_default({
    name,
    email,
    password: passwordHash,
    confirmpassword: passwordHash
  });
  try {
    await user.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Please provide all the required fields" });
  }
  const user = await user_default.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const isMatch = await import_bcrypt.default.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).json({ error: "Invalid password" });
  }
  try {
    const token = import_jsonwebtoken.default.sign({ id: user._id }, process.env.SECRET || "", {
      expiresIn: "1h"
    });
    res.status(200).json({ msg: "User logged in successfully", token, userId: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
async function authUser(req, res) {
  const id = req.params.id;
  if (!id) {
    return res.status(422).json({ error: "Please provide all the required fields" });
  }
  const user = await user_default.findById(id, "-password -confirmpassword");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(200).json({ user });
}
function checkToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const secret = process.env.SECRET;
    import_jsonwebtoken.default.verify(token, secret || "");
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
}

// routes/user.ts
var router = (0, import_express.Router)();
router.get("/user/:id", authUser, checkToken);
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
var user_default2 = router;

// api/index.ts
var import_cors = __toESM(require("cors"));
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
app.use((0, import_cors.default)(
  {
    origin: "*"
  }
));
user_default2.get("/", (req, res) => {
  res.json({ message: "hello world" });
});
app.use(user_default2);
import_mongoose2.default.connect(process.env.MONGO_DB_URL || "").then(() => {
  app.listen(process.env.PORT || 5e3, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch((err) => {
  console.log(err);
});
