<template>
	<div class="select_content">
		<div class="token_img_content">
			<img :src="standardInputToken.icon || require('@/assets/img/logo/iris_logo.png')" alt="">
		</div>
		<span class="token_name">{{standardInputToken.symbol && standardInputToken.symbol.toUpperCase() || 'IRIS'}}</span>
		<div class="select_icon">
			<i class="iconfont icon-zhankai1"></i>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	export default {
		name: "StandardTokenComponent",
		components: {IconfontComponent},
		data() {
			return {
				standardInputToken: this.$store.state.standardInputToken
			}
		},
		mounted(){
		},
		methods:{}
	}
</script>

<style scoped lang="scss">
	.select_content{
		display: flex;
		background: var(--bgWhiteColor);
		align-items: center;
		border-radius: var(--borderRadius6);
		// cursor: pointer;
		margin-left: 0.08rem;
		.token_img_content{
			margin-left: 0.08rem;
			width: 0.24rem;
			height: 0.24rem;
			display: flex;
			align-items: center;
			justify-content: center;
			img{
				width: 100%;
			}
		}
		.token_name{
			margin-left: 0.08rem;
			color: var(--fontColorBlack);
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
		}
		.select_icon{
			width: 0.48rem;
			height: 0.2rem;
			display: flex;
			align-items: center;
			.iconfont {
				margin-left: 0.06rem;
			}
		}
	}
</style>
