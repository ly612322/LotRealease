module.exports = {
  publicPath: './',
  assetsDir: './static',
  indexPath: 'Lot release.html',
  devServer: {
    open: true, // 是否自动弹出浏览器页面
    host: 'localhost',
    port: '8083',
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        target: 'http://10.1.10.211', // API服务器的地址
        changeOrigin: true, // 更换origin
        pathRewrite: {
          '^/api': ''
      }
      }
    }
  }
}
