import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerRoute = Router();

answerRoute.get("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  let results = {};
  try {
    results = await connectionPool.query(
      `SELECT questions.id, answers.id, answers.content 
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

export default answerRoute;
