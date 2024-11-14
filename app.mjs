import express from "express";
import questionRoute from "./routes/questions.mjs";
import answerRoute from "./routes/answers.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());
app.use("/questions", questionRoute);
app.use("/questions", answerRoute);
app.use("/answers", answerRoute);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
