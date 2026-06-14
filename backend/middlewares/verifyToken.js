import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/jwt.js";
import { COOKIE_NAME } from "../config/env.js";
import { UserModel } from "../models/UserModel.js";

const { verify } = jwt;

// Verify User Token
export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.[COOKIE_NAME] ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const decodedToken = verify(
      token,
      jwtSecret
    );

    const user = await UserModel.findById(
      decodedToken.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.status === "BLOCKED") {
      return res.status(403).json({
        message: "Your account is blocked by admin",
      });
    }

    req.user = user;

    next();

  } catch (err) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

export const optionalToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.[COOKIE_NAME] ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) return next();

    const decodedToken = verify(token, jwtSecret);
    const user = await UserModel.findById(decodedToken.id).select("-password");

    if (user && user.status !== "BLOCKED") {
      req.user = user;
    }

    next();
  } catch (err) {
    next();
  }
};
