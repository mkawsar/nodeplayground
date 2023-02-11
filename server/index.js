import http from 'http';
import express from 'express';
import logger from 'morgan';

// MIddleware
import {decode} from './middlewares/jwt.js';

const app = express();
const port = process.env.PORT || '3000';
app.set('port', port);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello world');
});

/** Create HTTP server. */
const server = http.createServer(app);
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
    console.log(`Listening on port:: http://localhost:${port}/`)
});
