import http from 'http';
import express from 'express';
import logger from 'morgan';
import { config } from 'dotenv';
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

// Routes
import userRouter from './routes/user.js';
import indexRouter from './routes/index.js';
import ProductRoute from './routes/product.js';

// Mongo connection
import './config/mongo.js';

config();

const app = express();
const port = process.env.PORT || '4000';
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        'message': 'Welcome to nodeplayground'
    });
});

app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/product', ProductRoute);

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
    return res.status(404).json({
        success: false,
        message: 'API endpoint doesnt exist'
    });
});

/** Create HTTP server. */
const server = http.createServer(app);
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
    console.log(`Listening on port:: http://localhost:${port}/`)
});
