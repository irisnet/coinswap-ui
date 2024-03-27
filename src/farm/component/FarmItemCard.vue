<template>
	<div class="farm_list_container">
		<div class="farm_list_content_wrap">
			<ul class="farm_list_item_content">
				<li class="farm_list_item"
					v-for="(item,index) in farmList"
					:key="index">
					<farm-base-detail :information="item"></farm-base-detail>
<!--					<farm-harvest :client="client" :harvestData="item" @isSendHarvestTx="sendHarvest"></farm-harvest>-->
					<farm-stake :stakeUnStakeData="item"></farm-stake>
					<div class="wallet_connect_button_content">
						<wallet-connect-content v-if="!$store.state.isConnected"></wallet-connect-content>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import FarmBaseDetail from "./FarmBaseDetail";
import FarmHarvest from "./FarmHarvest";
import FarmStake from "./FarmStake";
import {queryFarmList, queryFarmRewards} from "../../server/api";
import WalletConnectContent from "../../navigation/components/WalletConnectContent";
import {queryBankAllBalances} from "../../util/sdkHelper"
import {poolsErrorCode} from "../../server/apiCode";
import {queryCoins} from "../../server/api";

export default {
	name: "FarmItemCard",
	components: {WalletConnectContent, FarmStake, FarmHarvest, FarmBaseDetail},
	props:{
		option:{
			type:String,
			default:''
		},
        client: {
            type: Object,
            default: null
        }
	},
	data() {
		return {
			farmList: JSON.parse(sessionStorage.getItem('allFarmsList'))?.allPoolList || [],
            rewardsList: JSON.parse(sessionStorage.getItem('allRewardsList')) || [],
			farmTimer: null,
			address: '',
			tokenConfig: null,
			allPoolList: [],
            defaultImageSrc: require('../../assets/img/farm/Coming-Soon.png')
		}
	},
	watch: {
		"$store.state.address"() {
			this.address = this.$store.state.address
            this.getFarmRewards(this.$store.state.address)
			this.getFarmList(this.$store.state.address)
		},
		"$store.state.addressLpBalance":{
			deep: true,
			handler(newValue,oldValue){
				let oldBalanceMap = new Map()
				if(oldValue?.balances?.balancesList?.length){
					oldValue.balances.balancesList.forEach( item => {
						if(item?.denom?.toString().includes('lp')){
							oldBalanceMap.set(item.denom,item.amount)
						}
					})
				}
				if(oldBalanceMap?.size > 0 && newValue?.balances?.balancesList?.length){
					newValue.balances.balancesList.forEach( item => {
						if(item?.denom && oldBalanceMap.has(item.denom)){
							const oldLpBalance = oldBalanceMap.get(item.denom)
							if(oldLpBalance !== item.amount){
								this.getFarmRewards(this.$store.state.address)
								this.getFarmList(this.$store.state.address)
							}
						}
					})
				}
			}
		},
		option(newValue){
			this.filterFinishedPool(this.allPoolList,newValue)
		},
        allPoolList: {
            handler(newFarmList) {
                let farmList = newFarmList;
                let rewardsList = this.rewardsList;
                this.storagePoolsRewards(farmList, rewardsList);
            },
            deep: true,
            immediate: true
        },
        rewardsList: {
            handler(newRewardsList) {
                let farmList = this.farmList;
                let rewardsList = newRewardsList;
                this.storagePoolsRewards(farmList, rewardsList);
            },
            deep: true
        }
	},
	async mounted() {
		let storageTokenConfig = JSON.parse(localStorage.getItem('config')) || null
		if (!storageTokenConfig || storageTokenConfig && !storageTokenConfig.length || JSON.stringify(storageTokenConfig) === '{}') {
			let apiTokenConfig = await queryCoins().catch(error => console.error(error))
			this.tokenConfig = apiTokenConfig.coins.filter(item => !item.offline)
		} else {
			this.tokenConfig = storageTokenConfig
		}
		let walletconnect = localStorage.getItem('walletconnect') ? JSON.parse(localStorage.getItem('walletconnect')) : ''
		this.address = walletconnect ? walletconnect.accounts[0] : '';
        this.getFarmRewards(this.address)
		this.getFarmList(this.address)
		this.farmTimer = setInterval(() => {
            this.getFarmRewards(this.address)
			this.getFarmList(this.address)
		}, 10000)
	},
	methods: {
		sendHarvest() {
			let address = this.$store.state.address
            this.getFarmRewards(address)
			this.getFarmList(address)
		},
		getAllBalance(data) {
			const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
			const configMap = new Map()
			if (config && config?.length) {
				config.forEach(item => {
					configMap.set(item.denom, item)
				})
			}
			if (this.$store.state.address) {
				queryBankAllBalances(this.client, this.$store.state.address).then(res => {
                    let tokenAllBalanceMap = new Map()
					if (res && res.balancesList) {
                        res.balancesList.forEach(item => {
                            tokenAllBalanceMap.set(item.denom, item)
						})
					}
					if (data && data.length) {
                        for (let farmItem of data) {
                            let lpDenom = ''
							if (configMap?.size && farmItem?.code) {
								if (configMap.has(farmItem.code)) {
									lpDenom = configMap.get(farmItem.code).lpt
								}
							}
							if (tokenAllBalanceMap.has(lpDenom)) {
								farmItem.lpBalance = tokenAllBalanceMap.get(lpDenom) && tokenAllBalanceMap.get(lpDenom).amount ? tokenAllBalanceMap.get(lpDenom).amount : ''
							} else {
								farmItem.lpBalance = 0
							}
						}
					}
                    this.allPoolList = data?.map(item => {
                        let poolItem = item;
                        return poolItem;
                    })
                    if(this.allPoolList.length) {
                        sessionStorage.setItem("allFarmsList", JSON.stringify({
                            allPoolList: this.allPoolList,
                            updateTime: new Date().getTime()
                        }))
                    }
				})
			} else {
                this.allPoolList = data?.map(item => {
                    let poolItem = item;
                    return poolItem;
                })
                if(this.allPoolList.length) {
                    sessionStorage.setItem("allFarmsList", JSON.stringify({
                        allPoolList: this.allPoolList,
                        updateTime: new Date().getTime()
                    }))
                }
			}
		},
		filterFinishedPool(poolList,poolStatus){

			const earnIrisData = poolList.filter(item => !item.status  && item.activityOn)
			const finishedData = poolList.filter(item => item.status)
			this.farmList = [...earnIrisData,...finishedData]

		},
		getFarmList(address) {
			queryFarmList(address).then(res => {
                if (res.code && res.code === poolsErrorCode) {
                    console.log('error');
				} else {
					if (res?.data?.pools?.length) {
						this.$store.commit('isShowErrorImg', false)
						let coinsMap = new Map()
						if (this.tokenConfig?.length) {
							for (const coinsConfigElement of this.tokenConfig) {
								coinsMap.set(coinsConfigElement.denom, coinsConfigElement)
							}
						}
						let farmList = res.data.pools.map(item => {
                            let rewardDenom = '';
							if (item?.reward) {
                                if(item.reward.indexOf(',') !== -1) {
                                    const rewardsArr = item.reward.split(',');
                                    let rewardDenomArr = rewardsArr.map(iReward => {
                                        return coinsMap && coinsMap.has(iReward) ? coinsMap.get(iReward).symbol.toUpperCase() : iReward.toUpperCase();
                                    })
                                    rewardDenom = rewardDenomArr.join(' & ');
                                } else {
                                    rewardDenom = coinsMap && coinsMap.has(item.reward) ? coinsMap.get(item.reward).symbol.toUpperCase() : item.reward.toUpperCase()
                                }
							}
							let lpToken = ''
							if(item?.code && coinsMap?.has(item.code)){
                                lpToken = coinsMap.get(item.code)?.lpt
							}
                            let lpStaked = '0';
                            let earned = [];
                            this.rewardsList?.forEach(reward => {
                                if(reward.poolId === item.id) {
                                    lpStaked = reward.lpStaked;
                                    earned = reward.earned;
                                }
                            })
							let obj = {
								code: item.code,
								reward: item.reward,
								id: item.id,
								txName: item?.name || '',
								img: item.icon || this.defaultImageSrc,
								lpStaked: lpStaked,
								earned: earned,
								lpBalance: '',
								lpToken:lpToken,
								status: item.status,
								activityOn: item.activity_on,
								informationList: [

									{
										label: 'Total Liquidity',
										value: item?.volume_locked >= 0 ? item?.volume_locked : '',
										isTooltip: false
									}
								]
							}
							return obj
						})
						if (farmList && farmList.length) {
							this.getAllBalance(farmList)
						}
					}
				}
			}).catch(e => {
                console.log('error');
			})
		},
        getFarmRewards(address) {
            queryFarmRewards(address).then(res => {
                if(res?.pools?.length) {
                    this.rewardsList = res?.pools?.map(item => {
                        let reward = {
                            poolId: item?.pool_id || '',
                            lpStaked: item?.staked || '0',
                            earned: item?.earned || []
                        }
                        return reward;
                    })
                    if(this.rewardsList.length) {
                        sessionStorage.setItem('allRewardsList', JSON.stringify(this.rewardsList))
                    }
                } else {
                    this.rewardsList = [];
                    sessionStorage.setItem('allRewardsList', JSON.stringify([]))
                }
            }).catch(e => {
				console.log(e);
			})
        },
        storagePoolsRewards(farmList, rewardsList) {
            if(farmList.length) {
                let allPoolList = farmList.map(farmItem => {
                    let earned = [];
                    let lpStaked = '0';
                    rewardsList?.forEach(item => {
                        if(item?.poolId === farmItem?.id) {
                            earned = item?.earned;
                            lpStaked = item?.lpStaked;
                        }
                    })
                    let obj = {
                        ...farmItem,
                        earned: earned,
                        lpStaked: lpStaked,
                    }
                    return obj;
                })
                if(allPoolList.length) {
                    sessionStorage.setItem("allFarmsList", JSON.stringify({
                        allPoolList,
                        updateTime: new Date().getTime()
                    }))
                }
            }
            let data = JSON.parse(sessionStorage.getItem('allFarmsList'))?.allPoolList;
            this.filterFinishedPool(data, this.option)
        }
	},
	beforeDestroy() {
		clearInterval(this.farmTimer)
	}
}
</script>

