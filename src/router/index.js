import VueRouter from "vue-router"
import store from "../vuex";
import {getTokens} from "../util/IritaHelper";
const Home = () => import("../home/Home.vue")
const coinswap = () => import("../swap/Swpa")
const pool = () => import("../pool/Pool")
const remove = () => import("../pool/Remove")
const farm = () => import("../farm/Farm")
const maintenance = () => import("../maintenancePage/MaintenancePage")
const forbidden = () => import("../errorPage/403")
const pageFound = () => import("../errorPage/404")
const routes = [
	{
		path:'/',
		redirect:'/home'
	},
	{
		path:'/home',
		component: Home
	},
	{
		path: '/coinswap',
		component:coinswap
	},
	{
		path: '/pool',
		component:pool,
	},
	{
		path: '/remove',
		component:remove
	},
	{
		path: '/farm',
		component:farm
	},
	{
		path:'/maintenance',
		component:maintenance
	},
	{
		path:'/403',
		component:forbidden
	},
	{
		path:'/404',
		component:pageFound
	},
	{
		path: "*",
		redirect: '/'
	}
]


const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
	return originalReplace.call(this, location).catch(err => err)
}

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}


const router = new VueRouter({
	mode:'history',
	routes
})
router.beforeEach((to,from,next) => {
	const isDownloadKeplr = sessionStorage.getItem('isDownloadKeplr') ? JSON.parse(sessionStorage.getItem('isDownloadKeplr')) : null
	if( isDownloadKeplr&& isDownloadKeplr.path  && isDownloadKeplr.path !== to.path){
		sessionStorage.removeItem('isDownloadKeplr')
	}
	if(to.path ==='/maintenance' || to.path ==='/403' || to.path ==='/404'){
		store.commit('isHideHeaderAndFooter',false)
		store.commit('isReadmeNotice',false)
		store.commit('isShowOptimizePrompt',false)
	}else if(to.path !=='/farm'){
		store.commit('isShowStakeMask', {isShow: false})
	}else {
		store.commit('isHideHeaderAndFooter',true)
	}
	next()
	getTokens()
})
export default router
