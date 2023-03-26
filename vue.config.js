module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/REPO_NAME/" : "/",
    devServer: {
        proxy: 'https://localhost:9999'
    }

}