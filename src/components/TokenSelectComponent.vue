<template>
	<div class="token_select_container">
		<div class="token_select_content">
			<div class="token_select_title_content">
				<div class="token_select_title_left_content">
					<span class="token_select_title">{{$t('TokenListBox.title')}}</span>
					<span class="token_select_tooltip_content">
						<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
						<div class="token_tooltip_content">
							{{$t('TokenListBox.tip')}}
						</div>
					</span>
				</div>
				<div class="token_select_close_icon" @click.stop="closeSelectTokenWindow">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</div>
			</div>
			<div class="token_search_ipt_content">
				<input class="token_search_ipt" v-model="iptValue" placeholder="Search name"/>
			</div>
			<div class="token_sort_list_content">
				<span class="token_sort_list_label">{{$t('TokenListBox.tokenName')}}</span>
<!--				<span class="token_sort_icon" @click="sortToken()">-->
<!--					<iconfont-component :icon-name="tokenDes ? 'icon-daoxu':'icon-zhengxu'"></iconfont-component>-->
<!--				</span>-->
			</div>
			<ul class="token_list_content">
				<li class="token_item"
				    v-for="(item,index) in copyTokenList"
				    :key="index"
				    @click="selectToken(item)">
					<div class="token_item_left_content">
						<span class="token_item_logo">
							<img :src="setImage(item)" alt="">
						</span>
						<span class="token_item_name"
						      :class="item.isFrom || item.isTo ? 'select_token' : 'un_select_token'">{{ item.symbol ? item.symbol.toUpperCase() :''}}</span>
						
					</div>
					<div class="token_item_balance"
					     :class="item.isSelect ? 'select_token' : 'un_select_token'">{{$store.state.isConnected ?  Tools.formatDecimalPartToLong(Tools.formatBigNumber(formatBalance(item))) || ''  : ''}}</div>
				</li>
			</ul>
		</div>
	</div>
	
</template>

<script>
	import IconfontComponent from "./IconfontComponent";
	import Tools from "../util/utils";
	import {getClient, singleConfig} from "../util/sdkHelper";
	export default {
		name: "TokenSelectComponent",
		components: {IconfontComponent},
		data() {
			return {
				Tools,
				copyTokenList:[],
				iptValue:'',
				tokenDes:false,
				tokenList: this.$store.state.tokenList,
				isSelected: false,
				selectedFromData: null,
				selectedToData: null,
				defaultImageSrc:require('../assets/img/logo/LOGO_Dafult.png'),
                client: null
			}
		},
		props:{
			isFrom:{
				type:Boolean,
			},
			isTo: {
				type: Boolean
			}
		},
        computed: {
            setImage() {
                return function(item) {
                    const configs = JSON.parse(localStorage.getItem('config'));
                    let image = '';
                    configs.forEach(config => {
                        if(config?.symbol == item?.symbol) {
                            image = config.icon;
                        }
                    })
                    return image ? image : this.defaultImageSrc;
                }
            }
        },
		async mounted(){
			document.getElementsByClassName('token_select_container')[0].style.height = document.getElementById("app").scrollHeight + 'px';
			if(this.$store.state.selectedFromToken && this.$store.state.tokenList){
				this.$store.state.tokenList.forEach( item => {
					item.isFrom = false
					if(item.minUnit === this.$store.state.selectedFromToken.minUnit){
						item.isFrom = true
					}
				})
			}
			if(this.$store.state.selectedToToken && this.$store.state.tokenList){
				this.$store.state.tokenList.forEach( item => {
					item.isTo = false
					if(item.minUnit === this.$store.state.selectedToToken.minUnit){
						item.isTo = true
					}
				})
			}
			if(this.$store.state.tokenList){
				this.$store.state.tokenList.forEach( item => {
					if(this.$store.state.selectedFromToken
						&& this.$store.state.selectedFromToken.denom
						&& this.$store.state.selectedFromToken.denom === item.denom){
						item.isFrom = this.$store.state.selectedFromToken.isFrom
					}
					if(this.$store.state.selectedToToken
						&& this.$store.state.selectedToToken.denom
						&& this.$store.state.selectedToToken.denom === item.denom){
						item.isTo = this.$store.state.selectedToToken.isTo
					}
					item.iptValue = ''
				})
				this.copyTokenList = this.$store.state.tokenList
			}
			this.client = await getClient(singleConfig)
		},
		watch:{
			'$store.state.tokenList':{
				handler(newValue,oldValue){
					const currentAddressBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
					let currentAddressBalanceMap = new Map()
					if(currentAddressBalance?.balances?.balancesList){
						currentAddressBalance.balances.balancesList.forEach( item => {
							if(item.denom){
								currentAddressBalanceMap.set(item.denom,item)
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
										currentAddressBalanceMap.set(item.denom, item)
									})
								}
							}).catch(error =>{
								console.log(error)
							})
						}
					}
					if(newValue?.length){
						newValue.forEach(item => {
							if(currentAddressBalanceMap.has(item.denom)){
								item.balance = currentAddressBalanceMap.get(item.denom).amount
							}else {
								item.balance = '0'
							}
					})
					}
					this.copyTokenList = newValue
					if(this.iptValue){
						this.copyTokenList = newValue.filter((item) => {
							return item.symbol.toUpperCase().includes(this.iptValue.toUpperCase())
						})
					}
				},
				deep:true
			},
			iptValue(){
				this.copyTokenList = this.tokenList.filter((item) => {
					return item.symbol.toUpperCase().includes(this.iptValue.toUpperCase())
				})
			},
			'$store.state.isSelectToken'() {
				if(this.$store.state.isSelectToken) {
					document.getElementsByClassName('token_select_container')[0].style.height = document.getElementById("app").scrollHeight + 'px';
				}
			}
		},
		methods:{

			formatBalance(item){
				let balance = 0
				if(item.balance){
					balance = Tools.formatDecimal(Tools.maxToMin(item,item.balance),Number(item.scale) || 6)
				}
				return balance
			},
			selectToken(data){
				
				if(this.$store.state.isStartSelectAddLiquidity){
					if(data.isBaseToken){
						return;
					}else {
						let baseToken = this.$store.state.tokenList.filter( item => item.isBaseToken)
						let unBaseToken = this.$store.state.tokenList.filter( item => !item.isBaseToken)
						baseToken.isBaseToken = true
						baseToken.isFrom = true
						unBaseToken.forEach( item => {
							item.isTo = ''
							item.isFrom = ''
							if(item.symbol === data.symbol){
								item.isTo = true
							}
						})
						let newTokenList = [...baseToken,...unBaseToken]
					}
					this.$store.commit('isSelectAddLiquidity',true)
					this.$store.commit('selectedAddLiquidityToken',data)
					
				}else {
					
					if(this.$store.state.selectedFromToken && this.$store.state.selectedFromToken.denom === data.denom){
						if(this.$store.state.selectedToToken){
						}else {
							this.$store.commit('selectedFromToken',this.$store.state.selectedToToken)
							this.$store.commit('selectedToToken',data)
							this.$store.state.tokenList.forEach( item => {
								if(item.symbol === data.symbol){
									item.isFrom = ''
									item.isTo = true
								}
								if(item.symbol === this.$store.state.selectedToToken.symbol){
									item.isFrom = ''
									item.isTo = true
								}
							})
						}
					}else {
						if(this.$store.state.selectedToToken && this.$store.state.selectedToToken.denom === data.denom){
							if(this.$store.state.selectedFromToken){
								let copyData = JSON.parse(JSON.stringify(this.$store.state.selectedFromToken))
								this.$store.commit('selectedFromToken',data)
								this.$store.commit('selectedToToken',copyData)
								this.$store.state.tokenList.forEach( item => {
									if(item.symbol === data.symbol){
										item.isFrom = true
										item.isTo = ''
									}
									if(item.symbol === copyData.symbol){
										item.isFrom = ''
										item.isTo = true
									}
								})
								
							}else {
								this.$store.commit('selectedToToken',null)
								this.$store.commit('selectedFromToken',data)
								this.$store.state.tokenList.forEach( item => {
									if(item.symbol === data.symbol){
										item.isFrom = true
										item.isTo = ''
									}else {
										item.isFrom = ''
									}
								})
							}
							
						}else {
							if(this.$store.state.isFromSelect){
								this.$store.commit('selectedFromToken',data)
								this.$store.state.tokenList.forEach( item => {
									if(item.symbol === data.symbol){
										item.isFrom = true
										item.isTo = ''
									}else {
										item.isFrom = ''
									}
								})
							}
							if(this.$store.state.isToSelect){
								this.$store.commit('selectedToToken',data)
								this.$store.state.tokenList.forEach( item => {
									if(item.symbol === data.symbol){
										item.isFrom = ''
										item.isTo = true
									}else {
										item.isTo = ''
									}
								})
							}
						}
					}
					

				}
				
				setTimeout(() => {
					this.$store.commit('isSelectToken',false)
				},0)
				
			},
			closeSelectTokenWindow(){
				this.$store.commit('isSelectToken',false)
			},
			sortTokenByNotConnect(){
				this.tokenList.sort((a, b) => {
					let value1 = a.symbol.toLowerCase(), value2 = b.symbol.toLowerCase();
					if (this.tokenDes) {
						if (value1 > value2) {
							return -1
						} else {
							return 1
						}
					} else {
						if (value1 < value2) {
							return -1
						} else {
							return 1
						}
					}
				})
				this.tokenList = this.tokenList
			},
			sortTokenByConnected(){
				let balanceTokenList = this.tokenList.filter(( item ) => {
					return item.balance
				})
				let needSortTokenList = this.tokenList.filter(( item ) => {
					return !item.balance
				})
				let sortedTokenList;
				sortedTokenList = needSortTokenList ? needSortTokenList.sort((a,b) => {
					let value1 = a.symbol.toLowerCase(), value2 = b.symbol.toLowerCase();
					if (this.tokenDes) {
						if (value1 > value2) {
							return -1
						} else {
							return 1
						}
					} else {
						if (value1 < value2) {
							return -1
						} else {
							return 1
						}
					}
				}) : []
				this.tokenList = [...balanceTokenList,...sortedTokenList]
			},
			sortToken() {
				this.tokenDes = !this.tokenDes
				this.copyTokenList = this.tokenList
				if(this.$store.state.isConnected){
					this.sortTokenByConnected()
				}else {
					this.sortTokenByNotConnect()
				}
			}
		}
	}
	
</script>

<style scoped lang="scss">
.token_select_container{
	position: fixed;
	left: 0;
	top:0;
	background: var(--markBgColor);
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
	.token_select_content{
		width: 4rem;
		height: 5.68rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		padding:var(--boxPadding24) 0;
		@media (max-width: 432px) {
		    width: 100%;
			margin: 0 0.16rem;
		}
		.token_select_title_content{
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-sizing: border-box;
			padding: 0 var(--boxPadding24);
			.token_select_title_left_content{
				display: flex;
				align-items: center;
				.token_select_title{
					font-size: var(--fontSize20);
					color: var(--fontColorBlack);
					font-weight: var(--fontWt600);
					line-height: var(--lineHeight32);
				}
				.token_select_tooltip_content{
					width: 0.16rem;
					height: 0.16rem;
					margin-left: 0.16rem;
					position: relative;
					cursor: pointer;
					&:hover{
						.token_tooltip_content{
							display: block;
							
						}
					}
					.token_tooltip_content{
						display: none;
						position: absolute;
						left: 0.3rem;
						bottom:-0.12rem;
						background: var(--bgWhiteColor);
						width: 2.32rem;
						border-radius: var(--borderRadius8);
						box-sizing: border-box;
						padding: var(--boxPadding16);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						&:after{
							content:url("../assets/img/tips_icon.png");
							position:absolute;
							left: -0.08rem;
							bottom: 0.05rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
						}
						@media (max-width: 520px) {
							left: -1.5rem;
							bottom: -1.9rem;
							z-index: 10;
							&:after{
								content:url("../assets/img/tips_icon.png");
								position:absolute;
								left: 1.55rem;
								bottom:1.67rem;
								transform: rotate(90deg);
								color: rgba(226, 233, 255, 1);
								z-index: 10;
							}
						}
					}
				}
			}
			.token_select_close_icon{
				width: 0.16rem;
				height: 0.16rem;
				cursor: pointer;
				
			}
		}
		.token_search_ipt_content{
			margin-top: 0.08rem;
			box-sizing: border-box;
			padding: 0 var(--boxPadding24);
			.token_search_ipt{
				width: 100%;
				height: 0.36rem;
				border-radius: var(--borderRadius8);
				box-sizing: border-box;
				padding: var(--boxPadding16);
				border-color: var(--searchBorderColor);
				border-width: 0.01rem;
				border-style: solid;
			}
		}
		.token_sort_list_content{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 0.08rem;
			border-bottom: 0.01rem solid var(--searchBorderColor);
			box-sizing: border-box;
			margin: 0.14rem 0.24rem  0 0.24rem;
			.token_sort_list_label{
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
			}
			.token_sort_icon{
				display: inline-block;
				width: 0.24rem;
				height: 0.24rem;
				cursor: pointer;
			}
		}
		.token_list_content{
			margin-top: 0.15rem;
      height: 4rem;
      overflow-y:auto;
			.token_item{
				display: flex;
				align-items: center;
				justify-content: space-between;
				box-sizing: border-box;
				padding: 0.08rem var(--boxPadding24);
				cursor: pointer;
				&:hover{
					background: var(--btnHoverColor);
				}
				.token_item_left_content{
					display: flex;
					align-items: center;
					.token_item_logo{
						display: inline-block;
						width: 0.24rem;
						height: 0.24rem;
						img{
							width: 100%;
						}
					}
					.token_item_name{
						margin-left: 0.16rem;
						color: var(--fontColorBlack65);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						font-weight:  var(--fontWt400) ;
					}
					.select_token{
						color: var(--fontColorBlack3) !important;
					}
				}
				.token_item_balance{
					color: var(--fontColorBlack65);
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
				}
				.select_token{
					color: var(--fontColorBlack3) !important;
				}
			}
		}
	}
}
</style>
