<template>
	<div class="swap_content_container">
		<div class="swap_container_wrap">
			<div class="swap_content_wrap_container">
				<div class="swap_container">
					<div class="swap_content_wrap">
						<div class="swap_content">
							<swap-navigation></swap-navigation>
							<from-component></from-component>
							<div class="shuttle_content">
								<div class="shuttle_icon" @click="interchangeToken">
									<iconfont-component icon-name="icon-jiaohuan"></iconfont-component>
								</div>
							</div>
							<to-component></to-component>
							<price-component v-show="displayPriceTooltip"></price-component>
							<slippage-component></slippage-component>
							<div class="button_content">
								<wallet-connect-content v-if="!$store.state.isConnected"></wallet-connect-content>
								<swap-button-component v-if="$store.state.isConnected"></swap-button-component>
							</div>
						</div>
					</div>
				</div>
				<swap-tx-tooltip-component></swap-tx-tooltip-component>
			</div>
			
		</div>
	</div>
</template>

<script>
	import SwapNavigation from "../components/SwapNavigation";
	import FromComponent from "./component/FromComponent";
	import ToComponent from "./component/ToComponent";
	import IconfontComponent from "../components/IconfontComponent";
	import SlippageComponent from "./component/SlippageComponent";
	import WalletConnectContent from "../navigation/components/WalletConnectContent";
	import SwapTxTooltipComponent from "./component/SwapTxTooltipComponent";
	import PriceComponent from "./component/PriceComponent";
	import SwapButton from "../home/components/SwapButton";
	import SwapButtonComponent from "./component/SwapButtonComponent";
	import Tools from "../util/utils";
	import {swapToken} from "../util/sdkHelper";
	
	export default {
		name: "Swpa",
		components: {
			SwapButtonComponent,
			SwapButton,
			PriceComponent,
			SwapTxTooltipComponent,
			WalletConnectContent,
			SlippageComponent,
			IconfontComponent,
			ToComponent,
			FromComponent,
			SwapNavigation
		},
		watch: {
			displayPrice:{
				handler(){
				
				},
				deep: true
			},
			fromInputValue:{
				handler() {
					this.displayPriceTooltip = false
					if( this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion) {
						if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.to.amount < 0 ) return this.displayPriceTooltip = false
						this.displayPriceTooltip = true
					}
				},
				deep:true
			},
			toInputValue:{
				handler() {
					this.displayPriceTooltip = false
					if(this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion ){
						if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.from.amount < 0)  return this.displayPriceTooltip = false
						this.displayPriceTooltip = true
					}
				},
				deep: true
			},
			'$store.state.selectedFromToken' () {
				if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
					if (this.$store.state.selectedToToken && this.$store.state.autoSetToIpt && this.$store.state.autoSetToIpt > 0) {
						this.computedConversion(true, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, false, true)
					} else if (this.$store.state.selectedFromToken && this.$store.state.autoSetFromIpt && this.$store.state.autoSetFromIpt > 0) {
						this.computedConversion(false, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, true, false)
					}
				}
				
			},
			'$store.state.selectedToToken' () {
				if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
					if (this.$store.state.selectedFromToken && this.$store.state.autoSetFromIpt && this.$store.state.autoSetFromIpt > 0) {
						this.computedConversion(false, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, false, true)
					} else if (this.$store.state.selectedFromToken && this.$store.state.autoSetToIpt && this.$store.state.autoSetToIpt > 0) {
						this.computedConversion(true, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, false, true)
					}
				}
			},
			'$store.state.autoSetFromIpt'() {
				if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken && this.$store.state.autoSetFromIpt > 0) {
					this.computedConversion(false, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, true, false)
				}
			},

			'$store.state.autoSetToIpt'() {
				if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken && this.$store.state.autoSetToIpt > 0) {
					this.computedConversion(true, this.$store.state.selectedFromToken, this.$store.state.selectedToToken, false, true)
				}
			},
			'$store.state.slippageToleranceValue' () {
				this.computedConversion(
					this.needSaveIsBuyOrder,
					this.needSaveSelectFormToken,
					this.needSaveSelectToToken,
					this.needSaveSetToIpt,
					this.needSaveSetFrom
				)
			}
			
		},
		data () {
			return {
				needSaveIsBuyOrder: '',
				needSaveSelectFormToken: '',
				needSaveSelectToToken: '',
				needSaveSetToIpt: '',
				needSaveSetFrom: '',
				displayPriceTooltip:false
			}
		},
		methods: {
			computedConversion (isBuyOrder, selectFormToken, selectToToken, setToIpt, setFrom) {
				this.needSaveIsBuyOrder = isBuyOrder;
				this.needSaveSelectFormToken = selectFormToken;
				this.needSaveSelectToToken = selectToToken;
				this.needSaveSetToIpt = setToIpt;
				this.needSaveSetFrom = setFrom;
				
				const fromToken = {
					denom: selectFormToken?.minUnit || '',
					amount: isBuyOrder ? '' : selectFormToken ? Tools.minToMax(selectFormToken, this.$store.state.autoSetFromIpt) : ''
				}
				const toToken = {
					denom: selectToToken?.minUnit || '',
					amount: isBuyOrder ? selectToToken ? Tools.minToMax(selectToToken, this.$store.state.autoSetToIpt) : '' : ''
				}
				if (selectFormToken && selectToToken && fromToken.amount && fromToken.amount > 0 || toToken.amount && toToken.amount > 0) {
					swapToken(isBuyOrder, fromToken, toToken, Tools.bigNumberDivide(this.$store.state.slippageToleranceValue, 100)).then(conversion => {
						if (conversion) {
							this.$store.commit('isFromConversion', conversion)
							let inputAmount =
								isBuyOrder ?
									Math.floor(conversion.maximumSold)
									: Math.floor(Tools.minToMax(this.$store.state.selectedFromToken, Number(this.$store.state.autoSetFromIpt)))
							let outputAmount =
								isBuyOrder ?
									Math.floor(Tools.minToMax(this.$store.state.selectedToToken, Number(this.$store.state.autoSetToIpt)))
									: Math.floor(Number(conversion.minimumReceived))
							
							let swapObj = {
								input: {
									denom: isBuyOrder ? this.$store.state.selectedFromToken.minUnit : this.$store.state.selectedFromToken.minUnit,
									amount: inputAmount
								},
								output: {
									denom: isBuyOrder ? this.$store.state.selectedToToken.minUnit : this.$store.state.selectedToToken.minUnit,
									amount: outputAmount
								},
								is_buy_order: isBuyOrder,
								deadline: Math.floor(new Date().getTime() / 1000 + (20 * 60)),
								sender: this.$store.state.address
							}
							this.$store.commit('swapObj', swapObj)
							this.$store.commit('isBuyOrder', isBuyOrder)
						}
					})
				}
			},
			
			interchangeToken () {
				
				let fromData = JSON.parse(JSON.stringify(this.$store.state.selectedFromToken));
				
				let toData = JSON.parse(JSON.stringify(this.$store.state.selectedToToken));
				
				let fromIpt = this.$store.state.autoSetFromIpt
				let toIpt = this.$store.state.autoSetToIpt
				
				let isStoreStutus = this.$store.state.isChangeToken
				let currentIsBuyStatus = this.$store.state.isBuyOrder
				toData = [fromData, fromData = toData][0]
				this.$store.commit('selectedToToken', toData)
				this.$store.commit('selectedFromToken', fromData)
				
				if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
					let temp = fromIpt
					fromIpt = toIpt
					toIpt = temp
					
					if (!currentIsBuyStatus) {
						if (fromIpt) {
							this.$store.commit('autoSetToIpt', toIpt)
							this.$store.commit('autoSetFromIpt', fromIpt)
						} else {
							this.$store.commit('autoSetFromIpt', fromIpt)
							this.$store.commit('autoSetToIpt', toIpt)
						}
						
					} else {
						if (fromIpt) {
							this.$store.commit('autoSetToIpt', toIpt)
							this.$store.commit('autoSetFromIpt', fromIpt)
						} else {
							this.$store.commit('autoSetFromIpt', fromIpt)
							this.$store.commit('autoSetToIpt', toIpt)
						}
					}
				}
				
				this.$store.commit('isChangeToken', !isStoreStutus)
				this.$store.commit('isBuyOrder', !currentIsBuyStatus)
				setTimeout(() => {
					if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
						this.computedConversion(!currentIsBuyStatus, fromData, toData, currentIsBuyStatus, !currentIsBuyStatus)
					}
				}, 100)
				
				
			},
		},
		computed: {
			displayPrice(){
				this.displayPriceTooltip = false
				if (this.$store.state.selectedFromToken  && this.$store.state.selectedToToken && this.$store.state.isFromConversion) {
					if(this.$store.state.isFromConversion?.from?.amount < 0){
						return this.displayPriceTooltip = false
					}
					if(this.$store.state.isFromConversion?.to?.amount < 0){
						return this.displayPriceTooltip = false
					}
					return this.displayPriceTooltip = true
				}
			},
			fromInputValue() {
				return this.$store.state.autoSetFromIpt
			},
			toInputValue(){
				return this.$store.state.autoSetToIpt
			}
			
		},
		beforeDestroy () {
			if(this.$store.state.tokenList){
				this.$store.state.tokenList.forEach( item => {
					item.isFrom = ''
					item.isTo = ''
					if(item.isBaseToken){
						item.isFrom = true
						item.isTo = ''
					}
				})
			}
			this.$store.commit('selectedToToken', null)
			this.$store.commit('conversion', null)
			this.$store.commit('isFromConversion', null)
			this.$store.commit('autoSetFromIpt', '')
			this.$store.commit('autoSetToIpt', '')
		}
	}
