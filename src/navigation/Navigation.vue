<template>
	<div class="navigation_container" v-if="$store.state.isHideHeaderAndFooter">
		<div class="navigation_wrap">
			<div class="navigation_left_content">
				<logo-content></logo-content>
				<div class=" navigation_links_content">
					<router-content></router-content>
				</div>
			</div>
			<div class="navigation_right_content">
				<wallet-connect-content ref="walletConnectRef"></wallet-connect-content>
				<link-connect></link-connect>
			</div>
		</div>
		<div class="mobile_container">
			<div class="mobile_wap">
				<div class="mobile_left_content" @click="showSideMenu()">
					<iconfont-component icon-name="icon-caidan"></iconfont-component>
				</div>
				<div class="mobile_right_content">
					<logo-content></logo-content>
				</div>
			</div>
			
		</div>
	</div>
</template>

<script>
	import LogoContent from "./components/LogoContent";
	import RouterContent from "./components/RouterContent";
	import WalletConnectContent from "./components/WalletConnectContent";
	import LinkConnect from "./components/LinkConnect";
	import IconfontComponent from "../components/IconfontComponent";
	export default {
		name: "Navigation",
		components: {
			IconfontComponent, LinkConnect, WalletConnectContent, RouterContent, LogoContent},
		data() {
			return {
				healthCheckTimer:null,
			}
		},
		watch: {
			'$route.path'(){
				if(this.$route.path == "/add" || this.$route.path == "/remove") {
					this.$store.commit("isNavPool",true)
				} else {
					this.$store.commit("isNavPool",false)
				}
			}
		},
		methods:{
			showSideMenu(){
				if(this.$store.state.isShowSideMenu === 'default'){
					sessionStorage.setItem('isShowSideMenu',true)
					this.$store.commit('isShowSideMenu',true)
				}else {
					sessionStorage.setItem('isShowSideMenu',!this.$store.state.isShowSideMenu)
					this.$store.commit('isShowSideMenu',!this.$store.state.isShowSideMenu)
				}
			},
			beforeunloadHandler(){
				sessionStorage.removeItem('isShowSideMenu')
			},
			
		},
		mounted(){
			window.onbeforeunload = function(e) {
				e = e || window.event;
				if (e) {
					sessionStorage.removeItem('isShowSideMenu')
				}
				sessionStorage.removeItem('isShowSideMenu')
			};

			window.addEventListener("beforeunload", e => {
				this.beforeunloadHandler(e);
			});
			window.addEventListener("pagehide", function(){
				sessionStorage.removeItem('isShowSideMenu')
			}, false);
		},
		beforeDestroy(){
			sessionStorage.removeItem('isShowSideMenu')
		},
		destroyed(){
			sessionStorage.removeItem('isShowSideMenu')
		}
	}
</script>

<style scoped lang="scss">
.navigation_container{
	width: 100%;
	height: 0.62rem;
	background: var(--bgColor);
	border-bottom: 0.02rem solid var(--navLineColor);
	.navigation_wrap{
		max-width: 12rem;
		margin:0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		@media (max-width: 1200px) {
			margin: 0 0.2rem;
		}
		@media (max-width: 820px) {
			display: none;
		}
		.navigation_left_content{
			display: flex;
			align-items: center;
			.navigation_links_content{
				display: flex;
				align-items: center;
			}
		}
		.navigation_right_content{
			height: 0.6rem;
			display: flex;
			align-items: center;
		}
	}
	.mobile_container{
		height: 100%;
		display: none;
		@media (max-width: 820px) {
			display: block;
		}
		.mobile_wap{
			display: flex;
			height: 100%;
			align-items: center;
			.mobile_left_content{
				margin-left: 0.16rem;
				width: 0.36rem;
				height: 0.36rem;
			}
			.mobile_right_content{
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
}
</style>
