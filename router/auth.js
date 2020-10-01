const express = require("express");
const router = express.Router();
const template = require("../models/template");
const shortid = require("shortid");
const db = require("../config/db");
const bcrypt = require("bcrypt");

module.exports = (passport) => {
    router.get("/login", (req, res) => {
        const fmsg = req.flash();
        let feedback = "";
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        const title = "WEB - login";
        const list = template.list(req.list);
        const body = `<div>${feedback}</div>
                    <form action="/auth/login_process" method="post">
                    <p><input type="text" name="email" placeholder="email"></p>
                    <p><input type="password" name="pwd" placeholder="password"></p>
                    <p>
                        <input type="submit" value="login">
                    </p>
                    </form>`;
        const control = ``;
        const html = template.HTML(title, list, body, control);
        res.send(html);
    });

    router.get("/register", (req, res) => {
        const fmsg = req.flash();
        let feedback = "";
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        const title = "WEB - login";
        const list = template.list(req.list);
        const body = `<div>${feedback}</div>
                        <form action="/auth/register_process" method="post">
                            <p><input type="text" name="email" placeholder="email"></p>
                            <p><input type="password" name="pwd" placeholder="password"></p>
                            <p><input type="password" name="pwd2" placeholder="password"></p>
                            <p><input type="text" name="displayName" placeholder="display name"></p>
                            <p><input type="submit" value="register"></p>
                        </form>`;
        const control = "";
        const html = template.HTML(title, list, body, control);
        res.send(html);
    });

    router.post("/register_process", (req, res) => {
        const post = req.body;
        const email = post.email;
        const pwd = post.pwd;
        const pwd2 = post.pwd2;
        const displayName = post.displayName;
        if (pwd !== pwd2) {
            req.flash("error", "Password must same!");
            res.redirect("/auth/register");
        } else {
            bcrypt.hash(pwd, 10, (err, hash) => {
                const user = db
                    .get("users")
                    .find({
                        email: email,
                    })
                    .value();
                if (user) {
                    user.password = hash;
                    user.displayName = displayName;
                    db.get("users").find({ id: user.id }).assign(user).write();
                } else {
                    const user = {
                        id: shortid.generate(),
                        email: email,
                        password: hash,
                        displayName: displayName,
                    };
                    db.get("users").push(user).write();
                }

                req.login(user, (err) => {
                    console.log("redirect");
                    return res.redirect("/");
                });
            });
        }
    });

    router.get("/logout", (req, res) => {
        req.logout();
        req.session.save(() => {
            res.redirect("/");
        });
    });

    // 로그인 검증 단계 이후 성공여부에 따라 이동
    router.post(
        "/login_process",
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/auth/login",
            failureFlash: true,
            successFlash: true,
        })
    );
    return router;
};
