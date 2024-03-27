<template>
	<div class="remove_content_container">
		<div class="remove_container_wrap">
			<div class="remove_container">
				<div class="remove_content_wrap">
					<div class="remove_content_wrap_container">
						<div class="remove_content">
							<div class="remove_content_nav">
							<span @click.stop="goPool()">
								<iconfont-component class="houtui" icon-name="icon-houtui"></iconfont-component>
							</span>
								<span>{{ $t('pool.remove.title') }}</span>
								<div class="tooltip_content_icon">
									<iconfont-component class="bangzhu" icon-name="icon-bangzhu"></iconfont-component>
									<div class="tooltip_content">
										{{$t("pool.remove.removeLiquiditytip")}}
									</div>
								</div>
							</div>
							<div class="remove_content_detail">
								<div class="remove_content_detail_amount">
									<span>{{$t("pool.remove.amount")}}</span>
									<span class="number">{{currentPercent}}%</span>
								</div>
								<ul class="remove_content_detail_amount_button">
									<li @click.stop="changeCurrentPercent({number:25})"
									    :class="25 == currentPercent ? 'select' : '' ">25%
									</li>
									<li @click.stop="changeCurrentPercent({number:50})"
									    :class="50 == currentPercent ? 'select' : '' ">50%
									</li>
									<li @click.stop="changeCurrentPercent({number:75})"
									    :class="75 == currentPercent ? 'select' : '' ">75%
									</li>
									<li @click.stop="changeCurrentPercent({number:100})"
									    :class="100 == currentPercent ? 'select' : '' ">Max
									</li>
									<li class="last">
										<input id="number" ref="inputPercent" class="last_input" type="text"
										       v-model.lazy="currentPercent" @input="limitInput"
										       @keypress="cancelCursor" @blur="checkValue">
										<label for="number">%</label>
										<div class="last_icon">
											<i class="iconfont icon-zhankai rotate"
											   @click.stop="changeCurrentPercent({add:'add'})"></i>
											<i class="iconfont icon-zhankai"
											   @click.stop="changeCurrentPercent({sub:'sub'})"></i>
										</div>
									</li>
								</ul>
								<ul class="remove_content_detail_token">
									<li>
										<span class="remove_content_detail_token_denom">{{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(standardAmount,standardDecimalNum)))}}</span>
										<div>
											<span>{{standardDenom || '--'}}</span>
											<img :src="setImageSrc(standardNativeDenom)" alt="">
<!--											<img :src="standardImg || require('@/assets/img/logo/iris_logo.png')"/>-->
										</div>
									</li>
									<li>
										<span class="remove_content_detail_token_denom">{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(tokenAmount,tokenDecimalNum)))}}</span>
										<div>
											<span>{{tokenDenom || '--'}}</span>
											<img :src="setImageSrc(tokenNativeDenom)" alt="">
