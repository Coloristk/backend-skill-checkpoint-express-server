import express from "express";
import questionRouter from "./routes/questions.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(express.json());
app.use("/questions", questionRouter);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
