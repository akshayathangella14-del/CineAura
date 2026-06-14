// Admin Authorization
export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Unauthorized Access",
    });
  }

  next();
};
