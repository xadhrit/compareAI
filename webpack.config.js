module.exports = {
    resolve: {
        fallback: {
            "path": require.resolve("path"),
            "os": require.resolve("os-browserify/browser"),
            "crypto": require.resolve("crypto-browserify"),
        },
    },
};