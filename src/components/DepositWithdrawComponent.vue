<template>
	<div class="deposit_withdraw_tip_box_container">
		<div class="deposit_withdraw_tip_box_content">
			<div class="deposit_withdraw_header_content">
				<div class="deposit_withdraw_label">
					<span v-if="tipBoxConfig.type === 'deposit'">Deposit</span>
					<span v-if="tipBoxConfig.type === 'withdraw'">Withdraw</span>
					<span class="token_label">{{ getDenomByDepositOrWithdraw(tipBoxConfig) }}</span>
				</div>
				<div class="close_icon iconfont icon-guanbi" @click="closeTipBox()"></div>
			</div>
			<p class="deposit_withdraw_ibc_transfer_label">IBC Transfer</p>
			<div class="transfer_from_to_container">
				<div class="transfer_from_container">
					<p class="transfer_from_label_content">
						<span class="transfer_from_label">From</span>
						<span class="transfer_from_chain">{{ tipBoxConfig.fromChain }}</span>
					</p>
					<div class="transfer_address_content">
						<p class="transfer_address">
							{{ $store.state.isConnected ? fromAddress : '--' }}
						</p>
					</div>
				</div>
				<div class="transfer_arrow_icon_content">
					<iconfont-component icon-name="icon-jiantou1"></iconfont-component>
				</div>
				<div class="transfer_to_container">
					<p class="transfer_to_label_content">
						<span class="transfer_to_label">To</span>
						<span class="transfer_to_chain">{{ tipBoxConfig.toChain }}</span>
					</p>
					<div class="transfer_address_content">
						<p class="transfer_address">{{ $store.state.isConnected ? toAddress : '--' }}</p>
					</div>
				</div>
			</div>
			<div class="transfer_balance_content">
				<span class="transfer_balance_label">Balance</span>
				<span
					class="transfer_balance">{{
						$store.state.isConnected ? balance ? `${Tools.formatBigNumber(balance)}` : '0' : '0'
					}} {{ getDenomByDepositOrWithdraw(tipBoxConfig) }}</span>
			</div>
			<div class="transfer_balance_input_content">
				<el-input class="transfer_balance_input"
				          v-model="inputValue"
				          v-iptOnlyNum
				          placeholder="0.0000"
				          type="text"></el-input>
				<el-button v-if="balance" class="max_button" type="primary" @click="selectAll">Max</el-button>
			</div>
			<div class="button_container">
				<wallet-connect-content v-if="!$store.state.isConnected"></wallet-connect-content>
				<el-button
					v-else-if="tipBoxConfig.type === 'deposit'"
					class="confirm_button"
					type="primary"
					:disabled="isDisabled"
					@click="depositToken()">
					Deposit
				</el-button>
				<el-button
					v-else-if="tipBoxConfig.type === 'withdraw'"
					class="confirm_button"
					type="primary"
					:disabled="isDisabled"
					@click="withdrawToken()">
					Withdraw
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "./IconfontComponent";
import WalletConnectContent from "../navigation/components/WalletConnectContent";
import {chainConfig} from "../constant/chainConfig";
import Tools from "../util/utils";
import {getClient, broadcastTx, depositIbcTransferByClient, queryBankAllBalances} from "../util/sdkHelper";
import {showBroadcasting} from "../util/notifyPopUp";
import {BROADCASTING} from "../constant";
import BigNumber from "bignumber.js";
const {VUE_APP_FEE} = process.env
export default {
	name: "DepositWithdrawComponent",
	components: {WalletConnectContent, IconfontComponent},
	data() {
		return {
			Tools,
			inputValue: '',
			tipBoxConfig: {},
			fromAddress: '',
			toAddress: '',
			chainConfigMap: new Map(),
			balance: '',
			chainBalance: '0',
			client: null,
			notFormatBalance: 0,
			depositBalance:0,
		}
	},
	watch: {
		'$store.state.depositWithdrawConfig': {
			handler(newValue, oldValue) {
				if (newValue) {
					this.balance = ''
					this.tipBoxConfig = newValue;
					this.getAddressInfoByKeplr(newValue)
				}
			},
			deep: true
		},
		inputValue(){
			if(this.inputValue){
				this.inputValue = this.inputValue.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
			}
			const currentChoiceTokenConfig = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
			let currentChoiceTokenConfigMap = new Map()
			if(currentChoiceTokenConfig?.length){
				currentChoiceTokenConfig.forEach( item => {
					if(item.denom){
						currentChoiceTokenConfigMap.set(item.denom,item.scale)
					}
				})
			}
			let scale = ''
			if(this.tipBoxConfig?.denom && currentChoiceTokenConfigMap.has(this.tipBoxConfig.denom)){
				scale = currentChoiceTokenConfigMap.get(this.tipBoxConfig.denom)
			}
			let minInput = null
			if(scale){
				minInput = Tools.formatDecimal(Tools.maxToMin(this.tipBoxConfig, 1), Number(scale) || 0)
			}
			let intInputValue = new BigNumber(Tools.minToMax(this.tipBoxConfig,this.inputValue))
			let intNotFormatBalanceValue = new BigNumber(Tools.minToMax(this.tipBoxConfig,this.notFormatBalance))
			if (intInputValue.gte(intNotFormatBalanceValue)) {
				this.inputValue = this.notFormatBalance
			} else if(this.inputValue.toString().includes('.')){
				const decimalPart = this.inputValue.toString().split('.')[1]
				const integerPart =  this.inputValue.toString().split('.')[0]
				if(decimalPart.length > this.tipBoxConfig.scale){
					this.inputValue = `${integerPart}.${decimalPart.substring(0,this.tipBoxConfig.scale)}`
				}
			}
		}
	},
	computed: {
		isDisabled() {
			if (this.$store.state.isConnected) {
				if (this.inputValue && Number(this.notFormatBalance) < Number(this.inputValue)) {
					return true
				}
				return false
			}
		}
	},
	mounted() {
		this.balance = ''
		if (chainConfig?.length) {
			chainConfig.forEach(item => {
				this.chainConfigMap.set(item.chainId, item)
			})
		}
	},
	methods: {
		async getAddressInfoByKeplr(chainInfo) {
			if (window.keplr) {
				const fromAddress = await window.keplr.getKey(chainInfo.fromChainId)
				const toAddress = await window.keplr.getKey(chainInfo.toChainId)
				this.fromAddress = fromAddress.bech32Address
				this.toAddress = toAddress.bech32Address
				let balanceObj = null
				if (this.chainConfigMap.has(chainInfo.fromChainId)) {
					balanceObj = await this.getChoiceChainBalance(this.chainConfigMap.get(chainInfo.fromChainId))
					this.depositBalance = balanceObj
				}
				let balance = 0;
				if (balanceObj?.balancesList?.length) {
					balanceObj.balancesList.forEach(item => {
						if (this.tipBoxConfig.type === 'deposit') {
							if (item.denom === chainInfo?.ibcTransferInfos[0].deposit_info[0]?.denom) {
								this.chainBalance = item.denom
								balance = Tools.maxToMin(chainInfo, item.amount)
								this.notFormatBalance = balance
								balance = Tools.formatDecimalPartToLong(balance)
								this.balance =  balance
							}
						} else if (this.tipBoxConfig.type === 'withdraw') {
							if (item.denom === chainInfo?.denom) {
								this.chainBalance = item.denom
								balance = Tools.maxToMin(chainInfo, item.amount)
								balance = Tools.formatDecimalPartToLong(balance)

								this.notFormatBalance = balance
								this.balance = balance
							}
						}
					})
				}else if(balanceObj?.balancesList?.length === 0){
					this.balance = ''
				}else {
					this.balance =  '--'
				}

			}
		},
		formatBalance(balance) {
			let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
			if (baseToken) {
				return Tools.formatBigNumber(balance, baseToken.scale)
			} else {
				return balance
			}
		},
		async getChoiceChainBalance(config) {
			this.client = await getClient(config);
			const balance = await queryBankAllBalances(this.client, this.fromAddress)
			return balance
		},
		selectAll() {
			if (this.$store.state.isConnected) {
				let allNodeConfogMap = new Map()
				if(chainConfig?.length){
					chainConfig.forEach(item => {
						if(item.chainId){
							allNodeConfogMap.set(item.chainId,item)
						}
					})
				}
				let feeAmount = 0,feeDenom = ''
				if(allNodeConfogMap?.size && this.tipBoxConfig?.fromChainId && allNodeConfogMap.has(this.tipBoxConfig.fromChainId)){
					const choiceChainConfigFee = allNodeConfogMap.get(this.tipBoxConfig.fromChainId).fee;
					feeAmount = choiceChainConfigFee.amount
					feeDenom = choiceChainConfigFee.denom
					if(this.tipBoxConfig.type === 'deposit'){
						if(this.tipBoxConfig?.ibcTransferInfos.length
							&& this.tipBoxConfig.ibcTransferInfos[0]?.deposit_info?.length
							&& this.tipBoxConfig.ibcTransferInfos[0]?.deposit_info[0].denom
							&& this.tipBoxConfig.ibcTransferInfos[0]?.deposit_info[0].denom === feeDenom){
							const miniDenomBalance = Tools.minToMax(this.tipBoxConfig,this.notFormatBalance)
							const maxTokenAmount = Tools.bigNumberSubtract(miniDenomBalance,feeAmount)
							this.inputValue = Tools.maxToMin(this.tipBoxConfig,maxTokenAmount)
                            if(Number(this.inputValue) < 0) {
                                this.inputValue = ''
                            }
						}else {
							this.inputValue = this.notFormatBalance
						}
					}else if(this.tipBoxConfig.type === 'withdraw'){
						this.inputValue = this.notFormatBalance
					}

				}

			}
		},
		async depositToken() {
			const depositTxBaseTokenNumber = Tools.minToMax(this.tipBoxConfig, this.inputValue)
			if (Number(this.inputValue) <= 0 || Number(this.notFormatBalance) <= 0 || Number(this.inputValue) > Number(this.notFormatBalance)) {
				return
			}
			if(this.tipBoxConfig.ibcTransferInfos?.length){
				const depositBuildTxParams = {
					from: this.fromAddress,
					port: this.tipBoxConfig.ibcTransferInfos[0].deposit_info[0]?.port,
					channel: this.tipBoxConfig.ibcTransferInfos[0].deposit_info[0]?.channel,
					sender: this.fromAddress,
					receiver: this.toAddress,
					depositToken: {
						denom: this.tipBoxConfig.ibcTransferInfos[0].deposit_info[0]?.denom,
						amount: depositTxBaseTokenNumber
					},
					timeout_timestamp: new Date().getTime() * 1000000 + 30 * 60 * 1000 * 1000000

				}
                const transferNeedData = {
                    type: this.tipBoxConfig.type,
                    dstChainId: this.tipBoxConfig.toChainId, 
                    amount: Number(this.inputValue),
                    denom: this.getDenomByDepositOrWithdraw(this.tipBoxConfig)
                }
				const canBroadcastTxData = await depositIbcTransferByClient(this.client, this.tipBoxConfig.fromChainId, depositBuildTxParams).catch(error => {
                    this.$store.commit('isWaitingConfirmBox', false)
					console.log(error)
				})
				this.closeTipBox()
				this.$store.commit('isWaitingConfirmBox', true)
				const txHash = await broadcastTx(this.client, canBroadcastTxData, transferNeedData).catch(error => {
					this.$store.commit('isWaitingConfirmBox', false)
					console.error(error)
				})
				if (txHash?.hash) {
					this.$store.commit('isWaitingConfirmBox', false)
					showBroadcasting(BROADCASTING);
				} else {
					this.$store.commit('isShowHarvestWaitingMask', false)
					this.$store.commit('isBroadcastTxError', true)
				}
			}

		},
		async withdrawToken() {
			const depositTxBaseTokenNumber = Tools.minToMax(this.tipBoxConfig, this.inputValue)
			const baseToken = sessionStorage.getItem('baseToken') ? JSON.parse(sessionStorage.getItem('baseToken')) : null
			const farmLpBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
			let balanceMap = new Map()
			if(farmLpBalance?.balances?.balancesList){
				farmLpBalance?.balances?.balancesList.forEach( item => {
					if(item?.denom){
						balanceMap.set(item.denom,item.amount)
					}
				})
			}
			let currentCanUseBalance = 0
			if (baseToken && balanceMap?.size && balanceMap?.has(baseToken.denom)){
				currentCanUseBalance = balanceMap.get(baseToken.denom)
			}
      const feeAmount =  JSON.parse(VUE_APP_FEE)?.amount || ''
			if (Number(this.inputValue) <= 0 || Number(this.notFormatBalance) <= 0 || Number(currentCanUseBalance) < Number(feeAmount)) {
				return
			}
			if(this.tipBoxConfig?.ibcTransferInfos?.length){
				const depositBuildTxParams = {
					from: this.fromAddress,
					port: this.tipBoxConfig.ibcTransferInfos[0].withdraw_info?.port,
					channel: this.tipBoxConfig.ibcTransferInfos[0].withdraw_info?.channel,
					sender: this.fromAddress,
					receiver: this.toAddress,
					depositToken: {
						denom: this.tipBoxConfig?.denom,
						amount: depositTxBaseTokenNumber
					},
					timeout_timestamp: new Date().getTime() * 1000000 + 30 * 60 * 1000 * 1000000

				}
                const transferNeedData = {
                    type: this.tipBoxConfig.type,
                    dstChainId: this.tipBoxConfig.toChainId, 
                    amount: Number(this.inputValue),
                    denom: this.getDenomByDepositOrWithdraw(this.tipBoxConfig)
                }
				const canBroadcastTxData = await depositIbcTransferByClient(this.client, this.tipBoxConfig.fromChainId, depositBuildTxParams).catch(error => {
					this.$store.commit('isWaitingConfirmBox', false)
					console.log(error)
				})
				this.closeTipBox()
				this.$store.commit('isWaitingConfirmBox', true)
				const txHash = await broadcastTx(this.client, canBroadcastTxData, transferNeedData).catch(error => {
					this.$store.commit('isWaitingConfirmBox', false)
					console.error(error)
				})
				if (txHash?.hash) {
					this.$store.commit('isWaitingConfirmBox', false)
					showBroadcasting(BROADCASTING);
				} else {
					this.$store.commit('isWaitingConfirmBox', false)
					this.$store.commit('isBroadcastTxError', true)
				}
			}

		},
		closeTipBox() {
			this.inputValue = ''
			this.notFormatBalance = ''
			this.$store.commit('isShowDepositWithdrawTipBox', false)
		},
		getDenomByDepositOrWithdraw(txConfig) {

			return this.getSymbolByDenom(txConfig?.denom)

		},
		getSymbolByDenom(denom) {

			if (denom) {
				const configList = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null;
				let denomMap = new Map()
				if (configList?.length) {
					configList.forEach(item => {
						if (item.denom) {
							denomMap.set(item.denom, item)
						}
					})
				}
				if (denomMap.has(denom)) {
					return denomMap.get(denom).symbol.toUpperCase()
				}
				return denom.toUpperCase()
			}
		}
	}
}
</script>

