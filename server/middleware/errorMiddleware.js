export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
};
