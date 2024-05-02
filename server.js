import express from 'express';
import welcome from './welcome.js';

const app = express();
const port = 3000;

app.listen(port, () => {
  welcome();
});