<!--											<img :src="tokenImg || require('@/assets/img/logo/bnb_logo.png')"/>-->
										</div>
									</li>
								</ul>
								<div class="remove_content_detail_price">
									<span class="remove_content_detail_price_text">{{$t("pool.remove.price")}}</span>
									<div class="remove_content_detail_price_amount">
										<span>{{standardDenom !== '--' ? 1:'--'}} {{standardDenom}} / {{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(tokenRatio,tokenDecimalNum)))}} {{tokenDenom}}</span>
										<span>{{tokenDenom !== '--' ? 1:'--'}} {{tokenDenom}} / {{Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(standardRatio,standardDecimalNum)))}} {{standardDenom}}</span>
									</div>
								</div>
								<!-- class button_forbid -->
								<div class="button_content" @click.stop="removeClick()">{{$t("pool.removeButton")}}
								</div>
							</div>
						</div>
						<your-position
								:selfLiquidity="selfLiquidity"
								:standardImg="setImageSrc(standardNativeDenom)"
								:tokenImg="setImageSrc(tokenNativeDenom)"
								:standardTotalAmount="standardTotalAmount"
								:tokenTotalAmount="tokenTotalAmount"
								:standardDenom="standardDenom"
								:tokenDenom="tokenDenom"
								:standardDecimalNum="standardDecimalNum"
								:tokenDecimalNum="tokenDecimalNum"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../components/IconfontComponent";
	import YourPosition from "./component/YourPosition";
	import Tools from '@/util/utils';
	import {decimalNum} from "@/constant";
	import BigNumber from 'bignumber.js';
	
	export default {
		name: "Remove",
		components: {
			IconfontComponent,
			YourPosition,
		},
		data () {
			return {
				Tools,
				decimalNum,
				removeLiquidityDetail: JSON.parse(sessionStorage.getItem('removeLiquidity') || "{}"),
				currentPercent: 50,
				defaultImageSrc: require('../assets/img/logo/LOGO_Dafult.png')
			}
		},
		computed: {
            setImageSrc () {
                return function(data) {
                    return this.matchLogo(data);
                }
			},
			standardDecimalNum () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.standardDecimalNum) {
					return this.removeLiquidityDetail.standardDecimalNum
				}
				return 6
			},
			tokenDecimalNum () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail?.token?.scale) {
					return this.removeLiquidityDetail?.token?.scale
				}
				return 6
			},
			liquidityTotal () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.liquidityTotal && this.removeLiquidityDetail.liquidityTotal.amount) {
					return this.removeLiquidityDetail.liquidityTotal.amount
				}
				return '--'
			},
			selfLiquidity () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.selfLiquidity && this.removeLiquidityDetail.selfLiquidity.amount) {
					return this.removeLiquidityDetail.selfLiquidity.amount
				}
				return '--'
			},
			sellLiquidity () {
				if (this.selfLiquidity && this.selfLiquidity !== '--') {
					let baseToken = JSON.parse(sessionStorage.getItem('baseToken')) || null
					let formatSelfLiquidity = this.selfLiquidity
					if (baseToken) {
						formatSelfLiquidity = Tools.minToMax(baseToken, this.selfLiquidity)
					}
					const amount = Math.floor(Tools.bigNumberMultiply(formatSelfLiquidity, Tools.bigNumberDivide(this.currentPercent, 100))).toString();
					const denom = this.removeLiquidityDetail.selfLiquidity.denom;
					return {amount, denom}
				}
			},
			standardImg () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.standardImg) {
					return this.removeLiquidityDetail.standardImg
				}
			},
            nativeDenom () {
                if(this.removeLiquidityDetail && this.removeLiquidityDetail.nativeDenom) {
                    return this.removeLiquidityDetail.nativeDenom
                }
            },
			tokenImg () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.tokenImg) {
					return this.removeLiquidityDetail.tokenImg
				}
			},
			standardAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.standard && this.removeLiquidityDetail.standard.amount) {

					const amount = new BigNumber(Tools.bigNumberMultiply(this.poolStandardTotalAmount, Tools.bigNumberDivide(this.sellLiquidity.amount, this.liquidityTotal))).toFixed();
					return amount
				}
				return '--'
			},
			poolStandardTotalAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.standardTotal && this.removeLiquidityDetail.standardTotal.amount) {
					return this.removeLiquidityDetail.standardTotal.amount
				}
				return '--'
			},
			standardTotalAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.standard && this.removeLiquidityDetail.standard.amount) {
					return this.removeLiquidityDetail.standard.amount
				}
				return '--'
			},
			poolTokenTotalAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.tokenTotal && this.removeLiquidityDetail.tokenTotal.amount) {
					return this.removeLiquidityDetail.tokenTotal.amount
				}
				return '--'
			},
			tokenTotalAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.token && this.removeLiquidityDetail.token.amount) {
					return this.removeLiquidityDetail.token.amount
				}
				return '--'
			},
			tokenAmount () {
				if (this.removeLiquidityDetail && this.removeLiquidityDetail.token && this.removeLiquidityDetail.token.amount) {
					const amount = new BigNumber(Tools.bigNumberMultiply(this.poolTokenTotalAmount, Tools.bigNumberDivide(this.sellLiquidity.amount, this.liquidityTotal))).toFixed();
					return amount
				}
				return '--'
			},
			standardDenom () {
				return this.removeLiquidityDetail && this.removeLiquidityDetail.standard && this.removeLiquidityDetail.standard.denom || '--'
			},
			standardNativeDenom () {
				return this.removeLiquidityDetail && this.removeLiquidityDetail.standard && this.removeLiquidityDetail.standard.nativeDenom || '--'
			},
			tokenDenom () {
				return this.removeLiquidityDetail && this.removeLiquidityDetail.token && this.removeLiquidityDetail.token.denom || '--'
			},
			tokenNativeDenom () {
				return this.removeLiquidityDetail && this.removeLiquidityDetail.token && this.removeLiquidityDetail.token.nativeDenom || '--'
			},
			tokenRatio() {
				return Tools.bigNumberDivideToString(Tools.formatDecimal(this.tokenAmount,this.tokenDecimalNum), Tools.formatDecimal(this.standardAmount,this.standardDecimalNum))
			},
			standardRatio() {
				return Tools.bigNumberDivideToString(Tools.formatDecimal(this.standardAmount,this.standardDecimalNum),Tools.formatDecimal(this.tokenAmount,this.tokenDecimalNum))
			},
		},
        watch: {},
        created () {},
		methods: {
            matchLogo(item) {
                const configs = JSON.parse(localStorage.getItem('config')).length ? JSON.parse(localStorage.getItem('config')) : [];
                let image = '';
                configs?.forEach(config => {
                    if(config?.denom == item) {
                        image = config.icon;
                    }
                })
                return image ? image : this.defaultImageSrc;
            },
			goPool () {
				this.$router.push('pool')
			},
			changeCurrentPercent (params) {
				const {number, add, sub} = params;
				number ? this.currentPercent = number : '';
				add ? this.currentPercent++ : '';
				sub ? this.currentPercent-- : '';
				this.currentPercent > 100 ? this.currentPercent = 100 : '';
				this.currentPercent < 1 ? this.currentPercent = 1 : '';
			},
			cancelCursor (e) {
				const el = this.$refs.inputPercent;
				if (e.keyCode == 13) {
					el.blur();
				}
			},
			checkValue () {
				const el = this.$refs.inputPercent;
				if (el.value > 100) this.currentPercent = el.value = 100;
				if (el.value < 1) this.currentPercent = el.value = 1;
				this.currentPercent = Math.floor(el.value)
			},
			removeClick() {
				this.$store.commit(
					'removeConfirmData',
					{
						standardImg: this.standardImg,
						tokenImg: this.tokenImg,
						standardAmount: this.standardAmount.toString(),
						standardDenom: this.standardDenom,
						tokenAmount: this.tokenAmount.toString(),
						tokenDenom: this.tokenDenom,
						standardRatio: this.standardRatio,
						tokenRatio: this.tokenRatio,
						sellLiquidity: this.sellLiquidity,
						standardDecimalNum: this.standardDecimalNum,
						tokenDecimalNum: this.tokenDecimalNum
					}
				);
				this.$store.commit('isShowConfirmTxBox', true);
			},
			limitInput () {
				const el = this.$refs.inputPercent;
				if (el.value > 100) {
					el.value = 100
				} else {
					el.value = el.value.replace(/[^\d]/g, '')
				}
				if (el.value.indexOf(0) == 0) {
					el.value = 1
				}
			}
		},
		beforeDestroy () {
			sessionStorage.removeItem('removeLiquidity')
		}
	}
