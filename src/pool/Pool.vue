<template>
	<div class="pool_content_container">
		<div class="pool_container_wrap">
			<div class="pool_container">
				<div class="pool_content_wrap">
					<div class="pool_content">
						<swap-navigation></swap-navigation>
						<!-- your_liquidity -->
						<div class="pool_content_your_liquidity">
							<span>{{ $t('pool.yourLiquidity') }}</span>
							<div class="tooltip_content_icon">
								<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
								<div class="tooltip_content">
									{{ $t("pool.yourLiquidityTip") }}
								</div>
							</div>
						</div>
						<!-- 未登录和无liquidity展示 -->
						<div class="pool_content_text"
						     v-if="!$store.state.isConnected || !$store.state.isHaveLiquidity">
							<span v-if="!$store.state.isConnected">{{ $t('pool.unconnectedText') }}</span>
							<span
								v-else-if="$store.state.isConnected && !$store.state.isHaveLiquidity">{{ $t('pool.connectedText') }}</span>
							<span v-show="$store.state.isConnected">{{ $t('pool.connectedFarmLinkText') }}<router-link
								class="farm_link"
								:to="`/farm`">{{ $t('pool.connectedFarmLinkLabel') }}</router-link></span>
						</div>
						<!-- 展示自己的liquidity -->
						<template v-if="$store.state.isConnected">
							<div class="pool_content_detail" v-for="(quidity,index) in this.slefLiquidity" :key="index">
								<div class="pool_content_detail_top">
									<div class="pool_content_detail_token_wrap">
										<div class="pool_content_detail_top_token">
											<img
												:src="setIRISImageSrc(quidity) || require('../assets/img/logo/iris_logo.png')">
											<img :src="setOtherImageSrc(quidity)">
											<span> {{
													quidity.standard && quidity.standard.denom
												}} / {{ quidity.token && quidity.token.denom }} </span>
										</div>
									</div>

									<div class="icon_component_content"
									     v-show="!quidity.isShowDetail"
									     @click.stop="switchShowDetail(index)">
										<div class="icon">
											<iconfont-component icon-name="icon-zhankai"
											                    :class="quidity.isShowDetail ? 'rotate' : ''"></iconfont-component>
										</div>
									</div>
								</div>
								<div v-show="quidity.isShowDetail"
								     class="pool_info_container"
								     :style="{paddingBottom: !quidity.isShowDetail ? '0.16rem' :  '0'}">
									<ul class="pool_content_detail_content">
										<li>
											<span class="pool_content_detail_content_token">{{
													quidity.standard && quidity.standard.denom
												}}</span>
											<div class="pool_content_detail_content_number">
												<span>{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(quidity.standard && quidity.standard.amount, standardDecimalNum))) }}</span>
												<img
													:src="setIRISImageSrc(quidity) || require('../assets/img/logo/iris_logo.png')">
											</div>
										</li>
										<li>
											<span class="pool_content_detail_content_token">{{
													quidity.token && quidity.token.denom
												}}</span>
											<div class="pool_content_detail_content_number">
												<span>{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(quidity.token && quidity.token.amount, quidity.token.scale))) }}</span>
												<img :src="setOtherImageSrc(quidity)">
											</div>
										</li>
										<li>
											<span
												class="pool_content_detail_content_token">{{ $t('pool.yourPoolTokens') }}</span>
											<div class="pool_content_detail_content_number">
												<span>{{
														Tools.formatDecimalPartToLong(Tools.formatBigNumber(quidity.selfLiquidity && quidity.selfLiquidity.amount))
													}}</span>
											</div>
										</li>
										<li>
											<span
												class="pool_content_detail_content_token">{{ $t('pool.yourPoolShare') }}</span>
											<div class="pool_content_detail_content_number">
												<span>{{ quidity.liquidityPercentage }}</span>
											</div>
										</li>
									</ul>
									<div class="pool_content_detail_bottom">
										<div class="pool_content_detail_button" @click.stop=goRemove(quidity)>
											{{ $t("pool.removeButton") }}
										</div>
									</div>
									<div class="detail_icon_component_content"
									     v-show="quidity.isShowDetail"
									     @click.stop="switchShowDetail(index)">
										<div class="icon">
											<iconfont-component icon-name="icon-zhankai"
											                    :class="quidity.isShowDetail ? 'rotate' : ''"></iconfont-component>
										</div>
									</div>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import SwapNavigation from "../components/SwapNavigation";
