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
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});

let URLSS = mongoose.model('URLSS', urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post(
  '/api/shorturl/new',
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let url = req.body.url;
    resObj['original_url'] = url;
    if (!url.match(/^[http://www.]/gi)) {
      res.json({ error: 'invalid url' });
      return;
    }
    let urlshort = 1;
    URLSS.findOne({})
      .sort({ short_url: 'desc' })
      .exec((err, result) => {
        if (!err && result != 'undefined') {
          urlshort = result.short_url + 1;
        }
        if (!err) {
          URLSS.findOneAndUpdate(
            { original_url: url },
            { original_url: url, short_url: urlshort },
            { new: true, upsert: true },
            (err, urlsaved) => {
              if (!err) {
                resObj['short_url'] = urlsaved.short_url;
                res.json(resObj);
              }
            }
          );
        }
      });
  }
);

app.get('/api/shorturl/:id', (req, res) => {
  URLSS.findOne({ short_url: +req.params.id }, (err, result) => {
    if (!err && result != 'undefined') {
      res.redirect(result.original_url);
    } else {
      res.json('URL not found!');
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
