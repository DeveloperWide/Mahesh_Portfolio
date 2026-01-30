import app from "./app";
import dotenv from "dotenv";
import connectDb from "./config/db";

dotenv.config();
const PORT = process.env.PORT;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  });
});
