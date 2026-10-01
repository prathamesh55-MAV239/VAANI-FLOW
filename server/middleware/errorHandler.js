export function errorHandler(err, req, res, next) {
  console.error('[Server Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Avoid exposing raw database internals or secrets in production
  let userMessage = err.message || 'Something interrupted the conversation.';
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    userMessage = 'An unexpected server error occurred. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

export default errorHandler;
