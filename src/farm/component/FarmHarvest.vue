<template>
	<div class="farm_harvest_content">
		<div class="farm_harvest_content_wrap">
			<p class="farm_harvest_title">{{ $t('farm.harvestCard.title') }}</p>
			<div class="farm_harvest_value_content">
                <ul class="farm_harvest_value_list">
                    <li class="farm_harvest_value" v-show="harvestData.earned.length" v-for="(item,index) in harvestData.earned">
                        <span class="farm_value_content"
                            v-show="$store.state.isConnected">{{
                                item.amount >= 0 ? formatEarned(item) : ''
                            }}</span>
                        <span v-show="!$store.state.isConnected">--</span>
                    </li>
	                <li v-show="!harvestData.earned.length" v-for="(item, index) in harvestDenomList" :key="index">--</li>
                </ul>
				<el-button class="farm_harvest_button" :disabled="btnIsDisable" type="primary" @click="getAllHarvest()">
					{{ btnStr }}
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import {sendUnSignTx, broadcastTx, queryBankBalance} from "../../util/sdkHelper";
import {
	fee,
    chainId,
	irisTxDenom,
	KEPLR_WALLET,
	WALLET_CONNECT_WALLET,
	BROADCASTING,
	insufficientFee
} from "../../constant";
import Tools from "../../util/utils";
import {showBroadcasting} from "../../util/notifyPopUp"
const { VUE_APP_FEE} = process.env
export default {
	name: "FarmHarvest",
	props: {
		harvestData: {
			type: Object
		},
        client: {
            type: Object
        }
	},
	data() {
		return {
			btnStr: 'Harvest',
			harvestDenom: '',
			isBtnDisable: true,
			messageBoxStatus: false,
		}
	},
	watch: {
		harvestData: {
			handler() {
				this.harvestData.informationList.forEach(item => {
					if (item.label === "Earn") {
						this.harvestDenom = item.value
					}
				})
			},
			deep: true
		},
		'$store.state.isShowHarvestWaitingMask': {
			handler() {
				if (!this.$store.state.isShowHarvestWaitingMask) {
					this.isBtnDisable = true
					this.btnStr = 'Harvest'
				}
			},
			deep: true
		}
	},
	mounted() {
        this.harvestData.informationList.forEach(item => {
            if (item.label === "Earn") {
                this.harvestDenom = item.value
			}
		})
	},
	computed: {
		btnIsDisable() {
			if (this.harvestData.earned) {
				if (this.harvestData.earned.length > 0 && this.$store.state.isConnected && this.isBtnDisable && this.harvestData.status !== 1) {
					return false
				}
				return true
			}
			return true
		},
        harvestDenomList() {
            if(this.harvestDenom.indexOf('&') !== -1) {
                return this.harvestDenom.split('&');
            } else {
                return [this.harvestDenom]
            }
        }
	},
	methods: {
        formatEarned(earnItem) {
            const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null;
            let configMap = new Map();
			if (config && config?.length) {
				config.forEach(item => {
                    if(item.denom === earnItem.denom) {
                        configMap.set(earnItem.denom, item);
                    }
				})
			}

	        if(configMap && configMap.has(earnItem.denom)) {
                let amount = '', denom = '';
                if(configMap.get(earnItem.denom).symbol === 'weth') {
                    amount = Tools.formatWeth(configMap.get(earnItem.denom), earnItem.amount);
		            denom = configMap.get(earnItem.denom).symbol.toUpperCase()
                } else {
                    amount = Tools.maxToMin(configMap.get(earnItem.denom), earnItem.amount);
                    denom = configMap.get(earnItem.denom).symbol.toUpperCase()
                }
                return `${Tools.formatBigNumber(amount?.toString())} ${denom}`;
            }
            return `${Tools.formatBigNumber(earnItem.amount?.toString())} ${earnItem.denom.toUpperCase()}`;
        },
		async validatorBalance() {
			let isNextStep = true
      let feeAmount = JSON.parse(VUE_APP_FEE)?.amount || ''
			if (this.$store.state.address) {
				let currentAccountAmount = null
				let balance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
				if(balance?.balances?.balancesList?.length){
					balance.balances.balancesList.forEach(item => {
						if(item?.denom === irisTxDenom){
							currentAccountAmount = {balance:item}
						}
					})
				}else {
					currentAccountAmount = await queryBankBalance(this.$store.state.address, irisTxDenom)
				}
				if (Number(currentAccountAmount?.balance?.amount) < Number(feeAmount)) {
					isNextStep = false
				}
			} else {
				isNextStep = false
			}
			return isNextStep
		},
		async getAllHarvest() {
			let id = this?.harvestData?.id
			let unableNext = await this.validatorBalance()
			if (!unableNext) {
				const notifyData = JSON.parse(JSON.stringify(insufficientFee))
				this.$store.commit('transactionResult',notifyData)
				return
			}
			this.btnStr = `Collecting...`
			this.isBtnDisable = false
			const currentConnectWallet = KEPLR_WALLET
			this.$store.commit('isShowHarvestWaitingMask', true)
			if (id) {
				const params = {
					from: this.$store.state.address,
					poolId: id
				}
				sendUnSignTx(this.client, chainId, params).then(res => {
					if (currentConnectWallet) {
						switch (currentConnectWallet) {
							case KEPLR_WALLET:
								if (res?.code) {
									this.$store.commit('isShowHarvestWaitingMask', false)
									this.btnStr = 'Harvest'
									this.isBtnDisable = true
									this.$store.commit('isBroadcastTxError', true)
									return
								}
								this.broadcastHarvestTx(res)
								break;
							case WALLET_CONNECT_WALLET:
								this.sendUnSignTxStrToWallet(res)
						}
					}
				}).catch(e => {
					this.isBtnDisable = true
					this.btnStr = 'Harvest'
					console.log(e, "build tx error")
				})
			} else {
				this.btnStr = 'Harvest'
				this.isBtnDisable = true
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
			}
		},
		broadcastHarvestTx(signTxStr) {
			broadcastTx(this.client, signTxStr).then(res => {
				if (res?.hash) {
					this.$emit('isSendHarvestTx', true)
					this.$store.commit('isShowHarvestWaitingMask', false)
					this.btnStr = 'Harvest'
					this.isBtnDisable = true
					showBroadcasting(BROADCASTING);
				} else {
					this.$store.commit('isShowHarvestWaitingMask', false)
				}
			}).catch(e => {
				this.$store.commit('isShowHarvestWaitingMask', false)
				console.log(e, 'broadcast tx error')
				this.btnStr = 'Harvest'
				this.isBtnDisable = true
				this.$store.commit('isBroadcastTxError', true)
			})
		}
	}
}
</script>

