const questionValidate = (req, res, next) => {
  const { title, description, category } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  if (!description) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  if (!category) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  next();
};

export default questionValidate;
