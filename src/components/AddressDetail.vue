<template>
	<div class="address_detail_container_card" @click.stop="stopPropagation()">
		<div class="address_detail_content">
			<div class="address_detail_title_content">
				<span class="address_detail_title_label">{{ $t('addressDetailCard.title') }}</span>
				<span class="iconfont icon-guanbi" @click.stop="closeAddressBox()"></span>
			</div>
			<div class="address_content">
				<div class="address_disconnect_content">
					<span class="address_disconnect_label">{{ $t('addressDetailCard.connectWallet') }}</span>
					<div class="address_disconnect_button" @click.stop="disconnect()">
						{{ $t('addressDetailCard.disConnect') }}
					</div>
				</div>
				<div class="wallet_connect_address">
					<span class="wallet_connect_logo" v-if="currentWallet === walletWallet">
						<iconfont-component icon-name="icon-walletconnect"></iconfont-component>
					</span>
					<div class="keplr_img_content"  v-if="currentWallet === keplrWallet">
						<img src="../assets/img/walletChoiceImage/keplr_logo.png" alt="">
					</div>
					<span class="wallet_address">{{ formatAddr }}</span>
				</div>
				<div class="address_copy_container">
					<div class="address_copy_content"
						 ref="copyDom"
						 :data-clipboard-text="address"
						 @click.stop="copyAddress()">
						<!--TODO 拷贝-->
						<span class="address_copy_icon">
							<iconfont-component
								:icon-name="isCopied ? 'icon-copied' : 'icon-fuzhi1'"></iconfont-component>
						</span>
						<span class="copy_address_label"
							  :style="{color: isCopied ? 'rgba(109, 212, 0, 1)' :'rgba(0, 0, 0, 0.65)'}">{{
								isCopied ? 'Copied!' : 'Copy Address'
							}}</span>
					</div>
					<div class="explorer_content">
						<span class="explorer_icon">
							<iconfont-component icon-name="icon-iobscan"></iconfont-component>
						</span>
						<span class="explorer_label">
							<a :href="`${explorerUrl}/iris/account/${address}`" rel="noreferrer noopener" target="_blank">View on Explorer</a>
						</span>
					</div>
				</div>
			</div>
			<p class="transaction_tooltip_content">{{ $t('addressDetailCard.transactionTitleTip') }}</p>
			<div class="transaction_list_container" v-if="hasResultList.length">
				<div class="transaction_list_title_content">
					<span class="transaction_list_title">{{ $t('addressDetailCard.recentTransaction') }}</span>
					<span class="clear_all_transaction" @click.stop="clearAllTransactions">
						{{ $t('addressDetailCard.clearAll') }}
					</span>
				</div>
				<ul class="transaction_list_content">
					<li class="transaction_item_content" v-for="(item,index) in addressTxList" :key="index" v-show="isTransfer(item)">
						<a class="transaction_item_link" :href=" item.msgType === 'transfer' ? `${ibcExplorerUrl}/transfers/details?hash=${item.hash}` :`${explorerUrl}/iris/txs/${item.hash}`"
						   rel="noreferrer noopener" target="_blank">
							<span class="transaction_block_content">
								<span class="transaction_hash">{{ formatHash(item) }}</span>
								<span class="transaction_hash_link_icon">
									<iconfont-component icon-name="icon-tiaozhuan"></iconfont-component>
								</span>
							</span>
							<span class="transaction_status">
								<iconfont-component :icon-name="showSuccessorFailedIcon(item)"></iconfont-component>
							</span>
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "./IconfontComponent";
import Tools from "../util/utils";
import {parseSwapOrderEvents, parseAddLqEvents, parseRemoveLqEvents} from "../util/syncTx";
import {
	ADD_LIQUIDITY, FARM_HARVEST, FARM_STAKE, FARM_UNSTAKE,
	IBC_TRANSFER,
	TRANSFER,
	KEPLR_WALLET,
	REMOVE_LIQUIDITY,
	SWAP_ORDER, txType,
	WALLET_CONNECT_WALLET,
    TX_EVENTS_ATTRIBUTES_AMOUNT
} from "../constant";
import {getTokens} from "../util/IritaHelper";
const { VUE_APP_EXPLORER_URL,VUE_APP_IBC_EXPLORER_URL} = process.env
export default {
	name: "AddressDetail",
	components: {IconfontComponent},
	data() {
		return {
			copyBtn: null,
			isCopied: false,
			timeOutTimer: NaN,
			address: '',
			addressTxList: [],
			explorerUrl: VUE_APP_EXPLORER_URL,
			ibcExplorerUrl:VUE_APP_IBC_EXPLORER_URL,
			tokenMap: null,
			depositConfigMap: null,
			withdrawConfigMap: null,
			currentWallet: '',
			keplrWallet : KEPLR_WALLET,
			walletWallet: WALLET_CONNECT_WALLET,
            baseToken: sessionStorage.getItem('baseToken') ? JSON.parse(sessionStorage.getItem('baseToken')) : {}
		}
	},
	watch: {
		'$store.state.address': {
			handler() {
				this.setAccountTxList()
			},
			deep: true
		},
		'$store.state.currentWallet':{
			deep:true,
			handler(newValue,oldValue){
				if(newValue){
					this.currentWallet = JSON.parse(newValue)
				}
				
			}
		},
        '$store.state.updateTimer'() {
            this.setAccountTxList();
        },
        '$store.state.failedUpdateTimer'() {
            this.setAccountTxList();
        },
	},
	async mounted() {
		const currentWallet  = KEPLR_WALLET
		if(currentWallet){
			this.currentWallet = currentWallet
		}
		this.copyBtn = new this.cliboard(this.$refs.copyDom)
		let walletConnector = JSON.parse(localStorage.getItem('walletconnect'))
		this.address = walletConnector ? walletConnector.accounts[0] : ''
		this.setAccountTxList()
		const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : await getTokens();
		this.tokenMap = new Map();
        this.depositConfigMap = new Map();
        this.withdrawConfigMap = new Map();
		if (config?.length) {
			config.forEach(item => {
				this.tokenMap.set(item.denom, item)
                if(item.denom){
                    this.withdrawConfigMap.set(item.denom,item)
                }
                if(item?.ibcTransferInfos?.length){
                    const denom = item.ibcTransferInfos[0]?.deposit_info[0].denom
                    this.depositConfigMap.set(denom,item)
                }
			})
		}
	},
	computed: {
        hasResultList() {
            return this.addressTxList?.length && this.addressTxList?.filter(item => {
                if(item.msgType !== IBC_TRANSFER) {
                    if(item.txStatus === 1 || (item.txStatus === 0 && item?.msgs?.length)) {
                        return item;
                    }
                } else {
                     if(item.ibcStatus !== 'noIbcStatus') {
                        return item;
                    }
                }
            });
        },
		formatAddr() {
			if (this.$store.state.address) {
				return Tools.formatAddress(this.$store.state.address)
			}
			return ''
		},
        isTransfer() {
            return function(item) {
                if(item?.msgType !== IBC_TRANSFER) {
                    if(item?.txStatus !== 'noStatus') {
                        return item.txStatus === 0 && !item?.msgs?.length ? false : true;
                    } else {
                        return false;
                    }
                } else {
                    return item?.ibcStatus !== 'noIbcStatus' ? true : false;
                }
            }
        },
        showSuccessorFailedIcon() {
            return function(item) {
                if(item?.msgType !== IBC_TRANSFER) {
                    switch(item?.txStatus) {
                        case 0:
                            return 'icon-shibai';
                        case 1:
                            return 'icon-chenggong';
                    }
                } else {
                    switch(item?.ibcStatus) {
                        case 0:
                            return 'icon-shibai';
                        case 1:
                            return 'icon-chenggong';
                    }
                }
            }
        }
	},
	methods: {
		stopPropagation(){
		
		},
		parseIbcTransfer(tx){
            if(this.depositConfigMap && this.withdrawConfigMap) {
                if(tx.ibcStatus && tx.ibcStatus === 1) {
                    const transferEvents = tx.events?.filter(item => item.type === IBC_TRANSFER);
                    const ibcTransferEvent = transferEvents?.length && transferEvents[transferEvents.length - 1];
                    if(Object.keys(ibcTransferEvent)?.length) {
                        const ibcTransferInfo = ibcTransferEvent?.attributes?.filter(item => item.key === TX_EVENTS_ATTRIBUTES_AMOUNT);
                        const ibcTransferFormatInfo = this.formatStringAmount(ibcTransferInfo?.length && ibcTransferInfo[0]?.value);
                        if(Object.keys(ibcTransferFormatInfo)?.length) {
                            const depositConfigInfo = this.depositConfigMap.get(ibcTransferFormatInfo?.denom)
                            const withdrawConfigInfo = this.withdrawConfigMap.get(ibcTransferFormatInfo?.denom)
                            let tokenAmount = '',
                            chainName = '',
                            tokenDenom = ''
                            if(depositConfigInfo?.ibcTransferInfos?.length){
                                tokenAmount  = Tools.maxToMin(depositConfigInfo,ibcTransferFormatInfo?.amount)
                                chainName = depositConfigInfo?.ibcTransferInfos[0].deposit_info[0].chain_name
                                tokenDenom = depositConfigInfo.symbol.toUpperCase()
                                return `Deposit ${tokenAmount} ${tokenDenom} from ${chainName}`
                            }
                            if(withdrawConfigInfo?.ibcTransferInfos?.length){
                                tokenAmount  = Tools.maxToMin(withdrawConfigInfo,ibcTransferFormatInfo?.amount)
                                chainName = withdrawConfigInfo?.ibcTransferInfos[0].deposit_info[0].chain_name
                                tokenDenom = withdrawConfigInfo.symbol.toUpperCase()
                                return `Withdraw ${tokenAmount} ${tokenDenom} to ${chainName}`
                            }
                            return Tools.formatAddress(tx.hash)
                        }
                    }
                } else {
                    if(tx?.msgs?.length === 1 && tx?.msgs[0]?.token?.denom && tx?.msgs[0]?.token?.amount && Number( tx?.msgs[0]?.token?.amount) >= 0 ){
                        const depositConfigInfo = this.depositConfigMap.get(tx?.msgs[0]?.token?.denom)
                        const withdrawConfigInfo = this.withdrawConfigMap.get(tx?.msgs[0]?.token?.denom)
                        let tokenAmount = '',
                            chainName = '',
                            tokenDenom = ''
                        if(depositConfigInfo?.ibcTransferInfos?.length){
                            tokenAmount  = Tools.maxToMin(depositConfigInfo,tx?.msgs[0]?.token?.amount)
                            chainName = depositConfigInfo?.ibcTransferInfos[0].deposit_info[0].chain_name
                            tokenDenom = depositConfigInfo.symbol.toUpperCase()
                            return `Deposit ${tokenAmount} ${tokenDenom} from ${chainName}`
                        }
                        if(withdrawConfigInfo?.ibcTransferInfos?.length){
                            tokenAmount  = Tools.maxToMin(withdrawConfigInfo,tx?.msgs[0]?.token?.amount)
                            chainName = withdrawConfigInfo?.ibcTransferInfos[0].deposit_info[0].chain_name
                            tokenDenom = withdrawConfigInfo.symbol.toUpperCase()
                            return `Withdraw ${tokenAmount} ${tokenDenom} to ${chainName}`
                        }
                        return Tools.formatAddress(tx.hash)
                    }
                }
            }
		},
		parseStakeUnstakeTx(tx, txType){
            if(tx?.events?.length) {
                const stakeUnstakeEvents = tx.events?.filter(item => item.type === tx?.msgType);
                const stakeUnstakeAttributes = stakeUnstakeEvents?.length && stakeUnstakeEvents[0]?.attributes;
                const formatStakeUnstake = stakeUnstakeAttributes?.length && stakeUnstakeAttributes?.filter(item => item.key === TX_EVENTS_ATTRIBUTES_AMOUNT);
                const stakeUnstakeInfo = formatStakeUnstake?.length && this.formatStringAmount(formatStakeUnstake[0]?.value);
                if(typeof stakeUnstakeInfo == 'object') {
                    const stakeUnstakeFormatAmount = stakeUnstakeInfo?.amount || '';
                    const stakeUnstakeFormatDenom = stakeUnstakeInfo?.denom || '';
                    if(this.baseToken) {
                        let stakeUnstakeAmount = Tools.maxToMin(this.baseToken, stakeUnstakeFormatAmount) || '';
                        let stakeUnstakeDenom = stakeUnstakeFormatDenom?.toUpperCase() || '';
                        if(stakeUnstakeAmount && stakeUnstakeDenom) {
                            return `${txType} ${stakeUnstakeAmount} ${stakeUnstakeDenom}`
                        }
                        return Tools.formatAddress(tx.hash);
                    }
                }
            } else {
                if(this.baseToken && tx?.msgs?.length && tx.msgs.length === 1){
                	const stakeUnstakeToken = tx.msgs[0].amount
                	const stakeUnstakeAmount = Tools.maxToMin(this.baseToken,stakeUnstakeToken?.amount || 0)
                	const stakeUnstakeDenom = stakeUnstakeToken?.denom?.toUpperCase() || ''
                	if(stakeUnstakeAmount && stakeUnstakeDenom){
                		return `${txType} ${stakeUnstakeAmount} ${stakeUnstakeDenom}`
                	}
                	return Tools.formatAddress(tx.hash)
                }
            }
		},
		formatStringAmount (stringAmount){
			if(typeof stringAmount == 'string'){
				let amount = (/[0-9]+[.]?[0-9]*/.exec(stringAmount) || [''])[0];
				let denom = stringAmount.replace(amount, '');
				return{
					amount,
					denom
				}
			}
			return ''
		},
		parseHarvestTx(tx){
			let rewardAmountArr = []
			if(tx?.events?.length){
				tx.events.forEach( item => {
					if(item?.type === FARM_HARVEST){
						if(item?.attributes?.length){
							item.attributes.forEach(value => {
								if(value?.key === "reward"){
									if(value.value.indexOf(',') !== -1){
										let token  = value.value.split(',')
										if(token?.length){
											token.forEach(tokenValue => {
												const amountObj = this.formatStringAmount(tokenValue)
												rewardAmountArr.push(amountObj)
											})
										}
									}else {
										const amountObj = this.formatStringAmount(value.value)
										rewardAmountArr.push(amountObj)
									}
								}
							})
						}
					}
				})
				if(rewardAmountArr?.length){
                    if(this.tokenMap) {
                        let formatAmount = []
                        rewardAmountArr.forEach(item => {
                            let amount = null,denom = ''
                            if(this.tokenMap.has(item.denom)){
                                amount = Tools.maxToMin(this.tokenMap.get(item.denom),item.amount)
                                denom = this.tokenMap.get(item.denom).symbol.toUpperCase()
                                formatAmount.push({amount,denom})
                            }else {
                                formatAmount.push({amount:item.amount,denom:Tools.formatAddress(item.denom)})
                            }
    
                        })
                        if(formatAmount?.length && formatAmount?.length === 1){
                            return `Harvest ${formatAmount[0].amount} ${formatAmount[0].denom}`
                        }else if (formatAmount?.length && formatAmount?.length > 1) {
                            let defaultStr = 'Harvest',str = '';
                            formatAmount.forEach(item => {
                                str += `${item.amount} ${item.denom?.toUpperCase()} and `
                            })
                            return `${defaultStr} ${str.substring(0,str.length - 4)}`
    
                        }else {
                            return 'Harvest'
                        }
                    }
				}

			}else {
				return 'Harvest'
			}
		},
		getEventsAmount(tx) {
			if (tx?.txStatus === 1) {
				let tokenArr = [], token1Amount, token2Amount, token1Denom, token2Denom,ibcToken;
				switch (tx.msgType) {
					case SWAP_ORDER:
						tokenArr = parseSwapOrderEvents(tx.events)
						break
					case ADD_LIQUIDITY:
						tokenArr = parseAddLqEvents(tx.events)
						break
					case REMOVE_LIQUIDITY:
						tokenArr = parseRemoveLqEvents(tx.events)
						break
					case IBC_TRANSFER:
						ibcToken = this.parseIbcTransfer(tx)
						break
					case FARM_STAKE:
						ibcToken = this.parseStakeUnstakeTx(tx, 'Stake')
						break
					case FARM_UNSTAKE:
						ibcToken = this.parseStakeUnstakeTx(tx, 'Unstake')
						break
					case FARM_HARVEST:
						ibcToken = this.parseHarvestTx(tx)
						break
				}
				if(ibcToken){
					return ibcToken
				}
				if (tokenArr?.length) {
					let token1 = tokenArr[0]
					let token2 = tokenArr[tokenArr.length -1]
					token1Amount = token1?.denom && this.tokenMap ? this.tokenMap.has(token1.denom) && Tools.maxToMin(this.tokenMap.get(token1.denom), token1.amount) : ''
					token2Amount = token2?.denom && this.tokenMap ? this.tokenMap.has(token2.denom) && Tools.maxToMin(this.tokenMap.get(token2.denom), token2.amount) : ''
					token1Denom = token1?.denom && this.tokenMap ? this.tokenMap.get(token1.denom)?.symbol?.toUpperCase() : ''
					token2Denom = token2?.denom && this.tokenMap ? this.tokenMap.get(token2.denom)?.symbol?.toUpperCase() : ''
					token1Amount = Tools.formatDecimal(token1Amount,3)
					token2Amount = Tools.formatDecimal(token2Amount,3)
					switch (tx.msgType) {
						case SWAP_ORDER:
							return `Swap ${token1Amount} ${token1Denom} for ${token2Amount} ${token2Denom}`
						case ADD_LIQUIDITY:
							return `Add ${token1Amount} ${token1Denom} and ${token2Amount} ${token2Denom}`
						case REMOVE_LIQUIDITY:
							return `Remove ${token1Amount} ${token1Denom} and ${token2Amount} ${token2Denom}`
					}
				} else {
					return Tools.formatAddress(tx.hash)
				}
			} else {
				if (tx?.msgs?.length) {
					let displayStr = ''
					for (const msg of tx.msgs) {
						let type = txType[msg.type] || msg.type

						switch (type) {
							case SWAP_ORDER: {
								const token1Denom = msg?.input?.coin?.denom && this.tokenMap ? this.tokenMap.get(msg.input.coin.denom).symbol : ''
								const token2Denom = msg?.output?.coin?.denom && this.tokenMap ? this.tokenMap.get(msg.output.coin.denom).symbol : ''
								if (token1Denom && token2Denom) {
									displayStr = `Swap ${token1Denom.toUpperCase()} for ${token2Denom.toUpperCase()}`
								}
							}
								break
							case ADD_LIQUIDITY: {
								const addLiquidityDenom = msg?.max_token?.denom && this.tokenMap ? this.tokenMap.get(msg.max_token.denom).symbol : ''
								if (addLiquidityDenom && this.baseToken) {
									displayStr = `Add ${addLiquidityDenom.toUpperCase()} and ${this.baseToken.symbol.toUpperCase()}`
								}
							}
								break
							case REMOVE_LIQUIDITY: {
								const lpDenomToDenom = msg?.withdraw_liquidity?.denom ? msg.withdraw_liquidity.denom.replace(/swap/, '') : ''
								const RemoveLiquidityDenom = lpDenomToDenom && this.tokenMap ? this.tokenMap.get(lpDenomToDenom).symbol : ''
								if (RemoveLiquidityDenom) {
									displayStr = `Remove ${RemoveLiquidityDenom.toUpperCase()} and ${this.baseToken.symbol.toUpperCase()}`
								}
								break
							}
							case FARM_STAKE: {
								displayStr = this.parseStakeUnstakeTx(tx, 'Stake')
								break
							}
							case FARM_UNSTAKE: {
								displayStr = this.parseStakeUnstakeTx(tx, 'Unstake')
								break
							}
							case FARM_HARVEST: {
								displayStr =  this.parseHarvestTx(tx)
							}
							
						}
					}
					return displayStr ? displayStr : tx.hash ? Tools.formatAddress(tx.hash) : ''
				}
			}
			
		},
		setAccountTxList() {
            const storageTransactions = localStorage.getItem('transactions') ? JSON.parse(localStorage.getItem('transactions')) : [];
            const connectedData = JSON.parse(localStorage.getItem('walletconnect')) || {};
            const address = connectedData ? connectedData.accounts[0] : '';
            const currentAddressTransactions = storageTransactions?.filter(item => item.address === address) || [];
            let txListWithStatus = currentAddressTransactions[0]?.list || [];
			this.addressTxList = txListWithStatus.length ? txListWithStatus.filter(item => item?.type !== 'send').splice(0,10) : []
		},
		async clearAllTransactions() {
			let transactions = JSON.parse(localStorage.getItem('transactions'))
			if (transactions) {
				transactions.forEach(item => {
					if (item.address === this.$store.state.address) {
						item.list = []
					}
				})
			}
			localStorage.setItem('transactions', JSON.stringify(transactions))
			this.addressTxList = []
		},
		formatHash(tx) {
            if(tx?.events?.length || tx?.msgs?.length) {
                let displayStr = this.getEventsAmount(tx)
                return displayStr
            }
		},
		disconnect() {
			const walletConnectConfig = JSON.parse(localStorage.getItem('walletconnect')) || null
            const currentWallet = JSON.parse(localStorage.getItem('currentWallet')) || null
			if (walletConnectConfig && currentWallet === WALLET_CONNECT_WALLET) {
				const connector = new WalletConnect(walletConnectConfig)
				connector.killSession();
			}
			this.$store.commit('closedAddressCard', false)
			this.$store.commit('isConnected', false)
			this.$store.commit('address', '')
			localStorage.removeItem('walletconnect')
			localStorage.removeItem('currentWallet')
		},
		closeAddressBox() {
			this.$store.commit('closedAddressCard', false)
		},
		copyAddress() {
			if (this.isCopied) {
				return
			}
			this.copyBtn.on('success', (e) => {
				if (e.text) {
					this.isCopied = true
				} else {
					this.isCopied = false
				}
				clearTimeout(this.timeOutTimer)
				this.resetCopied();
				
			})
			this.copyBtn.on('error', (e) => {
				this.isCopied = false
			})
		},
		resetCopied() {
			this.timeOutTimer = setTimeout(() => {
				this.isCopied = false
			}, 2000)
		}
	}
}
</script>

