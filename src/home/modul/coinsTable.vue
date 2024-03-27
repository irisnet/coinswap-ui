<template>
	<div class="table_list_content">
		<loading-component v-show="isloading"></loading-component>
		<el-table v-show="!isloading"
		          :data="tableList"
		          :default-sort="isConnectWallet ? {prop: 'displayBalance', order: 'descending'} : { prop: 'formatPrice', order: 'descending' }">
			<el-table-column v-for="(item,index) in columns"
			                 :key="item.label"
			                 :prop="item.value"
			                 :label="item.label"
			                 :width="item.width"
			                 :align=" item.isRight ? 'right' : 'left'"
			                 :sort-orders="item.isNeedSort ? ['descending', 'ascending'] :[]"
			                 :sort-method="(a,b) => {return tableSort(item.sortName,a,b)}"
			                 :sortable="item.isNeedSort">
				<template slot="header" slot-scope="scope">
					<span :class="item.isRight ? 'center_style' : ''">{{ item.label }}</span>
				</template>
				<template slot-scope="scope">
					<div class="coin_content" :class="item.isRight ? 'label_right_style' : ''"
					     v-if="item.label==='Coin'">
						<div class="coin_image_content">
							<img :src="scope.row['icon']" alt="">
						</div>
						<div class="coin_name_content">
							<div class="coin_symbol">
								{{ upperCaseSymbol(scope.row['symbol']) }}
								<div class="tip_icon" v-if="scope.row['symbol'] === 'usdc' ">
									<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
									<div class="tip_box">
										<div>
											<p>Please transfer USDC to Gravity Bridge on the</p>
											<a class="link_style" href="https://spacestation.zone/" target="_blank"
											   rel="noreferrer noopener">spacestation.zone.</a>
										</div>
									</div>
								</div>
								<div class="tip_icon" v-if="scope.row['symbol'] === 'weth' ">
									<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
									<div class="tip_box">
										<div>
											<p>Please transfer WETH to Gravity Bridge on the</p>
											<a class="link_style" href="https://spacestation.zone/" target="_blank"
											   rel="noreferrer noopener">spacestation.zone.</a>
										</div>
									</div>
								</div>
							</div>
							<p class="coin_chain">{{ scope.row['name'] }}</p>
						</div>
					</div>
					<div class="deposit_content_wrap" v-else-if="item.label ==='Deposit'">
						<div class="deposit_content"
						     v-if="scope.row['protocol'] !== 1">
							<div class="deposit_button"
							     @click="showDepositTipBox(scope.row)"
							     :class="[scope.row['protocol'] === 2 ? 'forbidden_style' : '' ]">
								<span class="deposit_label">Deposit</span>
								<div class="deposit_icon_content">
									<iconfont-component icon-name="icon-Deposit"></iconfont-component>
								</div>
							</div>
							<div class="deposit_tip_content"
							     v-if="scope.row['protocol'] === 2 ">
								<p>
									<span>Please use </span>
									<a class="wallet_link_style" :href="walletHref" target="_blank"
									   rel="noreferrer noopener">Rainbow wallet</a>
									<span> to operate.</span>
								</p>
								<p style="margin-top: 0.08rem"><a class="wallet_link_style"
								                                  href="https://medium.com/irisnet-blog/rainbow-app-supports-binance-chain-and-upgrades-interchain-gateway-transfer-feature-7641fab0dcb7"
								                                  target="_blank" rel="noreferrer noopener">User
									Guide</a></p>
							</div>
						</div>
					</div>
					<div class="withdraw_content_wrap" v-else-if="item.label ==='WithDraw'">
						<div class="withdraw_content"
						     v-if="scope.row['protocol'] !== 1">
							<div class="withdraw_button"
							     @click="shoWithdrawTipBox(scope.row)"
							     :class="[scope.row['protocol'] === 2 ? 'forbidden_style' : '' ]">
								<span class="withdraw_label">Withdraw</span>
								<div class="withdraw_icon_content">
									<iconfont-component icon-name="icon-withdraw1"></iconfont-component>
								</div>
							</div>
							<div class="withdraw_tip_content"
							     v-if="scope.row['protocol'] === 2">
								<p>
									<span>Please use </span>
									<a class="wallet_link_style" :href="walletHref" target="_blank"
									   rel="noreferrer noopener">Rainbow wallet</a>
									<span> to operate.</span>
								</p>
								<p style="margin-top: 0.08rem"><a class="wallet_link_style"
								                                  href="https://medium.com/irisnet-blog/rainbow-app-supports-binance-chain-and-upgrades-interchain-gateway-transfer-feature-7641fab0dcb7"
								                                  target="_blank" rel="noreferrer noopener">User
									Guide</a></p>
							</div>
						</div>
					</div>
					<div class="balance_content_wrap" v-else-if="item.label ==='Balance'">
						<div class="balance_content">
							<p class="balance_amount">{{ $store.state.isConnected ? Tools.formatBigNumber(scope.row[item.value]) : 0 }}</p>
							<p class="balance_value">
								{{ $store.state.isConnected ? scope.row[item.value] ==0 ? " " : scope.row['balanceValue'] : '$ 0' }}</p>
						</div>

					</div>
					<span :class="item.isRight ? 'right_style' :''" v-else>{{ scope.row[item.value] }}</span>
					<!--         <span>{{item}}{{scope.row}}</span>-->
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
import LoadingComponent from "../../components/LoadingComponent";
import IconfontComponent from "../../components/IconfontComponent";
import Tools from "../../util/utils";
const { VUE_APP_DOWNLOAD_URL,VUE_APP_CHAINID} = process.env
export default {
	name: "coinsTable",
	components: {IconfontComponent, LoadingComponent},
	props: {
		isConnectWallet:{
			type:Boolean,
			default: false
		},
		tableList: {
			type: Array,
			default: []
		},
		columnList: {
			type: Array,
			default: []
		},
		isloading: {
			type: Boolean,
			default: []
		}
	},
	data() {
		return {
            Tools,
			columns: [],
			walletHref: VUE_APP_DOWNLOAD_URL,
			defaultImageSrc: require('../../assets/img/logo/LOGO_Dafult.png')
		}
	},
	watch: {
		tabelist: {
			handler(newValue, oldValue) {
			},
			deep: true
		},
		columnList: {
			handler(newValue, oldValue) {
				this.columns = newValue
			},
			deep: true
		}
	},
	mounted() {
		this.columns = this.columnList
	},
	methods: {
		upperCaseSymbol(symbol){
			if(symbol){
				return symbol.toUpperCase()
			}
			return ''
		},
		shoWithdrawTipBox(chinaData) {
			if (chinaData?.symbol === 'bnb' || chinaData?.symbol === 'busd') {
				return
			}
			if(chinaData?.ibcTransferInfos?.length){
				const tipBoxConfig = {
					type: 'withdraw',
					fromChain: chinaData?.ibcTransferInfos[0].withdraw_info?.chain_name?.toUpperCase(),
					toChain: chinaData?.ibcTransferInfos[0].deposit_info[0]?.chain_name?.toUpperCase(),
					fromChainId: VUE_APP_CHAINID,
					toChainId: chinaData?.ibcTransferInfos[0].deposit_info[0]?.chain_id,
					...chinaData
				}
				this.$store.commit('depositWithdrawConfig', tipBoxConfig)
				this.$store.commit('isShowDepositWithdrawTipBox', true)
			}

		},
		showDepositTipBox(chinaData) {
			if (chinaData?.symbol === 'bnb' || chinaData?.symbol === 'busd') {
				return
			}

			if(chinaData?.ibcTransferInfos?.length){
				const tipBoxConfig = {
					type: 'deposit',
					fromChain: chinaData?.ibcTransferInfos[0].deposit_info[0]?.chain_name?.toUpperCase(),
					toChain: chinaData?.ibcTransferInfos[0].withdraw_info?.chain_name?.toUpperCase(),
					fromChainId: chinaData?.ibcTransferInfos[0].deposit_info[0]?.chain_id,
					toChainId: VUE_APP_CHAINID,
					...chinaData
				}
				this.$store.commit('depositWithdrawConfig', tipBoxConfig)
				this.$store.commit('isShowDepositWithdrawTipBox', true)
			}

		},
		tableSort(name, a, b) {
			switch (name) {
				case 'price':
					return this.priceSort(a.price, b.price)
				case 'balance':
					return this.balanceSort(a.displayBalance, b.displayBalance)
				case 'coin':
					return this.coinSort(a.symbol, b.symbol)
			}
		},
		priceSort(pricea,priceb) {
			if( Number(pricea) - Number(priceb) >= 0){
				return 1
			}else {
				return -1
			}
		},
		balanceSort(balancea,balanceb) {
			if(this.$store.state.isConnected){
				return  Number(balancea) -  Number(balanceb)
			}
		},
		coinSort(symbola,symbolb) {
			if(symbola >symbolb){
				return 1
			}else {
				return -1
			}
		}
	},
    computed: {
        getBalanceValue() {
            return function(balanceValue) {
                if(balanceValue) {
                    return `${balanceValue.split(' ')[0]} ${Tools.formatBigNumber(balanceValue.split(' ')[1])}`
                }
            }
        }
    }
}
</script>

