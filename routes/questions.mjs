import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import questionValidate from "../middleware/questionValidation.mjs";

const questionRoute = Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: A list of questions.
 *       500:
 *         description: Unable to fetch questions.
 */
questionRoute.get("/", async (req, res) => {
  let results = {};
  try {
    results = await connectionPool.query(`SELECT * FROM questions`);
    return res.status(200).json(results.rows);
  } catch (error) {
    return res.status(500).json({
      message: `Unable to fetch questions.${error.message}`,
    });
  }
});

/**
 * @swagger
 * /questions/search:
 *   get:
 *     summary: Search questions by title or category
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Title to search for
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to search for
 *     responses:
 *       200:
 *         description: A list of questions matching the search criteria.
 *       400:
 *         description: Invalid search parameters.
 *       500:
 *         description: Unable to fetch a question.
 */
questionRoute.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if (!title && !category) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }
  try {
    let query = "SELECT * FROM questions WHERE ";
    const values = [];
    if (title) {
      query += "title LIKE $1 ";
      values.push(`%${title}%`);
    }
    if (category) {
      if (values.length > 0) query += "AND ";
      query += "category LIKE $2 ";
      values.push(`%${category}%`);
    }

    const results = await connectionPool.query(query, values);
    return res.status(200).json({ data: results.rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Unable to fetch a question.${error.message}` });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   get:
 *     summary: Get a specific question by ID
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to retrieve
 *     responses:
 *       200:
 *         description: A question object.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to fetch questions.
 */
questionRoute.get("/:questionId", async (req, res) => {
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
      message: `Unable to fetch questions.${error.message}`,
    });
  }
  if (!results.rows[0]) {
    return res.status(404).json({
      message: "Question not found.",
    });
  }
  return res.status(200).json({ data: results.rows });
});

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully.
 *       500:
 *         description: Unable to create question.
 */
questionRoute.post("/", [questionValidate], async (req, res) => {
  const newQuestion = req.body;

  try {
    await connectionPool.query(
      `INSERT INTO questions (title, description, category)
         values($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );

    return res.status(201).json({
      message: `Question created successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Unable to create question.${error.message}`,
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   put:
 *     summary: Update a specific question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to update question.
 */
questionRoute.put("/:questionId", [questionValidate], async (req, res) => {
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
      `UPDATE questions SET title = $2, description = $3, category = $4
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
      message: `Unable to update question.${error.message}`,
    });
  }
});

/**
 * @swagger
 * /questions/{questionId}:
 *   delete:
 *     summary: Delete a question
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question to delete
 *     responses:
 *       200:
 *         description: Question post has been deleted successfully.
 *       404:
 *         description: Question not found.
 *       500:
 *         description: Unable to delete question.
 */
questionRoute.delete("/:questionId", async (req, res) => {
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
      message: `Unable to delete question.${error.message}`,
    });
  }
});

export default questionRoute;
