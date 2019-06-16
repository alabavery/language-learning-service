import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/word', router);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));