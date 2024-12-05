function handleError(res, message, statusCode = 500, error = null) {
  console.error(message, error || '');
  res.status(statusCode).json({ error: message });
}

module.exports = { handleError };

