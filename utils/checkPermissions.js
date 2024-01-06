const CustomError = require("../errors");

// checkPermission function helps us to prevent one user from viewing another persons info
const checkPermissions = (requestUser, resourceUserId) => {
  //requestUser is the user itself, resourceUserId is the object been viewed(it can be someone's details)
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

module.exports = checkPermissions;
