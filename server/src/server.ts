import { app } from './app';
import { connectDB } from './config/db';

const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

app.listen(port, () => {
  console.log(`Pool Multiplayer server listening on port ${port}`);
});
