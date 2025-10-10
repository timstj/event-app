import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    //Expecting header: Authorization: Bearer <token>
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user; // Attach user
      next();
    });
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};
