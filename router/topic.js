const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../models/template");
const auth = require("../models/auth");
const shortid = require("shortid");
const db = require("../config/db");

router.get("/create", (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect("/");
        return false;
    }
    const title = "WEB - create";
    const list = template.list(req.list);
    const body = `<form action="/topic/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p><textarea name="description" placeholder="description"></textarea></p>
                    <p><input type="submit"></p>
                  </form>`;
    const control = "";
    const html = template.HTML(
        title,
        list,
        body,
        control,
        auth.statusUI(req, res)
    );
    res.send(html);
});

router.post("/create_process", (req, res) => {
    const post = req.body;
    const title = post.title;
    const description = post.description;
    const id = shortid.generate();
    db.get("topics")
        .push({
            id: id,
            title: title,
            description: description,
            user_id: req.user.id,
        })
        .write();
    res.redirect(`/topic/${id}`);
});

router.get("/update/:pageId", (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect("/");
        return false;
    }
    const topic = db.get("topics").find({ id: req.params.pageId }).value();
    if (topic.user_id !== req.user.id) {
        req.flash("error", "Not yours!");
        return res.redirect("/");
    }

    const title = topic.title;
    const description = topic.description;
    const list = template.list(req.list);
    const body = `<form action="/topic/update_process" method="post">
                        <input type="hidden" name="id" value="${topic.id}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description">${description}</textarea></p>
                        <p><input type="submit"></p>
                      </form>`;
    const control = `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`;
    const html = template.HTML(
        title,
        list,
        body,
        control,
        auth.statusUI(req, res)
    );
    res.send(html);
});

router.post("/update_process", (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect("/");
        return false;
    }
    const post = req.body;
    const id = post.id;
    const title = post.title;
    const description = post.description;
    const topic = db.get("topics").find({ id: id }).value();
    if (topic.user_id !== req.user.id) {
        req.flash("error", "Not yours!");
        return res.redirect("/");
    }
    db.get("topics")
        .find({ id: id })
        .assign({
            title: title,
            description: description,
        })
        .write();
    res.redirect(`/topic/${topic.id}`);
});

router.post("/delete_process", (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect("/");
        return false;
    }
    const post = req.body;
    const id = post.id;
    const topic = db.get("topics").find({ id: id }).value();

    if (topic.user_id !== req.user.id) {
        req.flash("error", "Not yours!");
        return res.redirect("/");
    }
    db.get("topics").remove({ id: id }).write();
    res.redirect("/");
});

router.get("/:pageId", (req, res, next) => {
    const topic = db
        .get("topics")
        .find({
            id: req.params.pageId,
        })
        .value();
    const user = db
        .get("users")
        .find({
            id: topic.user_id,
        })
        .value();

    const sanitizedTitle = sanitizeHtml(topic.title);
    const sanitizedDescription = sanitizeHtml(topic.description, {
        allowedTags: ["h1"],
    });

    const list = template.list(req.list);
    const body = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}<p>by ${user.displayName}</p>`;
    const control = `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>
                            <form action="/topic/delete_process" method="post">
                                <input type="hidden" name="id" value="${topic.id}">
                                <input type="submit" value="delete">
                            </form>`;
    const html = template.HTML(
        sanitizedTitle,
        list,
        body,
        control,
        auth.statusUI(req, res)
    );
    res.send(html);
});

module.exports = router;
