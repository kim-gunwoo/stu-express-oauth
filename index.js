const express = require("express");
const app = express();
const port = 9999;

const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const db = require("./config/db");
/*
추가하면 자동으로 https 로 변경 문제가 발생함
const helmet = require("helmet");
app.use(helmet());
*/

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: true,
        store: new FileStore(),
    })
);
app.use(flash());

app.get("*", function (req, res, next) {
    req.list = db.get("topics").value();
    next();
});

const passport = require("./models/passport")(app);

const index = require("./router/index");
const topic = require("./router/topic");
const auth = require("./router/auth")(passport);

app.use("/", index);
app.use("/topic", topic);
app.use("/auth", auth);

app.use((req, res, next) => {
    res.status(404).send("Sorry cant find that!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
