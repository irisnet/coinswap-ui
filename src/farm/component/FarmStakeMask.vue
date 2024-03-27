<template>
	<div class="farm_stake_container">
		<div class="farm_stake_content_wrap">
			<div class="farm_stake_title_content">
				<div class="farm_stake_content">
                    <span
	                    class="farm_stake_label">{{
		                    isStake ? $t('farm.maskBox.stake') : $t('farm.maskBox.unstake')
	                    }}</span>
					<span
						class="farm_stale_value">{{
							currentFarmData && currentFarmData.txName ? currentFarmData.txName : ''
						}} {{ $t('farm.maskBox.lpTokens') }}</span>
				</div>
				<div class="farm_close_icon" @click.stop="closeStakeOrUnStakeMask">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</div>
			</div>
			<div class="farm_input_content">
				<el-input class="farm_input"
				          v-model="inputValue"
				          v-iptOnlyNum
				          placeholder="0.0000"
				          type="text"></el-input>
				<el-button class="max_button" type="primary" @click="selectAll">Max</el-button>
			</div>
			<p class="farm_staked_label_container">
				<span class="farm_staked_label_content">
					<span class="farm_staked_label">{{ $t('farm.maskBox.available') }}</span>
					<span class="farm_staked_tooltip">({{ isStake ? 'Balance' : 'Staked' }})</span>
				</span>
				<span
					class="farm_staked_value">{{
						isStake ? lpBalance ? formatLpBalanceNumber(lpBalance) : '' : stakedValue ? formatLpBalanceNumber(stakedValue) : ''
					}} {{
						currentFarmData && currentFarmData.txName ? currentFarmData.txName : ''
					}} {{ $t('farm.maskBox.lp') }}</span>
			</p>
			<div class="farm_staked_confirm_content">
				<el-button class="farm_staked_confirm_button" :disabled="isConfirm" type="primary" @click="sendTx">
					{{ $t('farm.maskBox.confirm') }}
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "../../components/IconfontComponent";
import {
    getClient,
    singleConfig,
	broadcastTx,
	queryBankAllBalances,
	queryBankBalance,
	buildFarmStake,
	buildFarmUnStake
} from "../../util/sdkHelper";
import {
	fee, insufficientFee,
    chainId,
	irisAmount,
	irisTxDenom,
    BROADCASTING
} from "../../constant";
import Tools from "../../util/utils";

import {showBroadcasting} from "../../util/notifyPopUp";
const {VUE_APP_FEE} = process.env

