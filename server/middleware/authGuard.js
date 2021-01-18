import state, { writeTokenToMemory } from "../tokens.js";
import { isAfter, add } from "date-fns";

const authGuard = (req, res, next) => {
  try {
    const tokenId = req.headers.authorization;
    const token = state.tokens.find((t) => t.token === tokenId);
    if (!tokenId || !token || isAfter(new Date(), token.date)) {
      throw new Error();
    } else {
      // If token is still valid add 1 week to timer
      token.date = add(new Date(), { weeks: 1 });
      writeTokenToMemory();
      next();
    }
  } catch (e) {
    res.status(401).send();
  }
};

export default authGuard;
