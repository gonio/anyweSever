const express = require('express');
const articleModel = require('../models/article');
const router = express.Router();

router.post('/', async (req, res) => {
    const data = {};
    if (req.session.name) {
        const list = await articleModel.find({}, null, { limit: 20 });
        data.isLogin = true;
        data.userName = req.session.name;

        res.json({ success: true, data });
    } else {
        res.json({ success: true, data: { userName: '', isLogin: false } });
    }
});

module.exports = router;
