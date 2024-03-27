import Vue from 'vue'
import App from './App.vue'
import VueI18n from "vue-i18n"
import en from "./assets/lang/en"
import VueRouter from 'vue-router'
import router from "./router"
import iptOnlyNum from './directives/index'
import clipboard from "clipboard"
import {liquidityTask} from "./util/sdkHelper";
import {getTokens} from "./util/IritaHelper"
import {Button,Input,Checkbox,Table,TableColumn,Tabs,TabPane,Notification} from "element-ui"
import "./assets/iconfont/iconfont.css"
import "./assets/iconfont/iconfont"
import 'element-ui/lib/theme-chalk/index.css'
import updateBalance from "./util/updateBalance";
import store from "./vuex/index"
import 'spinkit/spinkit.css'
import vuescroll from 'vuescroll';
import {syncTx} from "./util/syncTx";
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
sessionStorage.setItem('setFrom', JSON.stringify(store.state.selectedFromToken))

updateBalance()
getTokens()
syncTx()
setInterval(() => {
	updateBalance()
}, 10000)
setInterval(() => {
	syncTx()
},5000)
liquidityTask()
locale.use(lang)
Vue.use(VueI18n).use(VueRouter).use(Button)
	.use(Input).use(Checkbox).use(Table)
	.use(TableColumn).use(Tabs).use(TabPane)
Vue.prototype.cliboard = clipboard
Vue.prototype.$notify = Notification;
Vue.use(vuescroll, {
	ops: {},
	name: 'noticeScroll'
});
const i18n = new VueI18n({
	locale: 'en',
	messages: {
		en
	}
})

new Vue({
	el: '#app',
	i18n,
	router,
	store,
	render: (h) => h(App),
})
