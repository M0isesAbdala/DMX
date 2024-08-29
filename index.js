const HTTP = require("http");
const RF = require('fs');

let script = null;
let html = null;

RF.readFile('./script.js', (err, data) => {
    if (err) {
        throw err;
    } else {
        script = data.toString();
    }
});

RF.readFile('./index.html', (err, data) => {
    if (err) {
        throw err;
    } else {
        html = data.toString();
    }
});

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    console.log(req.url);
    if (req.method === 'GET') {
        if (req.url === '/') {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(html);
        } else if (req.url === '/script.js') {
            res.setHeader("Content-Type", "application/javascript");
            res.writeHead(200);
            res.end(script);
        }
    } else {
        res.writeHead(404);
        res.end();
    }
};

const server = HTTP.createServer(requestListener);

server.listen(port, host, () => {
    console.clear();
    console.log(`Server is running on http://${host}:${port}`);
});

