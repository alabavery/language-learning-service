/**
 * Have to add .babelrc with contents {"presets": ["env"]} to start app.  Have to remove this to
 * make jest work.
 */
import express from 'express';
import { setUpMiddleware } from "./middleware";

const app = express();
const port = 3000;

setUpMiddleware(app);


// MUST IMPORT router after making app user body parser
import wordRouter from './routes/word';
import parseRouter from './routes/parse';
import audioRouter from './routes/audio';
import clipRouter from './routes/clip';

app.use('/word', wordRouter);
app.use('/parse', parseRouter);
app.use('/audio', audioRouter);
app.use('/clip', clipRouter);


app.listen(port, () => console.log(`Example app listening on port ${port}!`));