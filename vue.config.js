const {VUE_APP_SERVER_URL} = process.env
module.exports = {
	lintOnSave: false,
	devServer: {
		proxy: {
			'/api':{
				target:`${VUE_APP_SERVER_URL}`,
				secure:false,
				changeOrigin:true,
				pathRewrite:{'^/api': '/'}
			}
		}
	},
}
