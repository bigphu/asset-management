const config = require('../../config');
const { ensureUser } = require('../../repositories/users.repo');

/*
 * Sets `req.user` for every request. No story introduces authentication yet
 * and ADR-0004 assumes a single user, but the schema attributes every asset
 * write and owns every export profile (ADR-0013) by user. Until an auth story
 * lands, everyone acts as one default account, created on first use.
 *
 * This middleware is the seam: replace it with one that reads a verified
 * session or JWT (JWT_SECRET is already in .env.example) and nothing
 * downstream changes.
 */

let defaultUser = null;

function loadDefaultUser() {
  if (!defaultUser) {
    // Forget a failed attempt so the next request retries (e.g. DB was starting).
    defaultUser = ensureUser(config.defaultUser).catch((err) => {
      defaultUser = null;
      throw err;
    });
  }
  return defaultUser;
}

function currentUser(req, res, next) {
  loadDefaultUser()
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
}

module.exports = { currentUser };
