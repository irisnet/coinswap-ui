<template>
	<div class="confirm_tx_container">
		<div class="confirm_tx_content_wrap">
			<div class="confirm_tx_title_content">
				<span class="confirm_tx_title">{{ $t('pool.remove.confirm.title') }}</span>
				<span class="confirm_tx_icon_closed" @click.stop="closeConfirmBox">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</span>
			</div>
			<div class="confirm_tx_from_content">
				<div class="confirm_tx_form_left">
					<img class="confirm_from_tx_img_content"
					     :src="removeConfirmData.standardImg || require('@/assets/img/logo/iris_logo.png')" alt="">

					<span
						class="confirm_tx_form_value">{{
							Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(removeConfirmData.standardAmount, removeConfirmData.standardDecimalNum)))
						}}</span>
				</div>
				<span class="confirm_label_content">{{ removeConfirmData.standardDenom || '--' }}</span>
			</div>
			<p class="confirm_add_icon">
				<iconfont-component icon-name="icon-jia"></iconfont-component>
			</p>
			<div class="confirm_tx_to_content">
				<div class="confirm_tx_to_left">
					<img class="confirm_to_tx_img_content"
					     :src="removeConfirmData.tokenImg || ''" alt="">
					<span
						class="confirm_tx_from_value">{{
							Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(removeConfirmData.tokenAmount, removeConfirmData.tokenDecimalNum)))
						}}</span>
				</div>
				<span class="confirm_label_content">{{ removeConfirmData.tokenDenom || '--' }}</span>
			</div>
			<!-- <p class="confirm_tx_tooltip_content">{{$t('pool.remove.confirm.textTooltip')}}</p> -->
			<div class="confirm_tx_price_content">
				<span class="confirm_tx_price_label">{{ $t('pool.remove.price') }}</span>
				<div>
                    <span
	                    class="confirm_tx_price_content_text">{{ removeConfirmData.standardDenom !== '--' ? 1 : "--" }} {{
		                    removeConfirmData.standardDenom || '--'
	                    }} / {{
		                    Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(removeConfirmData.tokenRatio, removeConfirmData.tokenDecimalNum))) || '--'
	                    }} {{ removeConfirmData.tokenDenom || '--' }}</span>
					<span class="confirm_tx_price_content_text">{{ removeConfirmData.tokenDenom !== '--' ? 1 : "--" }} {{
							removeConfirmData.tokenDenom || '--'
						}} / {{
							Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(removeConfirmData.standardRatio, removeConfirmData.standardDecimalNum)))
						}} {{ removeConfirmData.standardDenom || '--' }}</span>
				</div>
			</div>
			<div class="confirm_button_content" @click.stop="sendTx()">
				<confirm-button/>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "./IconfontComponent";
import ConfirmButton from "./ConfirmButton";
import {getClient, singleConfig, RemoveLiquidityUnsignedTX, broadcastTx, queryBankBalance} from "../util/sdkHelper";
import Tools from '@/util/utils';
import {decimalNum, fee, chainId} from "@/constant";
import {KEPLR_WALLET, WALLET_CONNECT_WALLET, BROADCASTING, irisTxDenom, insufficientFee} from "../constant";
import {showBroadcasting} from "../util/notifyPopUp";
const {VUE_APP_FEE} = process.env
export default {
	name: "ConfirmTxComponent",
	components: {ConfirmButton, IconfontComponent},
	data() {
		return {
            client: null,
			Tools,
			decimalNum,
			removeConfirmData: this.$store.state.removeConfirmData,
		}
	},
	methods: {
		closeConfirmBox() {
			this.$store.commit('isShowConfirmTxBox', false)
		},
		async broadcastTx(signTxData) {
			try {
				const res = await broadcastTx(this.client, signTxData)
				if (res && res.hash) {
					this.$store.commit('isWaitingConfirmBox', false)
					showBroadcasting(BROADCASTING);
					setTimeout(() => {
						this.$store.commit('isWaitPending', true)
						this.$router.push('pool');
					}, 2000)

				} else {
					console.log(res, 'error')
					this.$store.commit('isWaitingConfirmBox', false)
					this.$store.commit('isBroadcastTxError', true)
				}
			} catch (e) {
				console.log(e, 'error');
				this.$store.commit('isWaitingConfirmBox', false)
			}
		},
		async sendTx() {
			let feeAmount = JSON.parse(VUE_APP_FEE)?.amount || ''
			let currentAccountAmount = null
			let balance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
			if (balance?.balances?.balancesList?.length) {
				balance.balances.balancesList.forEach(item => {
					if (item?.denom === irisTxDenom) {
						currentAccountAmount = {balance: item}
					}
				})
			} else {
				currentAccountAmount = await queryBankBalance(this.$store.state.address, irisTxDenom)
			}
			if (Number(currentAccountAmount?.balance?.amount) < Number(feeAmount)) {
				const notifyData = JSON.parse(JSON.stringify(insufficientFee))
				this.$store.commit('transactionResult', notifyData)
				return
			}
			const tokenList = this.$store.state.tokenList;
			const minTokenDetail = (tokenList || []).filter(token => token.symbol.toUpperCase() == this.removeConfirmData.tokenDenom);
			const standardDetail = (tokenList || []).filter(token => token.symbol.toUpperCase() == this.removeConfirmData.standardDenom);
			const min_token = Tools.minToMax(minTokenDetail[0], this.removeConfirmData.tokenAmount);
			const min_standard_amt = Tools.minToMax(standardDetail[0], this.removeConfirmData.standardAmount);
			const sender = this.$store.state.address;
			const params = {
				withdraw_liquidity: this.removeConfirmData.sellLiquidity,
				min_token: Tools.formatInt(min_token),
				min_standard_amt: Tools.formatInt(min_standard_amt),
				deadline: Math.floor(new Date().getTime() / 1000) + 1200,
				sender
			};
			const currentConnectWallet = KEPLR_WALLET
			if (currentConnectWallet && currentConnectWallet === KEPLR_WALLET) {
				this.$store.commit('isShowConfirmTxBox', false)
				this.$store.commit('isWaitingConfirmBox', true)
			}
			RemoveLiquidityUnsignedTX(this.client, chainId, params).then(result => {
				if (result?.code) {
					this.$store.commit('isWaitingConfirmBox', false)
					this.$store.commit('isBroadcastTxError', true)
					return;
				}
				if (result && fee) {
					if (currentConnectWallet && currentConnectWallet === KEPLR_WALLET) {
						this.broadcastTx(result)
						return
					}
					if (currentConnectWallet && currentConnectWallet === WALLET_CONNECT_WALLET) {
						let txData = {
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
											unsignTxStr: result
										}
									]
								}
							}
						}
						this.$store.commit('isShowConfirmTxBox', false)
						this.$store.commit('isWaitingConfirmBox', true)
						const config = JSON.parse(localStorage.getItem("walletconnect")) || null;
						if (config) {
							const connector = new Walletconnect(config);
							connector.sendCustomRequest(txData).then(signTxData => {
								if (signTxData) {
									this.$store.commit('isWaitingConfirmBox', false)
									this.$store.commit('isWaitPending', true)
									this.broadcastTx(signTxData)
								}
							}).catch(e => {
								console.log(e);
								this.$store.commit('isWaitingConfirmBox', false)
							})
						}
					}

				}
			})
		},
	},
    async mounted() {
        this.client = await getClient(singleConfig);
    },
	destroyed() {
		this.$store.commit('removeConfirmData', {})
	}
}
</script>

