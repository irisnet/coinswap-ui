<template>
	<div class="swap_button_container">
		<el-button class="swap_button_content" type="primary" :disabled="notSwap" @click="confirmTx">
			{{ displayBtnLabel }}
		</el-button>
	</div>
</template>

<script>
import Tools from "../../util/utils";
const {VUE_APP_FEE} = process.env
export default {
	name: "SwapButtonComponent",
	data() {
		return {
			notSwap: true
		}
	},
	computed: {
		displayBtnLabel() {
			if (!this.$store.state.selectedFromToken || !this.$store.state.selectedToToken) {
				this.notSwap = true
				return 'Select a token'
			}
			if (!this.$store.state.isFromConversion) {
				this.notSwap = true
				return 'Enter an amount'
			}
			if (this.$store.state.selectedToToken
				&& this.$store.state.autoSetToIpt
				&& Number(this.$store.state.autoSetToIpt) > 0
				&& this.$store.state.isFromConversion.fromRaito < 0) {
				this.notSwap = true
				return 'Insufficient liquidity for this trade'
			}
      const feeDenom =JSON.parse(VUE_APP_FEE)?.denom || ''
      const feeAmount =JSON.parse(VUE_APP_FEE)?.amount || ''
			if (this.$store.state.selectedFromToken
				&& this.$store.state.selectedFromToken.denom === feeDenom
				&& this.$store.state.autoSetFromIpt
				&& this.$store.state.autoSetFromIpt > 0
				&& Number(Tools.minToMax(this.$store.state.selectedFromToken, this.$store.state.autoSetFromIpt)) > Tools.bigNumberSubtract(this.$store.state.selectedFromToken.balance, feeAmount)) {
				this.notSwap = true
				return `Insufficient ${this.$store.state.selectedFromToken.symbol.toUpperCase()} balance`
				
			}


			if (this.$store.state.isFromConversion
				&& this.$store.state.selectedFromToken
				&& this.$store.state.selectedFromToken.denom === feeDenom
				&& Number(this.$store.state.isFromConversion.from.amount) > Number(Tools.bigNumberSubtract(this.$store.state.selectedFromToken.balance, feeAmount))) {
				this.notSwap = true
				return `Insufficient ${this.$store.state.selectedFromToken.symbol.toUpperCase()} balance`
			} else {
				if (this.$store.state.isFromConversion
					&& this.$store.state.selectedFromToken
					&& Number(this.$store.state.isFromConversion.from.amount) > Number(this.$store.state.selectedFromToken.balance)) {
					this.notSwap = true
					return `Insufficient ${this.$store.state.selectedFromToken.symbol.toUpperCase()} balance`
				}
			}
			if(this.$store.state.isSwapBtnDisable){
				this.notSwap = this.$store.state.isSwapBtnDisable
				return 'Coinswap'
			}
			this.notSwap = false
			return this['_i18n'].messages[this['_i18n'].locale].swap
		}
	},
	watch: {
		'$store.state.isFromConversion'() {
			this.isCanSwapTx()
		},
		'$store.state.isSwapBtnDisable'(value) {
			this.notSwap = value
		}
	},
	methods: {
		isCanSwapTx() {
			if (this.$store.state.tokenList && this.$store.state.isFromConversion) {
				let currentBalance = 0;
				let inputValueBalance = 0;
				let minimumReceived = 0;
				let maximumSold = 0;
				this.$store.state.tokenList.forEach(item => {
					if (this.$store.state.isFromConversion.isBuyOrder) {
						if (item.denom === this.$store.state.isFromConversion.from.denom) {
							maximumSold = this.$store.state.isFromConversion.maximumSold
							currentBalance = item.balance
							inputValueBalance = this.$store.state.isFromConversion.from.amount
						}
					} else {
						if (item.denom === this.$store.state.isFromConversion.from.denom) {
							minimumReceived = this.$store.state.isFromConversion.minimumReceived;
							currentBalance = item.balance
							inputValueBalance = this.$store.state.isFromConversion.from.amount
						}
					}
				})
				this.notSwap = false
        const feeAmount =JSON.parse(VUE_APP_FEE)?.amount || ''
				let txBalance = Number(inputValueBalance) - Number(feeAmount)
				if (Number(txBalance) > Number(currentBalance)) {
					this.notSwap = true
				}
				
				if (maximumSold && maximumSold < 1) {
					this.notSwap = true
				}
				if (minimumReceived && minimumReceived < 1) {
					this.notSwap = true
				}
			}
			if (!this.$store.state.isFromConversion) {
				this.notSwap = true
			}
		},
		confirmTx() {
			if (this.notSwap) {
				return
			}
			let txObj = this.$store.state.swapObj
			if (txObj) {
				txObj.sender = this.$store.state.address
			}
			this.$store.commit('swapObj', txObj)
			if (this.$store.state.isFromConversion) {
				this.$store.commit('isShowSwapConfirmTxBox', true)
			}
		}
	}
}
</script>

<style scoped lang="scss">
.swap_button_container {
	width: 100%;
	
	.swap_button_content {
		width: 100%;
		padding: 0.1rem;
		border-radius: var(--borderRadius8);
		background: var(--btnColor);
		color: var(--fontColor1);
		text-align: center;
		line-height: var(--lineHeight20);
		font-size: var(--fontSize16);
		cursor: pointer;
		border: none;
		font-weight: var(--fontWt400);
	}
	
	.is-disabled {
		background: var(--tooltipBoxBorderColor);
		cursor: default;
		border: none;
	}
	
	.not_wasp {
		background: var(--tooltipBoxBorderColor) !important;
	}
}
</style>
