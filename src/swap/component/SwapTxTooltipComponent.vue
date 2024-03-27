<template>
	<div class="swap_tx_tooltip_content" v-show="displayTooltip">
		<p class="min_receive_content">
			<span class="min_receive_label" v-if="!isShowMinimunReceived">{{$t('txTooltip.minReceived')}}
				<span class="tool_tip_content">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="receive_tooltip_content">
						{{$t('txTooltip.minReceivedTip')}}
					</div>
				</span>
			</span>
			<span class="min_receive_label" v-if="isShowMinimunReceived">{{$t('txTooltip.maxSold')}}
				<span class="tool_tip_content">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="receive_tooltip_content">
						{{$t('txTooltip.maxSoldTip')}}
					</div>
				</span>
			</span>
			<span class="min_receive_value">{{minimumReceived}}</span>
		</p>
		<p class="price_impact_content">
			<span class="price_impact_label">{{$t('txTooltip.priceImpact')}}
				<span class="tool_tip_content">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="receive_tooltip_content">
						{{$t('txTooltip.priceImpactTip')}}
					</div>
				</span>
			</span>
			<span class="price_impact_value" :style="{color: isChangeColor}"> {{priceImpact}} %</span>
		</p>
		<p class="liquidity_content">
			<span class="liquidity_label">{{$t('txTooltip.liquidityProviderFee')}}
				<span class="tool_tip_content">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="receive_tooltip_content">
						{{$t('txTooltip.liquidityProviderFeeTip')}}
					</div>
				</span>
			</span>
			<span class="liquidity_value">{{liquidityFee}}</span>
		</p>
		<swap-path-component></swap-path-component>
	</div>
</template>