<style scoped lang="scss">
.confirm_tx_container {
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.3);
	position: fixed;
	left: 0;
	top: 0;
	z-index: 110;
	display: flex;
	align-items: center;
	justify-content: center;

	.confirm_tx_content_wrap {
		width: 4.24rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		padding: var(--boxPadding24);
		@media (max-width: 460px) {
			width: 100%;
			margin: 0 0.16rem;
		}

		.confirm_tx_title_content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 0.26rem;

			.confirm_tx_title {
				font-size: var(--fontSize20);
				line-height: var(--lineHeight32);
				font-weight: var(--fontWt600);
				color: var(--fontColorBlack);

			}

			.confirm_tx_icon_closed {
				width: 0.2rem;
				height: 0.2rem;
				cursor: pointer;
			}
		}

		.confirm_tx_from_content {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.confirm_tx_form_left {
				display: flex;
				align-items: center;

				.confirm_from_tx_img_content {
					width: 0.24rem;
					height: 0.24rem;
				}

				.confirm_tx_form_value {
					margin-left: 0.16rem;
					font-size: var(--fontSize20);
					color: var(--swapFontColorActive);
					font-weight: var(--fontWt600);
					line-height: var(--lineHeight20);
				}
			}

			.confirm_label_content {
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
				font-weight: var(--fontWt600);
			}
		}

		.confirm_add_icon {
			width: 0.16rem;
			height: 0.16rem;
			margin: 0.16rem 0 0.16rem 0.04rem;
		}

		.confirm_tx_to_content {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 0.16rem;

			.confirm_tx_to_left {
				display: flex;
				align-items: center;

				.confirm_to_tx_img_content {
					width: 0.24rem;
					height: 0.24rem;
				}

				.confirm_tx_from_value {
					margin-left: 0.16rem;
					font-size: var(--fontSize20);
					color: var(--swapFontColorActive);
					font-weight: var(--fontWt600);
					line-height: var(--lineHeight20);
				}
			}

			.confirm_label_content {
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
				font-weight: var(--fontWt600);
			}
		}

		.confirm_tx_tooltip_content {
			font-size: var(--fontSize14);
			color: var(--fontColorBlack65);
			line-height: var(--lineHeight20);
			margin-bottom: 0.16rem;
		}

		.confirm_tx_price_content {
			border-top: 0.01rem solid var(--lineColor);
			box-sizing: border-box;
			padding-top: 0.16rem;
			display: flex;
			justify-content: space-between;
			margin-bottom: 0.16rem;

			.confirm_tx_price_label {
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}

			div {
				display: flex;
				flex-direction: column;
				align-items: flex-end;

				.confirm_tx_price_content_text {
					font-size: var(--fontSize14);
					color: var(--btnColor);
					font-weight: bold;

					&:nth-child(1) {
						margin-bottom: 0.08rem;
					}
				}
			}
		}

		.confirm_button_content {
			cursor: pointer;
		}
	}
}
</style>