<style scoped lang="scss">
.farm_list_container {
	margin-top: 0.4rem;
	@media (max-width: 500px) {
		margin-top: 0.24rem;
	}
	.farm_list_content_wrap {
		margin-bottom: 1rem;

		.farm_list_item_content {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-column-gap: 0.36rem;
			grid-row-gap: 0.36rem;
			margin: 0 0.16rem;
			@media (max-width: 1200px) {
				grid-template-columns: repeat(2, 1fr);
				grid-row-gap: 0.36rem;
				justify-items: center;
				align-items: center;
				max-width: 70%;
				margin: 0 auto;
			}
			@media (max-width: 1034px) {
				max-width: 80%;
			}
			@media (max-width: 914px) {
				max-width: 90%;
			}
			@media (max-width: 807px) {
				max-width: 100%;
			}
			@media (max-width: 820px) {
				grid-template-columns: repeat(1, 1fr);
			}
			@media (max-width: 375px) {
				margin: 0 0.16rem;
			}

			.farm_list_item {
				border-radius: var(--borderRadius8);
				background: var(--bgWhiteColor);
				box-sizing: border-box;
				padding: var(--boxPadding24);
				@media (max-width: 1200px) {
					width: 3.46rem;
				}
				@media (max-width: 375px) {
					width: 100%;
					margin: 0 0.16rem;
					padding: var(--boxPadding16);
				}
			}

			.wallet_connect_button_content {
				margin-top: 0.16rem;
			}
		}
	}
}
</style>