<script>
	import SwapPathComponent from "./SwapPathComponent";
	import IconfontComponent from "../../components/IconfontComponent";
	import Tools from "../../util/utils";

	export default {
		name: "SwapTxTooltipComponent",
		components: {IconfontComponent, SwapPathComponent},
		data(){
			return {
				displayTooltip:false
			}
		},
		watch:{
			displayDetailTooltip:{
				handler(){
				
				},
				deep: true
			},
			fromInputValue:{
				handler() {
					this.displayTooltip = false
					if( this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion) {
						if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.to.amount < 0 ) return this.displayTooltip = false
						this.displayTooltip = true
					}
				},
				deep:true
			},
			toInputValue:{
				handler() {
					this.displayTooltip = false
					if(this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion ){
						if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.from.amount < 0)  return this.displayTooltip = false
						this.displayTooltip = true
					}
				},
				deep: true
			},
		},
		computed: {
			displayDetailTooltip(){
				this.displayTooltip = false
				if (this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion) {
					if(this.$store.state.isFromConversion?.from?.amount < 0){
						return this.displayTooltip = false
					}
					if(this.$store.state.isFromConversion?.to?.amount < 0){
						return this.displayTooltip = false
					}
					return this.displayTooltip = true
				}
				
			},
			isChangeColor(){
				if(Number(this.priceImpact) > 5)	{
					return 'rgba(255, 98, 98, 1)'
				}else if( 3 <= Number(this.priceImpact) &&  Number(this.priceImpact) <= 5 ){
					return  'rgba(255, 167, 0, 1)'
				}else if(1 <= Number(this.priceImpact)  &&  Number(this.priceImpact) < 3) {
					return  'rgba(112, 144, 255, 1)'
				}else if( Number(this.priceImpact) < 1){
					return  "rgba(109, 212, 0, 1)"
				}else if(this.priceImpact === '< 0.01'){
					return  "rgba(109, 212, 0, 1)"
				}
			},
			isShowMinimunReceived () {
				if(this.$store.state.isToConversion && !this.$store.state.isToConversion.isBuyOrder){
					return false
				}
				if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder){
					return true
				}
			},
			
			showTxTooltip () {
				if (this.$store.state.selectedFromToken  && this.$store.state.selectedToToken) {
					if(this.$store.state.isFromConversion){
						return  true
					}
					return  false
				}
				return false
			},
			minimumReceived () {
				if(this.$store.state.selectedFromToken && this.$store.state.selectedToToken){
					const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
					const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
					if(this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder){
						let number = Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.minimumReceived,this.$store.state.selectedToToken.scale),toDecimal);
						if(number != 0) {
							this.$store.commit('isSwapBtnDisable',false)
							number = Tools.formatBigNumber(number)
						}else {
							this.$store.commit('isSwapBtnDisable',true)
						}
						return `${Tools.formatDecimalPartToLong(number)} ${this.$store.state.selectedToToken.symbol.toUpperCase()}`
					}
					if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder){
						const number = Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.maximumSold,this.$store.state.selectedFromToken.scale),fromDecimal))
						if(number != 0) {
							this.$store.commit('isSwapBtnDisable',false)
						}else {
							this.$store.commit('isSwapBtnDisable',true)
						}
						return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.maximumSold,this.$store.state.selectedFromToken.scale),fromDecimal)))} ${this.$store.state.selectedFromToken.symbol.toUpperCase()}`
					}
					
				}
			
				return ''
			},
			priceImpact () {
				if(this.$store.state.selectedFromToken && this.$store.state.selectedToToken){
					if(this.$store.state.isFromConversion){
						let priceImpact = (this.$store.state.isFromConversion.priceImpact * 100).toFixed(2)
						if(Number(priceImpact) < 0.01){
							return `< 0.01`
						}
						return `${priceImpact}`
					}
				}
				return ''
			},
			liquidityFee () {
				if(this.$store.state.selectedFromToken && this.$store.state.selectedToToken){
					const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
					if(this.$store.state.isFromConversion){
						let number = Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedFromToken,this.$store.state.isFromConversion.liquidityProviderFee.amount),fromDecimal);
						if(number != 0) {
							number = Tools.formatBigNumber(number)
						}
						return  `${Tools.formatDecimalPartToLong(number)} ${this.$store.state.selectedFromToken.symbol.toUpperCase()}`
					}
				}
				return ''
			},
			fromInputValue() {
				return this.$store.state.autoSetFromIpt
			},
			toInputValue(){
				return this.$store.state.autoSetToIpt
			}
		}
	}
</script>

<style scoped lang="scss">
	.swap_tx_tooltip_content {
		box-sizing: border-box;
		padding: var(--boxPadding24);
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		max-width: 4.24rem;
		margin: 0.08rem auto 1rem auto;
		@media (max-width: 460px) {
			padding: var(--boxPadding16);
			margin: 0.08rem 0.16rem 0 0.16rem;
		}
		.min_receive_content {
			display: flex;
			justify-content: space-between;
			@media (max-width: 375px) {
				flex-direction: column;
			}
			.min_receive_label {
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
				white-space: nowrap;
				.tool_tip_content {
					margin-left: 0.08rem;
					display: inline-block;
					width: 0.16rem;
					height: 0.16rem;
					position: relative;
					cursor: pointer;
					&:hover {
						.receive_tooltip_content {
							display: block;
							
						}
					}
					
					.receive_tooltip_content {
						display: none;
						position: absolute;
						left: 0.3rem;
						bottom: -0.12rem;
						background: var(--bgWhiteColor);
						width: 2.32rem;
						border-radius: var(--borderRadius8);
						box-sizing: border-box;
						padding: var(--boxPadding16);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						white-space: pre-wrap;
						&:after {
							content: url("../../assets/img/tips_icon.png");
							position: absolute;
							left: -0.08rem;
							bottom: 0.05rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
						}
						@media (max-width: 460px) {
							left: -1rem;
							bottom: 0.3rem;
							white-space: pre-wrap;
							&:after {
								left: 1rem;
								bottom: -0.15rem;
								transform: rotate(-90deg);
							}
						}
					}
				}
			}
			
			.min_receive_value {
				font-size: var(--fontSize14);
				color: var(--btnColor);
				font-weight: var(--fontWt600);
				line-height: var(--LineHeight20);
			}
		}
		
		.price_impact_content {
			display: flex;
			justify-content: space-between;
			margin-top: 0.08rem;
			@media (max-width: 375px) {
				flex-direction: column;
			}
			.price_impact_label {
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
				
				.tool_tip_content {
					margin-left: 0.08rem;
					display: inline-block;
					width: 0.16rem;
					height: 0.16rem;
					position: relative;
					cursor: pointer;
					
					&:hover {
						.receive_tooltip_content {
							display: block;
							
						}
					}
					
					.receive_tooltip_content {
						display: none;
						position: absolute;
						left: 0.3rem;
						bottom: -0.12rem;
						background: var(--bgWhiteColor);
						width: 2.32rem;
						border-radius: var(--borderRadius8);
						box-sizing: border-box;
						padding: var(--boxPadding16);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						
						&:after {
							content: url("../../assets/img/tips_icon.png");
							position: absolute;
							left: -0.08rem;
							bottom: 0.1rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
						}
						@media (max-width: 460px) {
							left: -0.55rem;
							bottom: 0.27rem;
							&:after {
								left: 0.55rem;
								bottom: -0.15rem;
								transform: rotate(-90deg);
							}
						}
					}
				}
			}
			
			.price_impact_value {
				font-size: var(--fontSize14);
				color: var(--btnColor);
				font-weight: var(--fontWt600);
				line-height: var(--LineHeight20);
			}
		}
		
		.liquidity_content {
			display: flex;
			justify-content: space-between;
			margin-top: 0.08rem;
			@media(max-width: 375px){
				flex-direction: column;
			}
			.liquidity_label {
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
				
				.tool_tip_content {
					margin-left: 0.08rem;
					display: inline-block;
					width: 0.16rem;
					height: 0.16rem;
					position: relative;
					cursor: pointer;
					
					&:hover {
						.receive_tooltip_content {
							display: block;
							
						}
					}
					
					.receive_tooltip_content {
						display: none;
						position: absolute;
						left: 0.3rem;
						bottom: -0.12rem;
						background: var(--bgWhiteColor);
						width: 2.32rem;
						border-radius: var(--borderRadius8);
						box-sizing: border-box;
						padding: var(--boxPadding16);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						
						&:after {
							content: url("../../assets/img/tips_icon.png");
							position: absolute;
							left: -0.08rem;
							bottom: 0.05rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
						}
						@media (max-width: 460px) {
							left: -1.2rem;
							bottom: 0.28rem;
							&:after {
								left: 1.2rem;
								bottom: -0.15rem;
								transform: rotate(-90deg);
							}
						}
					}
				}
			}
			
			.liquidity_value {
				font-size: var(--fontSize14);
				color: var(--btnColor);
				font-weight: var(--fontWt600);
				line-height: var(--LineHeight20);
			}
		}
	}
</style>
