let express = require('express');
let userModel = require('../models/user');
let to = require('../util/to');
let router = express.Router();

router.post('/', async (req, res) => {
    let name = req.body && req.body.user;
    let pwd = req.body && req.body.pwd;
    let err, result;

    if (!name || !pwd) {
        res.json({ success: false, msg: '用户名或密码不能为空' });
        return;
    }

    const data = await userModel.findOne({ name: name });
    if (data) {
        res.json({ success: false, msg: '用户名已存在' });
        return;
    }
    [err, result] = await to(signUp(name, pwd));
    if (err) {
        res.json({ success: false, msg: err.message });
    } else {
        res.json({ success: true });
    }
});

/**
 * 注册
 * @param name
 * @param pwd
 * @returns {Promise<*>}
 */
function signUp (name = '', pwd = '') {
    if (name === '' || pwd === '') {
        return new Promise(function (resolve, reject) {
            setTimeout(() => reject(new Error('用户名或密码不能为空')), 0);
        });
    }
    let user = new userModel({ name: name, pwd: pwd, createTime: new Date().getTime() });
    return user.save();
}

module.exports = router;
