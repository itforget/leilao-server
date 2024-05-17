import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express, { Request, Response, Router } from "express";

async function registerUser(req: Request, res: Response) {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res
      .status(422)
      .json({ error: "Please provide all the required fields" });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ error: "Passwords do not match" });
  }

  const verifyEmail = await User.findOne({ email });
  if (verifyEmail) {
    return res.status(422).json({ error: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
    confirmpassword: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(422)
      .json({ error: "Please provide all the required fields" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(422).json({ error: "Invalid password" });
  }

  try {
    const token = jwt.sign({ id: user._id }, process.env.SECRET || "", {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json({ msg: "User logged in successfully", token, userId: user._id });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

export { registerUser, loginUser };
