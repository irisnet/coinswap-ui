<template>
	<div class="farm_base_detail">
		<div class="farm_base_logo_container">
			<div class="farm_base_logo_content">
				<img v-show="information.img" :src="information.img" alt="">
			</div>
			<div class="farm_base_tx_content">
                <span v-show="information.txName !== 'Coming Soon'" class="farm_base_tx_title_content"  :class="information.txName !== 'Coming Soon' ? 'cursor_pointer' : ''">
                    <span>{{information.txName}}</span>
                </span>
                <p v-show="information.txName === 'Coming Soon'" class="farm_base_tx_title_content" @click="setLiquidityToken(information)">{{information.txName}}</p>
                <p v-show="information.status !== 1" class="farm_base_pool_id_content">Pool <span class="pool_id">{{formatPoolIdByNumberPart(`${information.id}`)}}</span></p>
				<div class="tag_content" v-show="information.status === 1">
					<div class="tag_content_wrap">
						<span class="iconfont icon-tishi"></span>
						<span class="tag_text">Finished</span>
					</div>
				</div>
<!--				<p class="farm_base_tooltip_content" :style="{visibility:information.reward == 'uiris' ? 'visible' :'hidden'}">
					<span class="farm_base_ratio_content">{{information.radio}}</span>
					<span class="farm_base_ratio_icon">
						<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
						<div class="farm_base_tooltip">
							{{$t('farm.baseDetail.farmTip')}}
						</div>
					</span>
				</p>-->
			</div>
		</div>
		<ul class="farm_base_information_detail_content">
			<li class="farm_base_information_item" v-for="(item,index) in information.informationList" :key="index">
				<span class="farm_base_information_label">
					{{item.label}}
					<i class="farm_base_information_icon" v-show="item.isTooltip">
						<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
						<div class="apy_base_tooltip">
							{{$t('farm.baseDetail.apyTip')}}
						</div>
					</i>
				</span>
				<span class="farm_base_information_value" :class="item.value ? '' : item.value !==0 ? baseDetailStyleClass[item.label] : ''">
					<span class="total_liquidity_icon" v-show="item.label === 'Total Liquidity' && item.value >= 0 && item.value !== ''">$ </span>
					<span :class="item.label === 'Earn' ? 'earn_value' : ''">{{item.label === 'Total Liquidity' ? formatNumberToStr(item.value) : item.value}}</span>
					<span v-show="item.label === 'APY'&& item.value >= 0 " >%</span>
				</span>
			</li>
		</ul>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import Tools from "@/util/utils";
	export default {
		name: "FarmBaseDetail",
		components: {IconfontComponent},
		data(){
			return {
				baseDetailStyleClass:{
					Deposit:"deposit_style",
					Earn:'earn_style',
					APY:'apy_style',
					'Total Liquidity':'total_style',
				}
			}
		},
		methods:{
			formatNumberToStr(value){
				return Tools.formatBigNumber(value,0)
			},
            formatPoolIdByNumberPart(poolId){
                return Tools.formatPoolId(poolId)
            },
            setLiquidityToken(currentFarmInfo){
				let tokenList = JSON.parse(localStorage.getItem('config'))
				let currentFramTokenDenom = null
				if(tokenList && tokenList.length && currentFarmInfo){
					currentFramTokenDenom = tokenList.filter( item => item.denom === currentFarmInfo.code)
				}
				if(currentFramTokenDenom && currentFramTokenDenom.length){
					let liquidityTokenData = this.$store.state.tokenList.filter( item => item.symbol === currentFramTokenDenom[0].symbol)
					if(liquidityTokenData.length){
						const standardInputToken = (this.$store.state.tokenList || []).filter(token => token.isBaseToken)
						if(standardInputToken && standardInputToken[0]) {
							this.$store.commit('standardInputToken',standardInputToken[0])
						}
						this.$router.push('add')
						setTimeout(() => {
							this.$store.commit('isSelectAddLiquidity',true)
							this.$store.commit('isStartSelectAddLiquidity',true)
							this.$store.commit('selectedAddLiquidityToken',liquidityTokenData[0])
						},200)
					}
				}
			},
		},
		props:{
			information:{
				type:Object
			}
		}
	}
</script>

