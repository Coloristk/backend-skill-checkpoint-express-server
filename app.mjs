import express, { query } from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());

app.get("/questions", async (req, res) => {
  let results = {};
  try {
    results = await connectionPool.query(`SELECT * FROM questions`);
    return res.status(200).json(results.rows);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions.`,
    });
  }
});

app.get("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let results = {};
  try {
    results = await connectionPool.query(
      `SELECT questions.id, questions.title, questions.category, questions.description
       FROM questions
       WHERE questions.id = $1`,
      [questionIdFromClient]
    );
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions.`,
    });
  }
  if (!results.rows[0]) {
    return res.status(404).json({
      message: "Question not found.",
    });
  }
  return res.status(200).json({ data: results.rows });
});

app.post("/questions", async (req, res) => {
  const newQuestion = req.body;

  if (!newQuestion.title || !newQuestion.category || !newQuestion.description) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category,)
       values($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );

    return res.status(201).json({
      message: `Question created successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to create question.`,
    });
  }
});

app.put("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const updateQuestion = { ...req.body };
  try {
    const questionCheck = await connectionPool.query(
      `SELECT * FROM questions 
      WHERE id = $1`,
      [questionIdFromClient]
    );

    if (!questionCheck.rows[0]) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    await connectionPool.query(
      `UPDATE questions SET title = $2, category = $3, description = $4
      WHERE id = $1`,
      [
        questionIdFromClient,
        updateQuestion.title,
        updateQuestion.description,
        updateQuestion.category,
      ]
    );
    return res.status(200).json({
      message: "Question updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions.`,
    });
  }
});

app.delete("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;

  try {
    const questionCheck = await connectionPool.query(
      `SELECT * FROM questions 
      WHERE id = $1`,
      [questionIdFromClient]
    );

    if (!questionCheck.rows[0]) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    await connectionPool.query(`DELETE FROM questions WHERE id = $1`, [
      questionIdFromClient,
    ]);

    return res.status(200).json({
      message: `Question post has been deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to delete question.`,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
