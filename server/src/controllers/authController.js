import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  getUserByEmailService,
  registerUserService,
} from "../models/authModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

export const registerUser = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    const newUser = await registerUserService(
      first_name,
      last_name,
      email,
      password
    );
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const userResult = await getUserByEmailService(email);

  // If user is not found
  if (!userResult || userResult === 0)
    return handleResponse(res, 404, "Email invalid");

  // Compare the passwords
  const isMatch = await bcrypt.compare(password, userResult.password);
  if (!isMatch) return handleResponse(res, 401, "Password invalid");

  // Generate the JWT
  const token = jwt.sign(
    {
      userId: userResult.id,
      email: userResult.email,
      slug: userResult.slug,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Respond with token and user info
  return handleResponse(res, 200, "Login successful", {
    token,
    user: {
      userId: userResult.id,
      first_name: userResult.first_name,
      last_name: userResult.last_name,
      email: userResult.email,
      slug: userResult.slug,
    },
  });
};
