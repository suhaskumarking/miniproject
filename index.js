import express from "express";
import { config } from "dotenv";
import { checkForAuthentication } from "./middlewares/authentications.js";
import { userRouter } from "./routes/user.js";
import cookieParser from "cookie-parser";
import { urlencoded } from "express";
import connectDB from "./Config/dbConfig.js";
// import path from "path";
config();
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
app.use(checkForAuthentication('user'));


app.get("/", (req, res) => {
  console.log('This is home Route!');
  res.send("This is home route!");
});

app.use('/user',userRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
