const User = require("../models/user");

module.exports = (perm) => async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("role");
  if (!user) return res.status(401).json({ error: "Unauthenticated" });

  const granted = user.role?.permissions || [];
  if (granted.includes("*") || granted.includes(perm)) return next();

  return res.status(403).json({ error: "Access denied" });
};