export default {
	name: "FarmStakeInput",
	components: {IconfontComponent},
	data() {
		return {
			inputValue: '',
			isStake: true,
			currentFarmData: null,
			isConfirm: false,
			farmData: null,
			lpBalance: '',
			stakedValue: '',
            client: null
		}
	},
	watch: {
		inputValue() {
			if (this.inputValue) {
				this.inputValue = this.inputValue.toString().match(/^\d*(\.?\d{0,6})/g)[0].replace(/[^\d^\.]+/g, '').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
				if (!Number(this.inputValue)) {
					this.isConfirm = true;
				} else {
					this.isConfirm = false;
				}
			}

			const baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
			const scale = baseToken.scale;
			let minInput = Tools.formatDecimal(Tools.maxToMin(baseToken, 1), Number(scale) || 0)
			if (this.isStake) {
				if (Number(this.inputValue) > Number(this.lpBalance)) {
					this.inputValue = this.lpBalance
				} else if (Number(this.inputValue) > 0 && Number(this.inputValue) < Number(minInput)) {
					this.inputValue = minInput
				}
			} else {
				if (Number(this.inputValue) > Number(this.stakedValue)) {
					this.inputValue = this.stakedValue
				} else if (Number(this.inputValue) > 0 && Number(this.inputValue) < Number(minInput)) {
					this.inputValue = minInput
				}
			}
		},
		MaskData: {
			handler() {
				let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
				this.isStake = false
				this.farmData = this.$store.state.isShowStakeMask
				if (this.$store.state.isShowStakeMask && this.$store.state.isShowStakeMask.data) {
					if (this.$store.state.isShowStakeMask.type === 'stake') {
						this.isStake = true
					}
					this.currentFarmData = this.$store.state.isShowStakeMask.data
					if (this.$store.state.isShowStakeMask.type === 'stake' && this.currentFarmData.lpBalance > 0) {
						this.isConfirm = false
						if (baseToken) {
							this.lpBalance = Tools.maxToMin(baseToken, this.currentFarmData.lpBalance)
						}
					} else if (this.$store.state.isShowStakeMask.type === 'unStake' && this.currentFarmData.lpStaked > 0) {
						this.isConfirm = false
						if (baseToken) {
							this.stakedValue = Tools.maxToMin(baseToken, this.currentFarmData.lpStaked)
						}
					} else {
						this.isConfirm = true
					}
				}
			},
			deep: true
		}
	},
	computed: {
		MaskData() {
			return this.$store.state.isShowStakeMask
		}
	},
	async mounted() {
        this.client = await getClient(singleConfig);
		this.getLpBalance()
		this.farmData = this.$store.state.isShowStakeMask
		this.isStake = false
		if (this.$store.state.isShowStakeMask && this.$store.state.isShowStakeMask.data) {
			if (this.$store.state.isShowStakeMask.type === 'stake') {
				this.isStake = true
			}
			this.currentFarmData = this.$store.state.isShowStakeMask.data
			if (this.$store.state.isShowStakeMask.type === 'stake' && this.currentFarmData.lpBalance > 0) {
				this.isConfirm = false
			} else if (this.$store.state.isShowStakeMask.type === 'unStake' && this.currentFarmData.lpStaked > 0) {
				this.isConfirm = false
			} else {
				this.isConfirm = true
			}
		}
	},
	methods: {
		formatLpBalanceNumber(number){
			return Tools.formatDecimalPartToLong(Tools.formatBigNumber(number))
		},
		closeStakeOrUnStakeMask() {
			this.$store.commit('isShowStakeMask', false)
			this.inputValue = ''
		},
		async getLpBalance() {
			if (this.$store.state.address) {
				return queryBankAllBalances(this.client, this.$store.state.address).then(res => {
					let tokenAllBalanceMap = new Map()
					if (res && res.balancesList) {
						res.balancesList.forEach(item => {
							tokenAllBalanceMap.set(item.denom, item)
						})
					}
					if (this.$store.state.isShowStakeMask && this.$store.state.isShowStakeMask.data) {
						let lpDenom = ''

						const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
						const configMap = new Map()
						if (config && config?.length) {
							config.forEach(item => {
								configMap.set(item.denom, item)
							})
						}
						if (configMap?.size && this.$store.state.isShowStakeMask.data.code) {
							if (configMap.has(this.$store.state.isShowStakeMask.data.code)) {
								lpDenom = configMap.get(this.$store.state.isShowStakeMask.data.code).lpt
							}
						}
						if (tokenAllBalanceMap.has(lpDenom)) {
							return tokenAllBalanceMap.get(lpDenom) && tokenAllBalanceMap.get(lpDenom).amount ? tokenAllBalanceMap.get(lpDenom).amount : ''
						} else {
							return 0
						}
					}
				})
			}
		},
		selectAll() {
			const baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
			if (this.isStake) {
				if (baseToken && this?.$store?.state?.isShowStakeMask?.data?.lpBalance) {
					this.inputValue = Tools.maxToMin(baseToken, this.$store.state.isShowStakeMask.data.lpBalance)
				} else {
					this.inputValue = ''
				}
			} else {
				if (baseToken && this?.$store?.state?.isShowStakeMask?.data?.lpStaked) {
					this.inputValue = Tools.maxToMin(baseToken, this.$store.state.isShowStakeMask.data.lpStaked)
				} else {
					this.inputValue = ''
				}
			}

		},
		async validatorBalance(type) {
			let isNextStep = true
			let feeAmount = JSON.parse(VUE_APP_FEE)?.amount || ''
			if (this.$store.state.address) {
				let currentAccountAmount;
				const currentAddressBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
				if (currentAddressBalance?.address === this.$store.state.address && currentAddressBalance?.balances?.balancesList) {
					currentAddressBalance?.balances?.balancesList.forEach(item => {
						if (item.denom === irisTxDenom) {
							currentAccountAmount = item.amount
						}
					})
				}
				if(currentAccountAmount === undefined){
					currentAccountAmount = await queryBankBalance(this.$store.state.address, irisTxDenom)
				}
				let userSendTxMinFee = currentAccountAmount
				let needMinFee = 0

				if (currentAccountAmount >= 0 && feeAmount) {
					if (type === 'stake') {
						needMinFee = feeAmount
					} else if (type === 'unStake') {
						needMinFee = Tools.bigNumberAdd(irisAmount, feeAmount)
					}
				}
				if (Number(userSendTxMinFee) < Number(needMinFee)) {
					isNextStep = false
				}

			} else {
				isNextStep = false
			}
			return isNextStep
		},

		async sendTx() {
			let address = this.$store.state.address

			let unableNext = await this.validatorBalance(this.$store.state.isShowStakeMask.type)
			if (!unableNext) {
				const notifyData = JSON.parse(JSON.stringify(insufficientFee))
				this.$store.commit('transactionResult',notifyData)
				return
			}
			let id = this.$store.state.isShowStakeMask.data.id
			let sendTxDenom = this.$store.state.isShowStakeMask.data.code
			let lptDenom = ''
			const config = localStorage.getItem('unstakeConfig') ? JSON.parse(localStorage.getItem('unstakeConfig')) : null
			const configMap = new Map()
			if (config && config?.length) {
				config.forEach(item => {
					configMap.set(item.denom, item)
				})
			}
			if (configMap?.size && configMap.has(sendTxDenom)) {
				lptDenom = configMap.get(sendTxDenom).lpt
			}
			let currentLpBalance,currentBalanceMap = new Map();
			const currentAddressBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
			if (currentAddressBalance?.address === this.$store.state.address && currentAddressBalance?.balances?.balancesList) {
				currentAddressBalance?.balances?.balancesList.forEach(item => {
					if(item.denom){
						currentBalanceMap.set(item.denom,item.amount)
					}
				})
			}
			if(currentBalanceMap?.size && currentBalanceMap.has(lptDenom)){
				currentLpBalance = currentBalanceMap.get(lptDenom)
			}
			if(currentLpBalance === undefined){
				currentLpBalance = await this.getLpBalance()
			}

			const baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
			let txAmount = Tools.minToMax(baseToken, this.inputValue)
			let flCurrentLpBalance = Tools.maxToMin(baseToken, currentLpBalance)
			this.isConfirm = false
			if (this.$store.state.isShowStakeMask.type === 'stake') {
				if (Number(this.inputValue) > Number(flCurrentLpBalance)) {
					this.$message({
						message: 'Insufficient Balance',
						type: 'error',
						offset: 50
					});
					this.isConfirm = false
					return
				}
			} else {
				if (this.$store.state.isShowStakeMask?.data?.lpStaked) {
					if (Number(txAmount) > Number(this.$store.state.isShowStakeMask?.data?.lpStaked)) {
						this.$message({
							message: 'Insufficient Balance',
							type: 'error',
							offset: 50
						});
						this.isConfirm = false
						return
					}
				} else {
					return
				}
			}
			if (this.inputValue > 0 && id) {
				this.$store.commit('isShowStakeMask', false)
				this.$store.commit('isShowHarvestWaitingMask', true)
				this.inputValue = ''
				let msg = {
					from: this.$store.state.address,
					amount: {
						amount: txAmount,
						denom: lptDenom ,
					},
					poolId: id
				}

				if (this.isStake) {
					buildFarmStake(this.client, chainId, msg).then(signTxStr => {
						if (signTxStr?.code) {
							this.$store.commit('isShowHarvestWaitingMask', false)
							this.$store.commit('isBroadcastTxError', true)
							return
						}
						this.broadcastStakeorUnStakeTx(signTxStr)
					}).catch(error => {
						console.log(error)
					})
				} else {
					buildFarmUnStake(this.client, chainId, msg).then(signTxStr => {
						if (signTxStr?.code) {
							this.$store.commit('isShowHarvestWaitingMask', false)
							this.$store.commit('isBroadcastTxError', true)
							return
						}
						this.broadcastStakeorUnStakeTx(signTxStr)
					}).catch(error => {
						console.log(error)
					})
				}
			}
		},
		sendUnSignTxStrToWallet(res) {
			const config = JSON.parse(localStorage.getItem('walletconnect')) || null
			if (res) {
				const txData = {
					id: 1,
					jsonrpc: "2.0",
					method: "call_request",
					params: {
						chainId: 566,
						request: {
							method: "tx_sign",
							params: [
								{
									fee: [fee],
									unsignTxStr: res
								}
							]
						}
					}
				}
				if (config) {
					let connector = new WalletConnect(config)
					connector.sendCustomRequest(txData).then(signedTxStr => {
						if (signedTxStr) {
							this.broadcastStakeorUnStakeTx(signedTxStr)
						} else {
							this.$store.commit('isShowHarvestWaitingMask', false)
						}
					}).catch(e => {
						this.$store.commit('isShowHarvestWaitingMask', false)
						console.log(e, "wallet connect error")
					})
				}
			}
		},
		broadcastStakeorUnStakeTx(signTxStr) {
			broadcastTx(this.client, signTxStr).then(res => {
				if (res?.hash) {
					this.$store.commit('isShowHarvestWaitingMask', false)
					showBroadcasting(BROADCASTING);
				} else {
					this.$store.commit('isShowHarvestWaitingMask', false)
					this.$store.commit('isBroadcastTxError', true)
				}
			}).catch(e => {
				console.log(e, 'broadcast tx error')
				this.$store.commit('isShowHarvestWaitingMask', false)
				this.$store.commit('isBroadcastTxError', true)
			})
		}
	}
}
</script>

