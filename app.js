const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
    const { url, method } = req;
    if (url === "/") {
        res.write("<html>");
        res.write("<head><title>home</title></head>");
        res.write(
            "<body><form action='/create-user' method='POST'><input type='text' name='username'><button type='submit'>Send</button></input></form></body>"
        );
        res.write("</html>");

        return res.end();
    }
    if (url === "/users") {
        res.write("<html>");
        res.write("<head><title>users</title></head>");
        res.write("<body><ul><li>User 1</li><li>User 2</li></ul></body>");
        res.write("</html>");

        return res.end();
    }
    if (url === "/create-user" && method === "POST") {
        const body = [];
        req.on("data", chunk => {
            body.push(chunk);
        });
        req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            const user = parsedBody.split("=")[1];
            console.log("user", user);
        });
        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
    }
});

server.listen(3000);