<style scoped lang="scss">
	.farm_base_detail{
		margin-bottom: 0.16rem;
		.farm_base_logo_container{
			display: flex;
			justify-content: space-between;
			align-items: center;
			.farm_base_logo_content{
				height: 0.72rem;
				img{
					height: 100%;
					@media (max-width: 375px) {
						height: 90%;
					}
				}

			}
			.farm_base_tx_content{
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				.tag_content{
					width: 1.5rem;
					margin-top: 0.08rem;
					background: yellow;
					right: -0.32rem;
					position: relative;
					background: url("../../assets/img/farm/tip_finished.png") no-repeat center center;
					background-size: cover;
					display: flex;
					align-items: center;
					justify-content: center;
					@media( max-width: 376px) {
						right: -0.24rem;
					}
					.tag_content_wrap{
						padding: 0.06rem 0;
						line-height: var(--fontSize16);
						.iconfont{
							font-size: var(--fontSize16);
							line-height: var(--fontSize16);
							color: var(--fontColor1);
						}
						.tag_text{
							margin-left: 0.08rem;
							font-size: var(--fontSize16);
							line-height: var(--fontSize16);
							color: var(--fontColor1);
						}
					}
				}
				.farm_base_tx_title_content{
                    display: flex;
                    align-items: center;
					font-size: var(--fontSize28);
					color: var(--fontColorBlack);
					line-height: var(--lineHeight32);
                    .tx_title_icon {
                        margin-left: 0.04rem;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 0.2rem;
                        height: 0.2rem;
                        background-color: var(--bgLinkColor);
                        border-radius: var(--borderRadius4);
                        .icon {
                            width: 0.1rem;
                            height: 0.1rem;
                        }
                    }
				}
                .farm_base_pool_id_content {
                    margin-top: 0.12rem;
                    font-size: var(--fontSize16);
                    color: var(--fontColorBlack65);
                    line-height: var(--lineHeight16);
                    .pool_id {
                        color: var(--hoverColor);
                    }
                }
				.farm_base_tooltip_content{
					display: flex;
					justify-content: flex-end;
					margin-top: 0.08rem;
					align-items: center;
					.farm_base_ratio_content{
						border-radius: 0.16rem;
						padding: 0.04rem 0.14rem;
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						border: 0.01rem solid rgba(247, 181, 0, 1);
						color: rgba(247, 181, 0, 1);
					}
					.farm_base_ratio_icon{
						margin-left: 0.08rem;
						display: inline-block;
						width: 0.24rem;
						height: 0.24rem;
						position: relative;
						cursor: pointer;
						&:hover{
							.farm_base_tooltip{
								display: block;
							}
						}
						.farm_base_tooltip{
							display: none;
							background: var(--bgWhiteColor);
							position: absolute;
							right: 0.34rem;
							bottom: -0.1rem;
							width: 2.32rem;
							border-radius: var(--borderRadius8);
							box-sizing: border-box;
							padding: var(--boxPadding16);
							font-size: var(--fontSize16);
							line-height: var(--lineHeight20);
							color: var(--fontColorBlack65);
							border: 0.01rem solid var(--tooltipBoxBorderColor);
							z-index: 20;
							&:after{
								content:url("../../assets/img/tips_icon.png");
								position:absolute;
								right: -0.08rem;
								bottom: 0.09rem;
								color: rgba(226, 233, 255, 1);
								z-index: 10;
								transform: rotate(180deg);
							}
							@media (max-width: 820px) {
								left: -2.4rem;
								bottom: -0.1rem;
								&:after{
									left: 2.3rem;
									transform: rotate(180deg);
									bottom: 0.1rem;
								}
							}
						}
					}
				}
			}
		}
		.farm_base_information_detail_content{
			display: flex;
			flex-direction: column;
			margin-top: 0.24rem;
			.farm_base_information_item{
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.08rem;
				.farm_base_information_label{
					color: var(--fontColorBlack65);
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
					.farm_base_information_icon{
						display: inline-block;
						width: 0.16rem;
						height: 0.16rem;
						position: relative;
						&:hover{
							.apy_base_tooltip{
								display: inline-block;
							}
						}
						.apy_base_tooltip{
							display: none;
							background: var(--bgWhiteColor);
							position: absolute;
							left: 0.3rem;
							bottom: -0.06rem;
							width: 2rem;
							border-radius: var(--borderRadius8);
							box-sizing: border-box;
							padding: var(--boxPadding16);
							font-size: var(--fontSize16);
							line-height: var(--lineHeight20);
							color: var(--fontColorBlack65);
							border: 0.01rem solid var(--tooltipBoxBorderColor);
							z-index: 20;
							&:after{
								content:url("../../assets/img/tips_icon.png");
								position:absolute;
								left: -0.08rem;
								bottom: 0.05rem;
								color: rgba(226, 233, 255, 1);
								z-index: 10;
							}
						}
					}
				}
				.farm_base_information_value{
					color: var(--hoverColor);
					font-size: var(--fontSize14);
					line-height: var(--lineHeight20);
					.total_liquidity_icon{
						color: var(--fontColorBlack65);
					}
                    .earn_value {
                        font-weight: bold;
                    }
				}
				.deposit_style{
					width: 1.48rem;
					height: 0.18rem;
					background: rgba(241, 243, 254, 1);
					border-radius: var(--borderRadius4);
				}
				.earn_style{
					width: 0.64rem;
					height: 0.18rem;
					background: rgba(241, 243, 254, 1);
					border-radius: var(--borderRadius4);
				}
				.apy_style{
					width: 0.86rem;
					height: 0.18rem;
					background: rgba(241, 243, 254, 1);
					border-radius: var(--borderRadius4);
				}
				.total_style{
					width: 0.86rem;
					height: 0.18rem;
					background: rgba(241, 243, 254, 1);
					border-radius: var(--borderRadius4);
				}
			}
			.farm_base_information_item:last-child{
				margin-bottom: 0;
			}
		}
	}
</style>