<style scoped lang="scss">
.table_list_content {
	.center_style {
		text-align: right;
	}

	:deep(.is-right) {
		.cell {
			justify-content: flex-end;
		}
	}

	:deep(.cell) {
		display: flex;
		align-items: center;
		white-space: nowrap;
		width: 100%;
	}

	.coin_content {
		display: flex;
		align-items: center;

		.coin_image_content {
			width: 0.24rem;
			height: 0.24rem;
			margin-right: 0.12rem;

			img {
				width: 100%;
				height: 100%;
			}
		}

		.coin_name_content {
			.coin_symbol {
				display: flex;
				font-size: 0.2rem;
				color: rgba(12, 15, 32, 1);
				line-height: 0.2rem;

				.tip_icon {
					margin-left: 0.08rem;
					width: 0.16rem;
					height: 0.16rem;
					position: relative;
					top: -0.02rem;
					left: 0;
					cursor: pointer;

					&:hover {
						.tip_box {
							display: block;
						}
					}

					.tip_box {
						display: none;
						width: 3.4rem;
						background: rgba(255, 255, 255, 1);
						border-radius: var(--borderRadius4);
						box-sizing: border-box;
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						padding: 0.12rem 0.16rem;
						position: absolute;
						bottom: 0.24rem;
						left: -0.08rem;
						z-index: 130;
						word-break: break-word;
						white-space: break-spaces;
						font-size: 0.14rem;
						color: rgba(0, 0, 0, 0.65);
						line-height: 0.18rem;

						&::after {
							content: url("../../assets/img/tips_icon.png");
							position: absolute;
							left: 0.1rem;
							bottom: -0.14rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
							transform: rotate(-90deg);
						}

						.link_style {
							margin-left: 0.02rem;
							color: var(--btnColor);
						}
					}
				}
			}

			.coin_chain {
				margin-top: 0.02rem;
				font-size: 14px;
				color: rgba(12, 15, 32, 0.64);
				line-height: 14px;
			}
		}
	}

	.label_right_style {
		text-align: right;
	}

	.deposit_content_wrap {
		height: 100%;
		display: flex;
		align-items: center;

		&:hover {
			.deposit_content {
				.deposit_tip_content {
					display: block;
				}
			}
		}

		.deposit_content {
			position: relative;

			.forbidden_style {
				opacity: 0.3;
				cursor: not-allowed !important;
			}

			.deposit_button {
				display: flex;
				cursor: pointer;

				.deposit_label {
					font-size: 0.16rem;
					color: var(--hoverColor);
					line-height: 0.2rem;
				}

				.deposit_icon_content {
					margin-left: 0.08rem;
					width: 0.16rem;
					height: 0.16rem;
				}
			}

			.deposit_tip_content {
				display: none;
				text-align: center;
				opacity: 1;
				width: 3.2rem;
				position: absolute;
				top: -0.8rem;
				left: -0.17rem;
				border: 0.01rem solid var(--tooltipBoxBorderColor);
				border-radius: var(--borderRadius4);
				box-sizing: border-box;
				padding: 0.16rem;
				background: rgba(255, 255, 255, 1);
				font-size: 0.16rem;
				color: var(--fontColorBlack65);
				line-height: 0.16rem;
				z-index: 11;

				&::after {
					content: url("../../assets/img/tips_icon.png");
					position: absolute;
					left: 0.32rem;
					bottom: -0.12rem;
					color: rgba(226, 233, 255, 1);
					z-index: 10;
					transform: rotate(-90deg);
				}

				.wallet_link_style {
					color: var(--btnColor);
				}
			}
		}
	}

	.withdraw_content_wrap {
		height: 100%;
		display: flex;
		align-items: center;

		&:hover {
			.withdraw_content {
				.withdraw_tip_content {
					display: block;
				}
			}
		}

		.withdraw_content {
			position: relative;

			.forbidden_style {
				opacity: 0.3;
				cursor: not-allowed !important;
			}

			.withdraw_button {
				display: flex;
				cursor: pointer;

				.withdraw_label {
					font-size: 0.16rem;
					color: var(--hoverColor);
					line-height: 0.2rem;
				}

				.withdraw_icon_content {
					margin-left: 0.08rem;
					width: 0.16rem;
					height: 0.16rem;
				}
			}

			.withdraw_tip_content {
				display: none;
				text-align: center;
				opacity: 1;
				width: 3.2rem;
				position: absolute;
				top: -0.82rem;
				right: 0;
				border: 0.01rem solid var(--tooltipBoxBorderColor);
				border-radius: var(--borderRadius4);
				box-sizing: border-box;
				padding: 0.16rem;
				background: rgba(255, 255, 255, 1);
				font-size: 0.16rem;
				color: var(--fontColorBlack65);
				line-height: 0.16rem;
				z-index: 11;

				&::after {
					content: url("../../assets/img/tips_icon.png");
					position: absolute;
					right: 0.5rem;
					bottom: -0.12rem;
					color: rgba(226, 233, 255, 1);
					z-index: 10;
					transform: rotate(-90deg);
				}

				.wallet_link_style {
					color: var(--btnColor);
				}
			}
		}
	}

	.balance_content_wrap {
		display: flex;
		flex-direction: column;
		text-align: right;

		.balance_content {
			.balance_amount {
				font-size: 0.16rem;
				color: var(--fontColorBlack);
				line-height: 0.2rem
			}

			.balance_value {
				font-size: 0.14rem;
				color: var(--fontColorBlack65);
				line-height: 0.14rem;
			}
		}
	}

	.right_style {
		font-size: 0.16rem;
		color: var(--fontColorBlack);
		line-height: 0.2rem;
	}
}
:deep(.el-table) .cell {
	overflow: visible;
	height: 0.36rem;
	display: flex;
	align-items: center;
	font-weight: 500 !important;
	padding: 0 0.24rem !important;
}
:deep(.el-table) .is-right .cell {
	justify-content: flex-end !important;
}
</style>