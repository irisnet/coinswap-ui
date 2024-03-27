<template>
	<div class="optimize_container">
		<div class="optimize_content_wrap">
			<div class="optimize_content">
				<div class="tip">
					<span class="optimize_icon iconfont icon-tishi"></span>
					<span class="tip_text" v-html="notice"></span>
				</div>
				<span @click="closeTip()" class="close_icon iconfont icon-guanbi"></span>
			</div>

		</div>
	</div>
</template>

<script>
export default {
	name: "OptimizePromptComponent",
	props:{
		notice:{
			type:String
		},
	},
	methods:{
		closeTip(){
			this.$store.commit('isShowOptimizePrompt',false)
			sessionStorage.setItem('isShowOptimizePrompt',false)
		}
	}
}
</script>

<style scoped lang="scss">
	.optimize_container{
		width: 100%;
		.optimize_content_wrap{
			margin:  0 auto;
			max-width: 10rem;
			padding-top: 0.12rem;
			.optimize_content{
				box-sizing: border-box;
				padding: 0.08rem 0.12rem;
				background: var(--tooltipBoxBorderColor);
				border-radius: 0.08rem;
				display: flex;
				justify-content: space-between;
				@media (max-width: 1000px) {
					margin: 0 0.2rem;
				}
				.tip{
					display: flex;
					.optimize_icon{
						font-size: 0.16rem;
						color: var(--btnColor);
					}
					.tip_text{
						margin: 0 0.12rem;
						font-size: 0.16rem;
						color: var(--fontColorWhite);
						a{
							color: var(--btnColor)
						}
					}
				}
			}
			.close_icon{
				font-size: 0.14rem;
				color: var(--swapFontColorActive);
				cursor: pointer;
				padding-left: 0.12rem;
			}
		}
	}
</style>