import IconfontComponent from "../components/IconfontComponent";
import {getClient, singleConfig, queryAddressLiquidity} from "@/util/sdkHelper";
import {decimalNum} from "@/constant";
import Tools from "@/util/utils";
import {MAX_NUMBER_LENGTH} from "../constant";

export default {
	name: "Pool",
	components: {SwapNavigation, IconfontComponent},
	data() {
		return {
			Tools,
			decimalNum,
			slefLiquidity: this.$store.state.slefLiquidity,
			standardDecimalNum: 6,
			tokenDecimalNum: MAX_NUMBER_LENGTH,
			defaultImageSrc: require('../assets/img/logo/LOGO_Dafult.png'),
            client: null
		}
	},
	computed: {
		setIRISImageSrc() {
			return function (data) {
				let denom = data.standard.nativeDenom;
				return this.matchLogo(denom);
			}
		},
		setOtherImageSrc() {
			return function (data) {
				let denom = data.token.nativeDenom;
				return this.matchLogo(denom);
			}
		},
	},
	watch: {
		slefLiquidity() {
			this.$store.commit("isHaveLiquidity", this.slefLiquidity.length);
		},
		"$store.state.isConnected"() {
			this.initPool()
		},
		"$store.state.addressLpBalance": {
			deep: true,
			handler() {
				this.initPool()
			}
		}
	},
	created() {
	},
	async mounted() {
        this.client = await getClient(singleConfig)
		this.initPool()
	},
	methods: {
		matchLogo(item) {
			const configs = JSON.parse(localStorage.getItem('config')).length ? JSON.parse(localStorage.getItem('config')) : [];
			let image = '';
			configs?.forEach(config => {
				if (config?.denom == item) {
					image = config.icon;
				}
			})
			return image ? image : this.defaultImageSrc;
		},
		toFarm(pool) {
			const denom = pool?.selfLiquidity?.denom ? pool.selfLiquidity.denom.replace('swap', '') : ''
			this.$store.commit('toFarmDenom', denom)
			this.$router.push({
				path: '/farm'
			})
		},
		async initPool() {
			const address = this.$store.state.address;
			if (address) {
				await this.queryLiquidity(address);
			}
		},
		switchShowDetail(index) {
			if (this.slefLiquidity[index].isShowDetail) {
				this.slefLiquidity[index].isShowDetail = !this.slefLiquidity[index].isShowDetail;
			} else {
				this.slefLiquidity.forEach(item => {
					item.isShowDetail = false
				})
				this.slefLiquidity[index].isShowDetail = !this.slefLiquidity[index].isShowDetail;
			}
		},
		goRemove(quidity) {
			this.$router.push('remove');
			quidity.tokenDecimalNum = this.tokenDecimalNum;
			quidity.standardDecimalNum = this.standardDecimalNum;
			if (quidity) {
				sessionStorage.setItem('removeLiquidity', JSON.stringify(quidity))
			}
		},
		async queryLiquidity(address) {
			try {
				const res = await queryAddressLiquidity(this.client, address);
				this.slefLiquidity = [];
				if (res && res.length > 0) {
					const tokenList = this.$store.state.tokenList;
					for (let liquidity of res) {
						liquidity = JSON.parse(JSON.stringify(liquidity));
						const standardTokenDetail = (tokenList || []).filter(token => token.denom == liquidity.standard.denom.toLowerCase());
						const tokenTokenDetail = (tokenList || []).filter(token => token.denom.toLowerCase() == liquidity.token.denom.toLowerCase());
						const baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
						if (standardTokenDetail && standardTokenDetail.length > 0 && tokenTokenDetail && tokenTokenDetail.length > 0) {
							this.tokenDecimalNum = Number(tokenTokenDetail[0].scale) || MAX_NUMBER_LENGTH;
							this.standardDecimalNum = Number(standardTokenDetail[0].scale) || 6;
							liquidity.standard.amount = Tools.maxToMin(standardTokenDetail[0], liquidity.standard.amount);
							liquidity.standard.denom = standardTokenDetail[0].symbol.toUpperCase();
							liquidity.standard.nativeDenom = standardTokenDetail[0].denom;
							liquidity.standardTotal.amount = Tools.maxToMin(standardTokenDetail[0], liquidity.standardTotal.amount);
							liquidity.standardTotal.denom = standardTokenDetail[0].symbol.toUpperCase();
							liquidity.standardImg = standardTokenDetail[0].icon;
							liquidity.token.amount = Tools.maxToMin(tokenTokenDetail[0], liquidity.token.amount);
							liquidity.token.denom = tokenTokenDetail[0].symbol.toUpperCase();
							liquidity.token.scale = tokenTokenDetail[0].scale
							liquidity.token.nativeDenom = tokenTokenDetail[0].denom;
							liquidity.tokenTotal.amount = Tools.maxToMin(tokenTokenDetail[0], liquidity.tokenTotal.amount);
							liquidity.tokenTotal.denom = tokenTokenDetail[0].symbol.toUpperCase();
							liquidity.liquidityPercentage = Tools.formatPercent(liquidity.liquidityPercentage);
							liquidity.isShowDetail = false;
							liquidity.standardImg = standardTokenDetail[0] && standardTokenDetail[0].icon;
							liquidity.tokenImg = tokenTokenDetail[0] && tokenTokenDetail[0].icon;
							liquidity.selfLiquidity.amount = Tools.maxToMin(baseToken, liquidity.selfLiquidity.amount);
							this.slefLiquidity.push(liquidity);
						}
					}
					this.$store.commit('slefLiquidity', this.slefLiquidity)
				}
			} catch (e) {
				console.error(e)
				this.slefLiquidity = [];
				this.$store.commit('slefLiquidity', this.slefLiquidity);
			}
		},
	},
	destroyed() {
		(this.slefLiquidity || []).forEach(liquidity => {
			liquidity.isShowDetail = false;
		})

		this.$store.commit('slefLiquidity', this.slefLiquidity);
		if (this.$store.state.tokenList) {
			this.$store.state.tokenList.forEach(item => {
				item.isFrom = ''
				item.isTo = ''
				if (item.isBaseToken) {
					item.isFrom = true
					item.isTo = ''
				}
			})
		}
	}
}
</script>