<style scoped lang="scss">
.farm_stake_container {
	width: 100%;
	height: 100%;
	background: var(--markBgColor);
	position: fixed;
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;

	.farm_stake_content_wrap {
		width: 4.44rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		padding: var(--boxPadding24);
		@media (max-width: 460px) {
			width: auto;
			margin: 0 0.16rem;
		}

		.farm_stake_title_content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 0.15rem;

			.farm_stake_content {
				@media (max-width: 375px) {
					display: flex;
					flex-direction: column;
				}

				.farm_stake_label {
					font-size: var(--fontSize20);
					line-height: var(--lineheight32);
					color: var(--fontColorBlack);
				}

				.farm_stale_value {
					margin-left: 0.1rem;
					font-size: var(--fontSize16);
					color: var(--fontColorBlack3);
					line-height: var(--lineHeight32);
					@media (max-width: 375px) {
						margin-left: 0;
					}
				}
			}

			.farm_close_icon {
				width: 0.16rem;
				height: 0.16rem;
				cursor: pointer;
			}
		}

		.farm_input_content {
			display: flex;
			background: var(--btnColor008);
			box-sizing: border-box;
			border-radius: var(--borderRadius8);
			align-items: center;
			padding: 0 0.16rem;

			.farm_input {
				margin-right: 0.2rem;
				display: flex;
				align-items: center;
				padding: 0.16rem 0;

				:deep(.el-input__inner) {
					border: none;
					background: transparent;
					line-height: 1;
					font-size: var(--fontSize20);
					color: var(--hoverColor);

				}
			}

			.max_button {
				border-radius: var(--borderRadius8);
				background: var(--btnColor);
				font-size: var(--fontSize16);
				line-height: var(--lineHeight20);
				padding: 0.06rem 0.08rem;
				border: none;
				font-weight: var(--fontWt400);
			}
		}

		.farm_staked_label_container {
			margin-top: 0.08rem;
			display: flex;
			justify-content: space-between;
			@media (max-width: 460px) {
				flex-direction: column;
			}

			.farm_staked_label_content {
				.farm_staked_label {
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
					color: var(--fontColorBlack65);
				}

				.farm_staked_tooltip {
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
					color: var(--fontColorBlack3);
				}

				@media (max-width: 460px) {
					text-align: right;
				}
			}

			.farm_staked_value {
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
				@media (max-width: 460px) {
					text-align: right;
					margin-top: 0.04rem;
				}
			}
		}

		.farm_staked_confirm_content {
			margin-top: 0.16rem;

			.farm_staked_confirm_button {
				width: 100%;
				border-radius: var(--borderRadius8);
				background: var(--hoverColor);
				border: none;
				font-size: var(--fontSize16);
				line-height: var(--lineHeight20);
				cursor: pointer !important;
				padding: 0.1rem 0.2rem;
				font-weight: var(--fontWt400);
			}

			.is-disabled {
				background: var(--tooltipBoxBorderColor);
				cursor: default;
				border: none;
			}
		}
	}
}
</style>