<style scoped lang="scss">
.farm_harvest_content {
	border: 0.01rem solid var(--poolBorderColor);
	border-radius: var(--borderRadius8);
	box-sizing: border-box;
	padding: 0.08rem 0.16rem 0.12rem 0.16rem;
    :deep( .el-button--primary ){
        background-color: var(--btnColor);
        border-color: var(--btnColor);
        border-radius: var(--borderRadius6);
        font-size: var(--fontSize16);
        font-weight: var(--fontWt400);
        line-height: var(--lineHeight20);
        padding: 0.06rem 0.14rem;
    }
	
	.farm_harvest_content_wrap {
		.farm_harvest_title {
			font-size: var(--fontSize14);
			line-height: var(--lintHeight20);
			color: var(--fontColorBlack65);
		}
		
		.farm_harvest_value_content {
			display: flex;
			align-items: center;
			justify-content: space-between;
            margin-top: 0.08rem;
			height: 0.48rem;

            .farm_harvest_value_list {
                .farm_harvest_value {
                    margin-top: 0.08rem;

                    &:first-child {
                        margin-top: 0;
                    }

                    .farm_value_content {
                        font-size: var(--fontSize20);
                        line-height: var(--lineHeight20);
                        color: var(--hoverColor);
                    }
                }
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
