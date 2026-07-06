import { app } from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Pool Multiplayer server listening on port ${port}`);
});