</script>

<style scoped lang="scss">
	.swap_content_container {
		width: 100%;
		height: 100%;
		position: relative;
		.swap_container_wrap {
			position: absolute;
			left: 50%;
			top: 10%;
			transform: translateX(-50%);
			width: 100%;
			.swap_content_wrap_container{
				margin-bottom: 1rem;
				.swap_container {
					width: 100%;
					.swap_content_wrap {
						max-width: 12rem;
						margin: 0 auto;
						@media (max-width: 460px) {
							margin: 0 0.16rem;
						}
						.shuttle_content {
							width: 100%;
							height: 0.48rem;
							display: flex;
							align-items: center;
							justify-content: center;
							
							.shuttle_icon {
								width: 0.16rem;
								height: 0.16rem;
								cursor: pointer;
							}
						}
						
						.swap_content {
							margin: 0 auto;
							width: 4.24rem;
							box-sizing: border-box;
							padding: var(--boxPadding24);
							background: var(--bgWhiteColor);
							border-radius: var(--borderRadius8);
							@media (max-width: 460px) {
								width: 100%;
								min-width: 2.88rem;
								padding:var(--boxPadding24) var(--boxPadding16);
							}
						}
						
						.button_content {
							margin-top: var(--boxPadding16);
						}
					}
				}
			}
		}
	}
</style>
