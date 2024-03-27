<template>
	<div class="confirm_tx_container">
		<div class="confirm_tx_content_wrap">
			<div class="confirm_tx_title_content">
				<span class="confirm_tx_title">{{$t('addLiquidityConfirm.title')}}</span>
				<span class="confirm_tx_icon_closed" @click.stop="closeConfirmBox">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</span>
			</div>
			<div class="confirm_tx_content">
				<div class="confirm_tx_content_number">
					<span>{{this.liquidityAmount}}</span>
					<div>
						<img :src="require('@/assets/img/logo/iris_logo.png')" />
						<img :src="tokenImg || require('@/assets/img/logo/bnb_logo.png')" />
					</div>
				</div>
				<p class="confirm_tx_content_token">{{standardDenom}} / {{tokenDenom}} {{$t("pool.addLiquidityConfirm.poolTokens")}}</p>
				<!-- <p class="confirm_tx_content_detail">{{$t("pool.addLiquidityConfirm.copywriting")}}</p> -->
			</div>
			<ul class="confirm_tx_detail_content">
				<li>
					<span>{{standardDenom}} {{$t("pool.addLiquidityConfirm.deposited")}}</span>
					<div>
						<span>{{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(standardAmount,decimalNum)))}}</span>
						<img :src="require('@/assets/img/logo/iris_logo.png')" />
					</div>
				</li>
				<li>
					<span>{{tokenDenom}} {{$t("pool.addLiquidityConfirm.deposited")}}</span>
					<div>
						<span>{{Tools.formatDecimalPartToLong(tokenAmount)}}</span>
						<img :src="tokenImg || require('@/assets/img/logo/bnb_logo.png')" />
					</div>
				</li>
				<li>
					<span>{{$t("pool.addLiquidityConfirm.rates")}}</span>
					<div class="rates">
						<span>1 {{standardDenom}} / {{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(standardRatio,Number(tokenDecimalNum))))}} {{tokenDenom}}</span>
						<span>1 {{tokenDenom}} / {{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(tokenRatio,decimalNum)))}} {{standardDenom}}</span>
					</div>
				</li>
				<li>
					<span>{{$t("pool.addLiquidityConfirm.shareOfPool")}}</span>
					<div>
						<span>{{liquidityPercentageDetail}}</span>
					</div>
				</li>
			</ul>

			<div class="confirm_button_content" @click.stop="isAbleClick && sendTx()">
				<confirm-button :class="!isAbleClick ? 'forbid':''" :text='$t("pool.addLiquidityConfirm.button")' />
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "./IconfontComponent";
	import ConfirmButton from "./ConfirmButton";
	import {getClient, singleConfig, addLiquidityUnsignedTX, broadcastTx, queryBankBalance} from "../util/sdkHelper";
	import Tools from "@/util/utils";
	import { decimalNum,fee } from "@/constant";
	import {chainId, KEPLR_WALLET, WALLET_CONNECT_WALLET, BROADCASTING, irisTxDenom, insufficientFee} from "../constant";
    import {showBroadcasting} from '../util/notifyPopUp';

    const {VUE_APP_FEE} = process.env
	export default {
		name: "ConfirmTxComponent",
		components: {ConfirmButton, IconfontComponent},
		data() {
			return  {
                client: null,
				Tools,
				decimalNum,
				txDetail: this.$store.state.addLiquidityTxDetail,
			}
		},
		methods:{
			closeConfirmBox(){
				this.$store.commit('isShowAddLiquidityConfirmTxBox',false)
			},
			async broadcastTx(signTxData){
				try {
					const res = await broadcastTx(this.client, signTxData)
					if(res && res.hash){
						
						this.$store.commit('isWaitingConfirmBox',false)
						showBroadcasting(BROADCASTING);
						this.$store.commit('isWaitPending',true)
						this.$router.push('pool');

					}else {
						this.$store.commit('isWaitingConfirmBox',false)
						this.$store.commit('isBroadcastTxError', true)
					}
				} catch(e) {
					console.log(e,'error');
					this.$store.commit('isWaitingConfirmBox',false)
					this.$store.commit('isBroadcastTxError', true)
				}
			},
			async sendTx(){
				let feeAmount =  JSON.parse(VUE_APP_FEE)?.amount || ''
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
				const maxTokenDetail = (tokenList || []).filter(token => token.symbol.toUpperCase() == this.tokenDenom);
				const standardDetail = (tokenList || []).filter(token => token.symbol.toUpperCase() == this.standardDenom);
				const exactStandardAmt = Tools.minToMax(standardDetail[0],this.standardAmount);
				const sender = this.$store.state.address;
				const maxTokenAmount = Tools.formatInt(Tools.minToMax(maxTokenDetail[0],this.tokenAmount));
				const params = {
					max_token: {
						denom: maxTokenDetail[0].denom,
						amount: maxTokenAmount
					},
					exact_standard_amt: Tools.formatInt(exactStandardAmt),
					min_liquidity: Math.floor(this.liquidityAmount).toString(),
					deadline: Math.floor(new Date().getTime()/1000) + 1200,
					sender
				};
				const currentConnectWallet = KEPLR_WALLET
				if(currentConnectWallet && currentConnectWallet === KEPLR_WALLET){
					this.$store.commit('isShowAddLiquidityConfirmTxBox',false)
					this.$store.commit('isWaitingConfirmBox',true)
				}
				addLiquidityUnsignedTX(this.client, chainId, params).then( result => {
					if(result?.code){
						this.$store.commit('isWaitingConfirmBox', false)
						this.$store.commit('isBroadcastTxError', true)
						return;
					}
					if(result && fee){
                        if(currentConnectWallet && currentConnectWallet === KEPLR_WALLET){
                            this.broadcastTx(result)
                            return
                        }
                        if(currentConnectWallet && currentConnectWallet === WALLET_CONNECT_WALLET){
                            let txData = {
                                id:1,
                                jsonrpc: "2.0",
                                method:"call_request",
                                params:{
                                    chainId: 566,
                                    request:{
                                        method:"tx_sign",
                                        params:[
                                            {
                                                fee:[fee],
                                                unsignTxStr:result
                                            }
                                        ]
                                    }
                                }
                            }
                            this.$store.commit('isShowAddLiquidityConfirmTxBox',false)
                            this.$store.commit('isWaitingConfirmBox',true)
                            const config =  JSON.parse(localStorage.getItem("walletconnect")) || null;
                            if(config) {
                                const connector = new Walletconnect(config);
                                connector.sendCustomRequest(txData).then(signTxData => {
                                    if(signTxData){
                                        this.$store.commit('isWaitingConfirmBox',false)
                                        this.$store.commit('isWaitPending',true)
                                        this.broadcastTx(signTxData)
                                    }
                                }).catch(e => {
                                    this.$store.commit('isWaitingConfirmBox',false)
                                })
                            }
                        }
					}
				})
			},

		},
		computed:{
			tokenDecimalNum() {
				return this.txDetail.tokenDecimalNum
			},
			liquidityAmount() {
				let copyLiquidityAmount = JSON.parse(JSON.stringify(this.txDetail.liquidityAmount))
				let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
				return Tools.formatDecimal(Tools.maxToMin(baseToken,copyLiquidityAmount),baseToken.scale)
			},
			isAbleClickLiquidity(){
				return this.txDetail.liquidityAmount
			},
			standardAmount() {
				return this.txDetail.standardAmount
			},
			tokenAmount() {
				return this.txDetail.tokenAmount
			},
			tokenRatio() {
				return this.txDetail.tokenRatio
			},
			standardRatio() {
				return this.txDetail.standardRatio
			},
			liquidityPercentageDetail() {
				return this.txDetail.liquidityPercentageDetail
			},
			tokenImg() {
				return this.txDetail.tokenImg
			},
			tokenDenom() {
				return this.txDetail.tokenDenom
			},
			standardDenom() {
				return this.txDetail.standardDenom
			},
			isAbleClick() {
				return Math.floor(this.isAbleClickLiquidity) != 0
			}
		},
        async mounted() {
            this.client = await getClient(singleConfig);
        },
		destroyed () {
			this.$store.commit('addLiquidityTxDetail',{})
		}
	}
