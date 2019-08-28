const http = require("http");
const func = require("./routes");

const server = http.createServer(func);

server.listen(3000);
