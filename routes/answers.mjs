import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerRoute = Router();

answerRoute.get("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let results = {};
  try {
    results = await connectionPool.query(
      `SELECT questions.id AS question_id, answers.id AS answer_id, answers.content 
      FROM answers
      INNER JOIN questions ON questions.id = answers.question_id
      WHERE questions.id = $1`,
      [questionIdFromClient]
    );
    return res.status(200).json({ data: results.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to fetch answers.${error.message}` });
  }
});

answerRoute.post("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  // ใส่ {} ไว้เพื่อดึงค่า content จากใน body ออกมาโดยตรงเลย
  const { content } = req.body;

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
      `INSERT INTO answers(question_id, content)
        values($1, $2)`,
      [questionIdFromClient, content]
    );
    return res.status(201).json({
      message: `Answer created successfully.`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to create answers.${error.message}` });
  }
});

answerRoute.delete("/:questionId/answers", async (req, res) => {
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

    await connectionPool.query(
      `DELETE 
      FROM answers
      WHERE question_id = $1`,
      [questionIdFromClient]
    );

    await connectionPool.query(
      `DELETE 
      FROM questions
      WHERE id = $1`,
      [questionIdFromClient]
    );

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to delete answers.${error.message}` });
  }
});

export default answerRoute;