</script>

<style scoped lang="scss">
	.confirm_tx_container{
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.3);
		position: fixed;
		left: 0;
		top:0;
		z-index: 110;
		display: flex;
		align-items: center;
		justify-content: center;
		// padding-top: 1.19rem;
		.confirm_tx_content_wrap{
			width: 4.24rem;
			background: var(--bgWhiteColor);
			border-radius: var(--borderRadius8);
			box-sizing: border-box;
			padding:var(--boxPadding24);
			@media (max-width: 460px) {
				width: 100%;
				margin: 0 0.16rem;
			}
			.confirm_tx_title_content{
				display: flex;
				justify-content: space-between;
				align-items: center;
				.confirm_tx_title{
					font-size: var(--fontSize20);
					line-height: var(--lineHeight32);
					font-weight: var(--fontWt600);
					color:var(--fontColorBlack);
				}
				.confirm_tx_icon_closed{
					width: 0.2rem;
					height: 0.2rem;
					cursor: pointer;
				}
			}
			.confirm_tx_content {
				padding: 0.16rem 0 0.16rem 0;
				border-bottom: 1px solid var(--borderConfirmColor) ;
				.confirm_tx_content_number {
					display: flex;
					span {
						font-size: var(--fontSize28);
						color: var(--confirmColor);
						font-weight: bold;
					}
					div {
						display: flex;
						justify-content: center;
						align-items: center;
						img {
							width: 0.24rem;
							height: 0.24rem;
							&:nth-child(1) {
								margin: 0 0.04rem 0 0.08rem;
							}
						}
					}
				}
				.confirm_tx_content_token {
					padding: 0.08rem 0 0.16rem 0;
					font-size: var(--fontSize16);
					color: var(--fontColorBlack65);
				}
				.confirm_tx_content_detail {
					font-size: var(--fontSize14);
					line-height: 0.2rem;
					// font-family: ArialMT;
				}
			}
			.confirm_tx_detail_content {
				padding: 0.15rem 0 0.16rem -0;
				li {
					display: flex;
					justify-content: space-between;
					@media (max-width: 375px) {
						flex-direction: column;
					}
					span:nth-child(1) {
						font-size: var(--fontSize14);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
					}
					div {
						display: flex;
						justify-content:center;
						@media (max-width: 375px) {
							justify-content: flex-start;
						}
						span {
							font-size: var(--fontSize14);
							font-weight: bold;
							color: var(--poolTokenColor) !important;
						}
						img {
							width: 0.2rem;
							height: 0.2rem;
							margin-left: 0.08rem;
						}
					}
					.rates {
						display: flex;
						flex-direction: column;
						align-items: flex-end;
						@media (max-width: 375px) {
							align-items: flex-start;
						}
						span:nth-child(1) {
							margin-bottom: 0.08rem;
						}
					}
					&:not(:last-child) {
						margin-bottom: 0.08rem;
					}
				}
			}
			.confirm_button_content {
				cursor: pointer;
			}
			.forbid {
				background-color: var(--btnForbidColor);
				cursor: default;
				:deep( .confirm_button_label ){
					cursor: default !important;
				}
			}
		}
	}
</style>
