import { Request, Response, NextFunction } from 'express';
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './routes/routes';
const port = process.env.PORT || 3001;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    cors({
        origin: process.env.FRONTEND ? process.env.FRONTEND : 'https://happy-river-0f326cb03.3.azurestaticapps.net',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
    })
);
console.log(process.env.FRONTEND);

app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorisation');
    next();
});

app.use(routes);

app.listen(port, () => {
    console.log('server is running on port ' + port);
});
