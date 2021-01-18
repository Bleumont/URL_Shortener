require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(process.env.DB_URI);
console.log(process.env.PORT);
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

let URLSS = mongoose.model('URLSS', urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shortener/new', (req, res) => {
  let url = dns.lookup(req.body.url, (err, adress) => {
    if (err) console.log(err);
  });

  if (url) {
    let newrl = new URLSS({
      original_url: req.body.url,
      short_url: Math.floor(Math.random() * 1000),
    });
    newrl.save((err, url) => {
      if (err) console.log(err);
    });
    res.json({ original_url: newrl.original_url, short_url: newrl.short_url });
  }
  res.json({ error: 'invalid url' });
});

app.get('/api/shorturl/:id', async (req, res) => {
  console.log(req.params.id);
  url = await URLSS.find({ short_url: +req.params.id }).exec();
  res.redirect(`https://${url[0].original_url}`);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
