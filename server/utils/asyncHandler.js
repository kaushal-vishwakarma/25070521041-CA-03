// Wraps an async route handler so rejected promises go to Express's error
// handler automatically (no try/catch in every controller).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
