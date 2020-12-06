const state = require("../tokens");
const isAfter = require("date-fns/isAfter");

module.exports = (req, res, next) => {
  try {
    const tokenId = req.headers.authorization;
    const token = state.tokens.find((t) => t.token === tokenId);
    console.log(token);
    if (!tokenId || !token || isAfter(new Date(), token.date)) {
      throw new Error();
    } else {
      next();
    }
  } catch (e) {
    res.status(401).send();
  }
};
