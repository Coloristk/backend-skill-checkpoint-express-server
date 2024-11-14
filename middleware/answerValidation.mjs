const validateAnswer = (req, res, next) => {
  const { content } = req.body;
  if (!content || content.lebgth > 300) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  next();
};

export default validateAnswer;
