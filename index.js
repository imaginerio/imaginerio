const path = require('path');
const express = require('express');
const compression = require('compression');

let app = express();
app.use(compression());

let port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
  res.render('./src/index.html');
});

app.listen(port, function () {
  console.log('App is running on:' + port);
});
