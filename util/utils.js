/**
 * 帮助处理await错误
 * @param promise
 * @returns {Promise}
 */
module.exports.to = function (promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => [err]);
};

module.exports.json = function (data, success = true, msg = '') {
    return { success, msg, data };
};


module.exports.json2 = function (data, success = true, msg = '') {
    return JSON.stringify({ success, msg, data });
};
