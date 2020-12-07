const state = require("../tokens");
const isAfter = require("date-fns/isAfter");
const add = require("date-fns/add");

module.exports = (req, res, next) => {
  try {
    const tokenId = req.headers.authorization;
    const token = state.tokens.find((t) => t.token === tokenId);
    if (!tokenId || !token || isAfter(new Date(), token.date)) {
      throw new Error();
    } else {
      // If token is still valid add 1 week to timer
      token.date = add(new Date(), { weeks: 1 });
      next();
    }
  } catch (e) {
    res.status(401).send();
  }
};
