const { hash } = require('bcryptjs');

exports.doHash = (value, saltValue) => {
    const result = hash(value, saltValue);
    return result;
};

