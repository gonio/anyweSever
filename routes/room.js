const express = require('express');
const { rooms } = require('./ws');
const { json } = require('../util/utils');
const router = express.Router();

router.post('/list', async (req, res) => {
    if (req.session.name) {
        res.json(json(Object.values(rooms).map(item => item.info)));
    } else {
        res.json(json({  }));
    }
});
module.exports = router;
