require("dotenv").config();
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

//create token
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

//verify user token
const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

//create and attach cookies
const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  // res.status(StatusCodes.CREATED).json({ user });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
