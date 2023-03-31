//Global Middleware
function globalMiddleware(req, res, next) {
  console.log(`Middleware is working.`);
  next();
}

module.exports = { globalMiddleware };