</script>

<style scoped lang="scss">
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	
	input[type="number"] {
		-moz-appearance: textfield;
	}
	
	.remove_content_container {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		
		.remove_container_wrap {
			position: absolute;
			top: 10%;
			left: 50%;
			transform: translateX(-50%);
			width: 100%;
			
			.remove_container {
				width: 100%;
				
				.remove_content_wrap {
					max-width: 12rem;
					margin: 0 auto;
					
					.remove_content_wrap_container {
						margin-bottom: 1rem;
						
						.shuttle_content {
							width: 100%;
							height: 0.48rem;
							display: flex;
							align-items: center;
							justify-content: center;
							
							.shuttle_icon {
								width: 0.16rem;
								height: 0.16rem;
								cursor: pointer;
							}
						}
						
						.remove_content {
							margin: 0 auto;
							width: 4.24rem;
							box-sizing: border-box;
							padding: var(--boxPadding24);
							background: var(--bgWhiteColor);
							border-radius: var(--borderRadius8);
							@media (max-width: 460px) {
								width: auto;
								padding: var(--boxPadding24) var(--boxPadding16);
								margin: 0 0.16rem 0 0.16rem;
							}
							
							.remove_content_nav {
								display: flex;
								justify-content: space-between;
								align-items: center;
								
								span {
									font-size: var(--fontSize20);
									font-weight: bold;
									height: 0.32rem;
									line-height: 0.32rem;
								}
								
								span:nth-child(1) {
									margin-left: -0.04rem;
								}
								
								.houtui {
									width: 0.16rem;
									height: 0.32rem;
									cursor: pointer;
								}
								
								.tooltip_content_icon {
									display: inline-block;
									width: 0.24rem;
									height: 0.24rem;
									cursor: pointer;
									position: relative;
									
									&:hover {
										.tooltip_content {
											display: block;
										}
									}
									
									.tooltip_content {
										display: none;
										background: var(--bgWhiteColor);
										position: absolute;
										left: -2.51rem;
										bottom: -1.4rem;
										width: 2.36rem;
										border-radius: var(--borderRadius8);
										box-sizing: border-box;
										padding: var(--boxPadding16);
										font-size: var(--fontSize16);
										line-height: var(--lineHeight20);
										color: var(--fontColorBlack65);
										border: 0.01rem solid var(--tooltipBoxBorderColor);
										z-index: 20;
										
										&:after {
											content: url("../assets/img/tips_icon.png");
											position: absolute;
											left: 2.33rem;
											bottom: 1.38rem;
											transform: rotate(-180deg);
											color: rgba(226, 233, 255, 1);
											z-index: 10;
										}
									}
								}
							}
							
							.remove_content_detail {
								.remove_content_detail_amount {
									margin: 0.24rem 0 0.51rem 0;
									
									span:nth-child(1) {
										font-size: var(--fontSize16);
										// font-family: ArialMT;
										position: absolute;
										line-height: 0.37rem;
									}
									
									.number {
										font-size: var(--fontSize32);
										color: var(--removeLiquidityColor);
										font-weight: bold;
										display: flex;
										justify-content: center;
									}
								}
								
								.remove_content_detail_amount_button {
									display: flex;
									justify-content: space-between;
									@media (max-width: 460px) {
										flex-wrap: wrap;
										justify-content: center;
										padding: 0 0.4rem;
									}
									
									li {
										width: 0.68rem;
										height: 0.32rem;
										border-radius: var(--borderRadius16);
										border: 1px solid var(--tooltipBoxBorderColor);
										display: flex;
										justify-content: center;
										align-items: center;
										font-size: var(--fontSize16);
										
										&:not(:last-child) {
											cursor: pointer;
										}
										
										@media (max-width: 460px) {
											margin-right: 0.1rem;
											margin-top: 0.08rem;
										}
									}
									
									.last {
										box-sizing: border-box;
										padding: 0.06rem 0.01rem;
										border-radius: var(--borderRadius16) 0 0 var(--borderRadius16);
										display: flex;
										justify-content: flex-end;
										
										label {
											min-width: 0.14rem;
											text-align: center;
										}
										
										.last_input {
											border: none;
											width: 27px;
											text-align: right;
										}
										
										.last_icon {
											color: var(--btnColor);
											margin: 0 -0.01rem;
											display: flex;
											flex-direction: column;
											
											i {
												font-size: var(--fontSize14);
												cursor: pointer;
											}
											
											.rotate {
												transform: rotate(180deg)
											}
										}
									}
									
									.select {
										background: var(--btnColor);
										color: var(--bgWhiteColor);
									}
								}
								
								.remove_content_detail_token {
									margin: 0.36rem 0 0.36rem 0;
									
									li {
										display: flex;
										justify-content: space-between;
										min-height: 0.32rem;
										
										&:nth-child(1) {
											margin-bottom: 0.16rem;
										}
										
										.remove_content_detail_token_denom {
											color: var(--removeLiquidityColor);
											font-size: var(--fontSize24);
											font-weight: bold;
										}
										
										img {
											width: 0.24rem;
											height: 0.24rem;
											vertical-align: -0.3em;
											margin-left: 0.08rem;
										}
									}
								}
								
								.remove_content_detail_price {
									display: flex;
									justify-content: space-between;
									
									.remove_content_detail_price_text {
										font-size: var(--fontSize14);
									}
									
									.remove_content_detail_price_amount {
										display: flex;
										flex-direction: column;
										align-items: flex-end;
										
										span:nth-child(1) {
											margin-bottom: 0.08rem;
										}
										
										span {
											font-size: var(--fontSize14);
											color: var(--removeLiquidityPriceColor);
											font-weight: bold;
										}
									}
								}
								
								.button_content {
									margin-top: 0.16rem;
									padding: 0.1rem 0;
									display: flex;
									justify-content: center;
									align-content: center;
									font-size: var(--fontSize16);
									font-weight: var(--fontWt400);
									color: var(--fontColorWhite);
									background: var(--btnColor);
									border-radius: var(--borderRadius8);
									cursor: pointer;
								}
								
								.button_forbid {
									background: var(--btnForbidColor);
									cursor: default;
								}
							}
						}
					}
					
				}
			}
		}
	}
</style>
