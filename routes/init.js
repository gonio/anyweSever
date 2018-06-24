let express = require('express');
let articleModel = require('../models/article');
let router = express.Router();

router.post('/', async (req, res) => {
    let data = {};
    if (req.session.name) {
        const list = await articleModel.find({}, null, { limit: 20 });
        data.name = req.session.name;
        data.typeList = [{ id: 'article', text: '文章' }];
        data.titleList = list.map((item) => {
            return { text: item.title, id: item._id };
        });

        res.json({ success: true, data: data });
    } else {
        res.json({ success: false, msg: '请登录' });
    }
});

module.exports = router;
