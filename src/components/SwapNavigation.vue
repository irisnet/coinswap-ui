<template>
	<div class="swap_navigation_container">
		<div class="swap_content">
			<div class="swap_pool_content">
				<div class="swap_content_item"
				     v-for="(item,index) in swapPoolNavigationList"
				     :key="index">
					<router-link :to="item.path">{{item.label}}</router-link>
				</div>
			</div>
			<div class="setting_icon_container">
				<div class="setting_content" @click.stop="settingIsShowToggle">
					<IconfontComponent :icon-name="$store.state.isShowSetting ? 'icon-select' : 'icon-set'"></IconfontComponent>
				</div>
				<swap-transaction-setting  v-show="$store.state.isShowSetting"></swap-transaction-setting>
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "./IconfontComponent";
	import SwapTransactionSetting from "../swap/component/SwapTransactionSetting";
	export default {
		name: "SwapNavigation",
		components: {SwapTransactionSetting, IconfontComponent},
		computed:{
			swapPoolNavigationList(){
				return this['_i18n'].messages[this['_i18n'].locale].swapPoolNavigation
			}
		},
		methods:{
			settingIsShowToggle(){
				if(this.$store.state.isShowSetting){
					this.$store.commit('isShowSetting',false)
					return
				}
				this.$store.commit('isShowSetting',true)
			}
		}
	}
</script>

<style scoped lang="scss">
.swap_navigation_container{
	.swap_content{
		display: flex;
		flex-direction: row;
		align-items: center;
		.swap_pool_content{
			flex: 1;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			.swap_content_item{
				flex: 1;
				text-align: center;
				font-size: var(--fontSize20);
				font-weight: var(--fontWt600);
				line-height: var(--lineHeight32);
				a{
					color: var(--swapFontColorUnActive);
				}
				.router-link-exact-active{
					color: var(--swapFontColorActive);
				}
			}
		}
		.setting_icon_container{
			position: relative;
			.setting_content{
				width: 0.32rem;
				height: 0.32rem;
				cursor: pointer;
			}
		}
	}
}
</style>
