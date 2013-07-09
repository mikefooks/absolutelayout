var jam = {
    "packages": [
        {
            "name": "jquery",
            "location": "vendor/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "vendor/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "version": "0.2.17",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({
    "packages": [
        {
            "name": "jquery",
            "location": "vendor/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "vendor/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "shim": {}
});
}
else {
    var require = {
    "packages": [
        {
            "name": "jquery",
            "location": "vendor/jquery",
            "main": "dist/jquery.js"
        },
        {
            "name": "lodash",
            "location": "vendor/lodash",
            "main": "./dist/lodash.compat.js"
        }
    ],
    "shim": {}
};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}