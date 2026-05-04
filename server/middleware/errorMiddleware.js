export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message:
        "El archivo convertido supera el limite permitido. Reduce la cantidad de diapositivas o usa un archivo mas liviano.",
    });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
};
