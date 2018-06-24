let express = require('express');
let userModel = require('../models/user');
let router = express.Router();


router.post('/', async (req, res) => {
    let name = req.body && req.body.user;
    let pwd = req.body && req.body.pwd;
    if (!name || !pwd) {
        res.json({ success: false, msg: '用户名或密码不能为空' });
        return;
    }
    const data = await userModel.findOne({ name: name }, 'pwd');
    if (!data || data.length === 0) {
        res.json({ success: false, msg: '用户名不存在' });
        return;
    }
    if (pwd !== data.pwd) {
        res.json({ success: false, msg: '密码不正确' });
        return;
    }
    req.session.name = name;
    req.session.lastTime = new Date().getTime();
    res.json({ success: true });
});

module.exports = router;