<style scoped lang="scss">
.deposit_withdraw_tip_box_container {
	position: fixed;
	left: 0;
	top: 0;
	background: var(--markBgColor);
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;

	.deposit_withdraw_tip_box_content {
		width: 5.44rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		padding: var(--boxPadding24);
		@media (max-width: 586px) {
			width: 4.2rem;
			margin: 0 0.24rem;
		}
		.deposit_withdraw_header_content {
			display: flex;
			justify-content: space-between;

			.deposit_withdraw_label {
				font-size: 0.2rem;
				font-weight: normal;
				color: var(--fontColorBlack);
				line-height: 0.2rem;

				.token_label {
					font-size: 0.2rem;
					font-weight: normal;
					color: var(--btnColor);
					line-height: 0.2rem;
					margin-left: 0.08rem;
				}
			}

			.close_icon {
				color: var(--btnColor);
				cursor: pointer;
			}
		}

		.deposit_withdraw_ibc_transfer_label {
			margin-top: 0.24rem;
			font-size: 0.16rem;
			color: var(--fontColorBlack65);
			line-height: 0.16rem;
		}

		.transfer_from_to_container {
			display: flex;
			margin-top: 0.2rem;
			height: 0.96rem;
			@media (max-width: 586px) {
				flex-direction: column;
				height: auto;
			}
			.transfer_from_container {
				flex: 1;

				.transfer_from_label_content {
					.transfer_from_label {
						font-size: 0.14rem;
						color: var(--fontColorBlack);
						line-height: 0.14rem;
					}

					.transfer_from_chain {
						margin-left: 0.12rem;
						font-size: 0.14rem;
						font-weight: 600;
						color: var(--fontColorBlack);
						line-height: 0.14rem;
					}
				}

				.transfer_address_content {
					margin-top: 0.12rem;
					height: 0.66rem;
					box-sizing: border-box;
					padding: 0.12rem;
					border-radius: var(--borderRadius8);
					border: 0.01rem solid var(--tooltipBoxBorderColor);
					@media (max-width: 586px) {
						height:auto;
					}
					.transfer_address {
						width: 2rem;
						font-size: 0.14rem;
						color: var(--fontColorBlack65);
						line-height: 0.2rem;
						word-break: break-all;
						@media (max-width: 586px) {
							width: auto;
						}
					}
				}
			}

			.transfer_arrow_icon_content {
				width: 0.24rem;
				margin: 0.32rem 0.12rem 0 0.12rem;
				display: flex;
				align-items: center;
				@media (max-width: 586px) {
					height: 0.24rem;
					margin: 0.12rem auto;
					transform: rotate(90deg);
				}
			}

			.transfer_to_container {
				flex: 1;

				.transfer_to_label_content {
					.transfer_to_label {
						font-size: 0.14rem;
						color: var(--fontColorBlack);
						line-height: 0.14rem;
					}

					.transfer_to_chain {
						margin-left: 0.12rem;
						font-size: 0.14rem;
						font-weight: 600;
						color: var(--fontColorBlack);
						line-height: 0.14rem;
					}
				}

				.transfer_address_content {
					margin-top: 0.12rem;
					box-sizing: border-box;
					height: 0.66rem;
					padding: 0.12rem;
					border-radius: var(--borderRadius8);
					border: 0.01rem solid var(--tooltipBoxBorderColor);
					@media (max-width: 586px) {
						height:auto;
					}
					.transfer_address {
						width: 2rem;
						font-size: 0.14rem;
						color: var(--fontColorBlack65);
						line-height: 0.2rem;
						word-break: break-all;
						@media (max-width: 586px) {
							width: auto;
						}
					}
				}
			}
		}

		.transfer_balance_content {
			display: flex;
			justify-content: space-between;
			margin-top: 0.2rem;

			.transfer_balance_label {
				font-size: 0.13rem;
				color: var(--fontColorBlack65);
				line-height: 0.2rem;
			}

			.transfer_balance {
				font-size: 0.14rem;
				color: var(--fontColorBlack3);
				line-height: 0.2rem;
			}
		}

		.transfer_balance_input_content {
			margin-top: 0.08rem;
			display: flex;
			background: var(--btnColor008);
			box-sizing: border-box;
			border-radius: var(--borderRadius8);
			align-items: center;
			padding: 0 0.16rem;

			.transfer_balance_input {
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

		.button_container {
			margin-top: 0.16rem;

			.confirm_button {
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