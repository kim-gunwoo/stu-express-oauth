const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();
const port = 8888;

app.use(
    session({
        secret: "this is key",
        resave: false,
        saveUninitialized: true,
        store: new FileStore(),
    })
);

app.get("/", (req, res) => {
    console.log(req.session);
    if (req.session.num === undefined) {
        req.session.num = 1;
    } else {
        req.session.num += 1;
    }
    res.send(`Views : ${req.session.num}`);
});

app.listen(port, () => {
    console.log(`start server >>>`);
    console.log(`http://localhost:${port}`);
});
