import 'dotenv/config'
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import router from '../routes/user'
import cors from 'cors';
const app = express();

app.use(express.json())
app.use(cors(
  {
    origin: '*',
  }
))

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'hello world' })
})

app.use(router)

mongoose
  .connect(process.env.MONGO_DB_URL || "")
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });