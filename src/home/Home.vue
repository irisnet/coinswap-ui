<template>
	<div class="home_container">
		<div class="home_content_wrap">
			<div class="home_balance_content">
				<div class="home_balance_content_wrap">
					<home-total-value-locked></home-total-value-locked>
					<home-balance-modul :balance="balance"></home-balance-modul>
				</div>
				<div class="coins_table_content">
					<vuescroll :ops="opsConfig">
						<coins-table :key="$store.state.isConnected"
						             :is-connect-wallet='$store.state.isConnected'
							         :isloading="isLoading"
							         :table-list="coinListData"
						             :column-list="columuList"></coins-table>
					</vuescroll>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import HomeBalanceModul from "./modul/HomeBalanceModul";
import HomeTotalValueLocked from "./modul/HomeTotalValueLocked";
import {getClient, singleConfig} from "../util/sdkHelper";
import Tools from "../util/utils";
import vuescroll from 'vuescroll';
import CoinsTable from "./modul/coinsTable";
import {queryCoins,queryPrice} from "../server/api";
import updatePrice from "../util/updatePrice";
export default {
	name: "Home",
	components: {CoinsTable, vuescroll, HomeTotalValueLocked, HomeBalanceModul},
	data() {
		return {
			balance: "0",
			coinListData: [],
			updateBalanceTimer: null,
			isLoading: false,
			opsConfig: {
				rail: {
					opacity: 1,
					background: '#E6E6E6',
					// border: '1px solid #cecece',
					size: '6px',
				},
				bar: {
					keepShow: true,
					size: '6px',
					minSize: 0.1,
					background: '#cdcdcd',
				},
				vuescroll: {
					wheelScrollDuration: 0,
					wheelDirectionReverse: false,
					locking: true,
					checkShifKey: true
				}
			},
			columuList: [
				{
					label: 'Coin',
					value: '',
					isNeedSort: true,
					width: '180',
					sortName:'coin'
				},
				{
					label: 'Price',
					value: 'formatPrice',
					isNeedSort: true,
					isRight: true,
					width: '180',
					sortName:'price'
				},
				{
					label: 'Balance',
					value: 'displayBalance',
					isNeedSort: true,
					isRight: true,
					width: '220',
					sortName:'balance'
				},
				{
					label: '',
					value: '',
					width: '210'
				},
				{
					label: 'WithDraw',
					value: '',
					width: '210'
				}
			],
            client: null
		}
	},
	watch: {
		'$store.state.tokenList': {
			deep: true,
			 handler(newValue, oldValue) {
				if (newValue?.length) {
					this.setCoinBalance(newValue)
				}
			}
		}
	},
	async mounted() {
		updatePrice()
		this.isLoading = true
		let coinList = this.getConfigFromLocalStorage()
		this.setCoinBalance(coinList)
		this.updateBalanceTimer = setInterval(async () => {
			coinList = this.getConfigFromLocalStorage()
			updatePrice()
			this.setCoinBalance(coinList)
		},10000)
        this.client = await getClient(singleConfig)
	},
	methods: {
		getConfigFromLocalStorage() {
			return localStorage.getItem('config')?.length || JSON.stringify(localStorage.getItem('config') !== '{}')
				? JSON.parse(localStorage.getItem('config')) : null;
		},
		async setCoinBalance(coinList){
			const addressAllBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
			const allCoinPrice = sessionStorage.getItem('coinPrice') ?  JSON.parse(sessionStorage.getItem('coinPrice') ): null

			let addressAllBalanceMap = new Map(),priceMap = new Map();

			if (!coinList?.length) {
				coinList = await queryCoins().catch(error => {
					console.log(error)
				})
				coinList = coinList.filter(item => !item.offline)
			}
			if (addressAllBalance?.balances?.balancesList?.length) {
				addressAllBalance.balances.balancesList.forEach(item => {
					if (item?.denom) {
						addressAllBalanceMap.set(item.denom, item)
					}
				})
			}else {
				if(this.$store.state.address){
					this.client.bank.queryAllBalances(this.$store.state.address).then(res => {
						let addressLpBalance = {
							address: this.$store.state.address,
							balances: res
						}

						sessionStorage.setItem('farmLpBalance', JSON.stringify(addressLpBalance))
                        this.$store.commit('addressLpBalance', addressLpBalance)
						if (res) {
							res.balancesList.forEach(item => {
								addressAllBalanceMap.set(item.denom, item)
							})
						}
					}).catch(error =>{
						console.log(error)
					})
				}
			}
			if(allCoinPrice?.coins?.length){
				allCoinPrice.coins.forEach( item => {
					if(item?.denom && item.price && Number(item.price) >= 0) {
						priceMap.set(item.denom,item.price)
					}
				})
			}else {
				const allCoinPrice = await queryPrice().catch(error => {console.error(error)})
				if(allCoinPrice?.coins?.length){
					allCoinPrice.coins.forEach( item => {
						if(item?.denom && item.price && Number(item.price) >= 0) {
							priceMap.set(item.denom,item.price)
						}
					})
				}
			}

			if (coinList?.length) {
				this.coinListData = coinList.map(item => {
					item.displayBalance = 0
					item.balanceValue = `0`
					item.amountValue = 0
					if (priceMap.has(item.denom)) {
						item.price = priceMap.get(item.denom)
						item.formatPrice = `$ ${ priceMap.get(item.denom) > 0.01 ? this.formatNumber(priceMap.get(item.denom)): Number(this.formatNumber(priceMap.get(item.denom)))}`

					}
					if (item?.denom && addressAllBalanceMap.has(item.denom)) {
						let amount = Tools.maxToMin(item, addressAllBalanceMap.get(item.denom).amount)
						amount = Tools.formatDecimalPartToLong(amount)
						item.displayBalance = amount
						let displayPrice  = 0;
						if (item?.price && Number(item?.price) < 0.01) {
							displayPrice = Tools.formatBigNumber(item.price, 6)
						}
						if (item?.price && Number(item?.price) > 0.01) {
							displayPrice = Number(item.price).toFixed(4)
						}
						let amountValue = Tools.bigNumberMultiply(amount, displayPrice)
						item.balanceNumber = addressAllBalanceMap.get(item.denom).amount
						item.balance = item.balanceNumber
						item.amountValue = amountValue || 0
						if (amountValue) {
							item.balanceValue = `$ ${this.formatNumber(amountValue)}`
						}
					}
					return item
				})
			}
			const balanceValue =  this.coinListData.reduce((total,item) => {
				return  Number(item.amountValue) + Number(total)
			}, 0)
			this.balance  = this.formatNumber(balanceValue)
			this.isLoading = false
		},
		formatNumber(price) {
			if (price && Number(price) <= 0.01) {
				return `${Tools.formatBigNumber(price, 6)}`
			}
			if (price && Number(price) > 0.01) {
				return `${Tools.formatBigNumber(price, 4).replace(/(?:\.0*|(\.\d+?)0+)$/,'$1')}`
			}
		}
	},
	beforeDestroy(){
		clearInterval(this.updateBalanceTimer)
	}
}
</script>

<style scoped lang="scss">
.home_container {
	width: 100%;

	.home_content_wrap {
		max-width: 12rem;
		margin: 0 auto 1rem auto;

		.home_balance_content {
			display: flex;
			flex-direction: column;

			.home_balance_content_wrap {
				margin: 0 auto;
				display: flex;
				flex-direction: row;
				justify-content: center;
				box-sizing: border-box;
				padding-top: 0.4rem;
				@media (max-width: 1010px) {
					width: auto;
					margin: 0 0.2rem;
				}
				@media (max-width: 800px) {
					flex-direction: column;
				}
			}

			:deep(.coins_table_content) {
				width: 100%;
				max-width: 1000px;
				margin: 0.24rem auto auto auto;
				background: #fff;
				border-radius: var(--borderRadius8);
				overflow: hidden;
				@media (max-width: 1010px) {
					width: auto;
					margin: 0.24rem 0.24rem auto 0.24rem;
				}
				.__vuescroll {
					overflow: visible !important;
					.__panel {
						scrollbar-width: none;
						-ms-overflow-style: none;
						scrollbar-color: transparent transparent !important;
						scrollbar-track-color: transparent !important;
						-ms-scrollbar-track-color: transparent !important;
						&::-webkit-scrollbar {
							width: 0 !important
						}
					}
				}
			}
		}
	}
}
</style>
