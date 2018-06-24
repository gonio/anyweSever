/**
 * 帮助处理await错误
 * @param promise
 * @returns {Promise<T | *[]>}
 */
module.exports = function to (promise) {
    return promise
        .then(data => {
            return [null, data];
        })
        .catch(err => [err]);
};