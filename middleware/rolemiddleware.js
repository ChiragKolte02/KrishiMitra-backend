// roles is an array of allowed user_types
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized: No user found" });

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

module.exports = roleMiddleware;
