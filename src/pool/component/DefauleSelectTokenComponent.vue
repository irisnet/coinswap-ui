<template>
	<div class="default_select_content">
		<span class="default_select_label" @click.stop="selectToken">{{$t('defaultSelectedToken')}}</span>
		<span class="default_select_icon iconfont icon-zhankai"></span>
	</div>
</template>

<script>
	export default {
		name: "DefauleSelectTokenComponent",
		props:{
			isToken: {
				type: Boolean
			}
		},
		methods:{
			selectToken(){
				this.$store.commit('isSelectToken',true)
				this.$store.commit('isStartSelectAddLiquidity',true)
			}
		}
	}
</script>

<style scoped lang="scss">
	.default_select_content{
		text-align: center;
		border-radius: var(--borderRadius6);
		background: var(--btnColor);
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 0.07rem 0.08rem;
		cursor: pointer;
		@media (max-width: 460px) {
			justify-content: center;
			height: 0.4rem;
			max-width: 1.6rem;
		}
		.default_select_label{
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
			color: var(--fontColorWhite);
		}
		.default_select_icon{
			margin-left: 0.08rem;
			font-size: var(--fontSize16);
			color: var(--fontColorWhite);
		}
	}
</style>
