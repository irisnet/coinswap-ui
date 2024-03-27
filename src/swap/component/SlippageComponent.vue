<template>
	<div class="slippage_container" v-show="$store.state.isShowSlippageTolerance">
		<div class="slippage_content">
			<span class="slippage_label">{{$t('transactionSlippageSetting.slippageTolerance')}}</span>
			<span class="slippage_value">{{ showSlippageTolerance }}</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: "SlippageComponent",
		computed:{
			showSlippageTolerance(){
				const patt = /^\d+(\.\d+)?$/
				if(this.$store.state.slippageToleranceValue && patt.test(this.$store.state.slippageToleranceValue )){
					return `${this.$store.state.slippageToleranceValue}%`
				}
				return ""
			}
		}
	}
</script>

<style scoped lang="scss">
	.slippage_container{
		width: 100%;
		margin-top: var(--boxPadding16);
		.slippage_content{
			display: flex;
			justify-content: space-between;
			.slippage_label{
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}
			.slippage_value{
				color: var(--btnColor);
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20)
			}
		}
	}
</style>
