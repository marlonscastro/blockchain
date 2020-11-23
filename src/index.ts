import express from 'express';
import routes from './routes';

var app = express();

app.use(express.json());

app.use(routes);

app.listen(8080, () => {
    console.log('server Running.. ');
});



