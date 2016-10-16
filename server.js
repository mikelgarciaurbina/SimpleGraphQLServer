import express from 'express';
import schema from './schema';
import { graphql } from 'graphql';
import bodyParser from 'body-parser';

let app  = express();
let PORT = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static('public'));

app.post('/graphql', (req, res) => {
  graphql(schema, req.body.query).then((result) => {
    res.send(result);
  });
});

app.listen(PORT, function () {
  console.log('App listening on port: ' + PORT);
});
