<template>
	<div class="your_position">
		<p class="your_position_title">{{ $t("pool.add.yourPosition") }}</p>
		<ul class="your_position_title_detail">
			<li>
				<div class="img_content">
					<img :src="standardImg || require('@/assets/img/logo/iris_logo.png')"/>
					<img :src="tokenImg || require('@/assets/img/logo/bnb_logo.png')"/>
					<span>{{standardDenom || '--'}}/{{tokenDenom || '--'}}</span>
				</div>
				<span class="text">{{selfLiquidity || '--'}}</span>
			</li>
			<li>
				<span>{{standardDenom || '--'}}</span>
				<span>{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(standardTotalAmount,standardDecimalNum))) }}</span>
			</li>
			<li>
				<span>{{tokenDenom || '--'}}</span>
				<span>{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(tokenTotalAmount,tokenDecimalNum)))}}</span>
			</li>
		</ul>
	</div>
</template>

<script>
	import Tools from "@/util/utils";
	import {decimalNum} from "@/constant"
	
	export default {
		name: "",
		components: {},
		props: {
			selfLiquidity: {
				type: [String, Number],
				require: true
			},
			standardImg: {
				type: String,
				require: true
			},
			tokenImg: {
				type: String,
				require: true
			},
			standardTotalAmount: {
				type: [String, Number],
				require: true
			},
			tokenTotalAmount: {
				type: [String, Number],
				require: true
			},
			standardDenom: {
				type: String,
				require: true
			},
			tokenDenom: {
				type: String,
				require: true
			},
			tokenDecimalNum: {
				type: Number,
				default: 6
			},
			standardDecimalNum: {
				type: Number,
				default: 6
			}
		},
		data () {
			return {
				Tools,
				decimalNum
			};
		},
	};
</script>

<style lang="scss" scoped>
	.your_position {
		padding: 0.15rem 0.24rem 0.19rem 0.24rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		width: 4.24rem;
		margin: 0.08rem auto 0 auto;
		@media (max-width: 460px) {
			width: auto;
			margin: 0.08rem 0.16rem 0 0.16rem;
			padding: 0.15rem 0.16rem 0.19rem 0.16rem;
		}
		
		.your_position_title {
			font-size: var(--fontSize16);
			// font-family: Helvetica;
		}
		
		.your_position_title_detail {
			li {
				display: flex;
				justify-content: space-between;
				margin-top: 0.16rem;
				
				&:nth-child(3) {
					margin-top: 0.18rem;
				}
				
				.img_content {
					img{
						@media (max-width:375px) {
							display: none;
						}
					}
				}
				
				img {
					width: 0.32rem;
					height: 0.32rem;
					vertical-align: -0.7em;
					margin-right: 0.04rem;
				}
				
				.text {
					line-height: 0.32rem;
					font-size: var(--fontSize20);
				}
				
				span:nth-child(2) {
					color: var(--btnColor);
					font-weight: bold;
				}
			}
		}
	}
</style>
