require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const Database = require("@replit/database")
const dns = require("dns")
const db = new Database()

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  let posted_url = req.body.url;
  let protocol = posted_url.toString().split('/')[0]//required for validation
  if (protocol == 'http:' || protocol == 'https:') {
    let domain = posted_url.toString().split('/')[2]//required for validation
    dns.lookup(domain, (error, address, family) => {
      if (error == null) {
        let newInt = getRandomInt(1000, 9999);
        db.set(newInt, posted_url).then(() => {
          res.json({ original_url: posted_url, short_url: newInt });
        })
      } else {
        res.json({ error: 'invalid url' });
      }
    })
  } else {
    res.json({ error: 'invalid url' });
  }

});



app.get("/api/shorturl/*", (req, res) => {
  let parsedShortURL = req.url.split('/')[3].toString().split('?')[0]
  console.log(parsedShortURL)
  db.get(parsedShortURL).then(r => {
    res.redirect(r)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