<style scoped lang="scss">
.address_detail_container_card {
	width: 4.64rem;
	height: auto;
	background: var(--cardBgColor);
	border-radius: var(--borderRadius8);
	border: 0.01rem solid var(--tooltipBoxBorderColor);
	@media (max-width: 500px) {
		width: auto;
	}
	
	.address_detail_content {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		padding: var(--boxPadding24);
		.address_detail_title_content {
			display: flex;
			justify-content: space-between;
			
			.address_detail_title_label {
				font-size: var(--fontSize20);
				line-height: var(--lineHeight32);
				font-weight: var(--fontWt600);
			}
			
			.iconfont {
				display: inline-block;
				color: var(--btnColor);
				padding: 0.02rem 0.1rem;
				cursor: pointer;
				line-height: var(--lineHeight20);
			}
		}
		
		.address_content {
			margin-top: 0.08rem;
			border: 0.01rem solid var(--lineColor);
			border-radius: var(--borderRadius8);
			box-sizing: border-box;
			padding: var(--boxPadding16);
			
			.address_disconnect_content {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				@media (max-width: 500px) {
					flex-direction: column;
					align-items: flex-start;
				}
				
				.address_disconnect_label {
					font-size: var(--fontSize14);
					color: var(--fontColorBlack65);
					line-height: var(--lineHeight20);
				}
				
				.address_disconnect_button {
					margin-left: 0.16rem;
					padding: 0.07rem 0.08rem;
					background: var(--btnColor);
					color: var(--fontColorWhite);
					border-radius: var(--borderRadius6);
					font-size: var(--fontSize14);
					line-height: 0.17rem;
					cursor: pointer;
					@media (max-width: 500px) {
						margin-left: 0;
						margin-top: 0.08rem;
					}
				}
			}
			
			.wallet_connect_address {
				display: flex;
				margin: 0.18rem 0;
				
				.wallet_connect_logo {
					width: 0.24rem;
					height: 0.16rem;
					margin-right: 0.16rem;
				}
				.keplr_img_content{
					width: 0.2rem;
					height: 0.2rem;
					margin-right: 0.16rem;
					img	{
						width: 100%;
					}
				}
				.wallet_address {
					font-size: var(--fontSize16);
					color: var(--fontColorBlack);
					line-height: var(--lineHeight20);
					font-weight: var(--fontWt600);
				}
			}
			
			.address_copy_container {
				display: flex;
				@media (max-width: 500px) {
					flex-direction: column;
				}
				
				.address_copy_content {
					display: flex;
					align-items: center;
					cursor: pointer;
					-moz-user-select: none;
					-ms-user-select: none;
					-webkit-user-select: none;
					user-select: none;
					
					.address_copy_icon {
						width: 0.24rem;
						height: 0.24rem;
					}
					
					.copy_address_label {
						margin-left: 0.16rem;
						font-size: var(--fontSize14);
						color: var(--fontColorBlack65);
						line-height: var(--lineHeight20);
					}
				}
				
				.explorer_content {
					display: flex;
					margin-left: 0.36rem;
					align-items: center;
					@media (max-width: 500px) {
						margin-left: 0;
						margin-top: 0.08rem;
					}
					
					.explorer_icon {
						width: 0.24rem;
						height: 0.24rem;
					}
					
					.explorer_label {
						&:hover {
							a {
								color: var(--btnColor)
							}
						}
						
						a {
							margin-left: 0.16rem;
							font-size: var(--fontSize14);
							color: var(--fontColorBlack65);
							line-height: var(--lineHeight20);
						}
					}
				}
			}
		}
		
		.transaction_tooltip_content {
			margin: var(--boxPadding16) 0;
			font-size: var(--fontsize14);
			line-height: var(--lineHeight20);
			color: var(--fontColorBlack65)
		}
		
		.transaction_list_container {
			.transaction_list_title_content {
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.14rem;
				
				.transaction_list_title {
					font-size: var(--fontSize16);
					font-weight: var(--fontWt600);
					line-height: var(--lineHeight20);
					color: var(--fontColorBlack);
				}
				
				.clear_all_transaction {
					box-sizing: border-box;
					padding: 0.02rem 0.06rem;
					background: var(--btnHoverColor);
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
					color: var(--btnColor);
					border-radius: var(--borderRadius4);
					cursor: pointer;
				}
			}
			
			.transaction_list_content {
				width: 100%;
				
				.transaction_item_content {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: 0.08rem;
					
					&:hover {
						.transaction_item_link {
							color: var(--btnColor);
						}
					}
					
					.transaction_item_link {
						font-size: var(--fontSize14);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						display: flex;
						align-items: center;
						justify-content: space-between;
						width: 100%;
						.transaction_block_content{
							display: inline-block;
							.transaction_hash_link_icon {
								margin-left: 0.08rem;
								width: 0.16rem;
								height: 0.16rem;
								display: inline-block;
							}
						}
						
						.transaction_status {
							width: 0.16rem;
							height: 0.16rem;
						}
					}
				}
				
				.transaction_item_content:first-child {
					margin-top: 0;
				}
			}
		}
	}
}
</style>