<style scoped lang="scss">
.pool_content_container {
	width: 100%;
	height: 100%;
	position: relative;

	.pool_container_wrap {
		position: absolute;
		top: 10%;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;

		.pool_container {
			width: 100%;

			.pool_content_wrap {
				max-width: 12rem;
				margin: 0 auto;
				@media (max-width: 460px) {
					margin: 0 0.16rem;
				}

				.pool_content {
					width: 4.24rem;
					box-sizing: border-box;
					padding: var(--boxPadding24);
					background: var(--bgWhiteColor);
					border-radius: var(--borderRadius8);
					margin: 0 auto 1rem auto;
					@media (max-width: 460px) {
						width: 100%;
						min-width: 2.88rem;
						padding: var(--boxPadding24) var(--boxPadding16);

					}

					.pool_content_top_text {
						margin: 0.22rem 0 0.08rem 0;
						font-size: var(--fontSize14);
						color: var(--fontColorBlack65);
						line-height: var(--lineHeight20);
					}

					.pool_content_add_liquidity {
						padding: 0.04rem 1.16rem;
						color: var(--fontColorWhite);
						text-align: center;
						font-size: var(--fontSize16);
						// font-family: Helvetica-Bold, Helvetica;
						line-height: 0.32rem;
						font-weight: 400;
						background-color: var(--btnColor);
						border-radius: var(--borderRadius8);
						cursor: pointer;
						@media (max-width: 460px) {
							padding: 0.08rem 0;
							width: 100%;
						}
					}

					.pool_content_your_liquidity {
						margin: 0.22rem 0 0.14rem 0;
						display: flex;

						span {
							display: block;
							font-size: var(--fontSize14);
							margin-right: 0.08rem;
							line-height: 0.24rem;
							color: var(--fontColorBlack65);
						}

						// .icon {
						//     width: 0.24rem;
						//     height: 0.24rem;
						// }
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
								left: 0.38rem;
								bottom: -0.1rem;
								width: 2.32rem;
								border-radius: var(--borderRadius8);
								box-sizing: border-box;
								padding: var(--boxPadding16);
								font-size: var(--fontSize16);
								line-height: var(--lineHeight20);
								color: var(--fontColorBlack65);
								border: 0.01rem solid var(--tooltipBoxBorderColor);
								z-index: 1;

								&:after {
									content: url("../assets/img/tips_icon.png");
									position: absolute;
									left: -0.08rem;
									bottom: 0.05rem;
									color: rgba(226, 233, 255, 1);
									z-index: 10;
								}

								@media(max-width: 460px) {
									left: -1.18rem;
									bottom: 0.4rem;
									&:after {
										left: 1.23rem;
										bottom: -0.15rem;
										transform: rotate(-90deg);
									}
								}
							}
						}
					}

					.pool_content_text {
						min-height: 0.88rem;
						border-radius: var(--borderRadius8);
						border: 0.01rem solid var(--poolBorderColor);
						display: flex;
						justify-content: center;
						align-items: center;
						flex-direction: column;

						span {
							text-align: center;
							font-size: var(--fontSize14);
							color: var(--fontColorBlack65);
						}

						.farm_link {
							margin-top: 0.08rem;
							color: var(--btnColor);
						}
					}

					.pool_content_detail {
						border-radius: var(--borderRadius8);
						border: 0.01rem solid var(--poolBorderColor);
						padding: 0.18rem 0 0 0;
						margin-bottom: 0.08rem;
						overflow: hidden;

						.pool_content_detail_top {
							display: flex;
							flex-direction: column;
							align-items: center;

							.pool_content_detail_token_wrap {
								flex: 1;
								display: flex;
								align-items: center;
								width: 100%;
								justify-content: space-between;
								padding: 0 0.16rem;
								box-sizing: border-box;

								.pool_content_detail_top_token {
									padding: 0.04rem 0;

									img {
										width: 0.24rem;
										height: 0.24rem;
										vertical-align: -0.4em;
										margin-right: 0.04rem;
									}

									span {
										font-size: var(--fontSize16);
										font-weight: bold;
										// line-height: 0.16rem;
									}
								}

								.farm_token_content {
									.el-button {
										border-radius: var(--borderRadius6);
										background: var(--btnColor);
										padding: 0.08rem 0.2rem;
										border-color: transparent;

										span {
											font-size: var(--fontSize16);
											line-height: 0.2rem;
										}
									}
								}
							}

							.icon_component_content {
								width: 100%;
								height: 0.16rem;
								text-align: center;
								display: flex;
								align-items: center;
								justify-content: center;
								margin-top: 0.08rem;
								cursor: pointer;
								border-top: 0.01rem solid var(--btnColor008);

								&:hover {
									background: var(--btnColor008);
								}

								.icon {
									width: 0.2rem;
									height: 0.15rem;
									cursor: pointer;
									padding-bottom: 0.03rem;
								}
							}


							.rotate {
								transform: rotate(180deg)
							}
						}
					}

					.pool_info_container {
						padding-bottom: 0.16rem;

						.pool_content_detail_content {
							margin: 0.18rem 0.16rem 0.16rem 0.16rem;

							li {
								display: flex;
								justify-content: space-between;
								font-size: var(--fontSize14);
								margin-bottom: 0.08rem;

								.pool_content_detail_content_token {
									color: var(--fontColorBlack);
									// font-family: Helvetica;
									line-height: 0.24rem;
								}

								.pool_content_detail_content_number {
									span {
										// font-family: Helvetica-Bold, Helvetica;
										font-weight: bold;
										color: var(--poolTokenColor);
										line-height: 0.24rem;
									}

									img {
										margin-left: 0.08rem;
										width: 0.20rem;
										height: 0.20rem;
										vertical-align: -0.3em;
									}
								}
							}
						}

						.pool_content_detail_bottom {
							margin: 0 0.16rem;
							display: flex;
							justify-content: space-between;

							.pool_content_detail_button {
								flex: 1;
								min-height: 0.38rem;
								border-radius: var(--borderRadius8);
								background-color: var(--bgWhiteColor);
								font-size: var(--fontSize16);
								// font-family: Helvetica-Bold, Helvetica;
								border: 0.01rem solid var(--btnColor);
								font-weight: var(--fontWt400);
								color: var(--btnColor);
								display: flex;
								justify-content: center;
								align-items: center;
								cursor: pointer;
							}

							.pool_content_earn_button {
								flex: 1;
								margin-left: 0.08rem;

								.el-button {
									width: 100%;
									border-radius: var(--borderRadius8);
									background-color: var(--btnColor);
									border-color: transparent;
								}
							}
						}

						.detail_icon_component_content {
							margin-top: 0.08rem;
							width: 100%;
							height: 0.16rem;
							text-align: center;
							display: flex;
							align-items: center;
							justify-content: center;
							cursor: pointer;
							border-top: 0.01rem solid var(--btnColor008);

							&:hover {
								background: var(--btnColor008);
							}

							.icon {
								width: 0.2rem;
								height: 0.15rem;
								padding-bottom: 0.02rem;
							}

							.rotate {
								padding-bottom: 0;
								padding-top: 0.05rem;
								transform: rotate(180deg)
							}
						}
					}

				}
			}
		}
	}
}
</style>
