const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }

  try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

//use this method below if you need just one role to access the route, like admin
// incase of multiple routes like admin, owner, ceo, use the method above
//while using this method, no need to call admin in the routes
// const authorizePermissions = async (req, res, next) => {
//   if (req.user.role !== "admin") {
//     throw new CustomError.UnauthorizedError(
//       "Unauthorized to access this route"
//     );
//   }
//   next();
// };

module.exports = {
  authenticateUser,
  authorizePermissions,
};
