var app = require('http').createServer(handler);
var fs = require('fs');
var url = require('url');
app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/build/' + req.url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + req.url);
    }
    if( /[.]css$/i.test(req.url) ) {
      res.writeHead(200, {'Content-Type': 'text/css'});
    } else if( /[.]map/i.test(req.url) ) {
      res.writeHead(200, {'Content-Type': 'application/x-navimap'});
    } else {
      res.writeHead(200);
    }
    res.end(data);
  });
}
