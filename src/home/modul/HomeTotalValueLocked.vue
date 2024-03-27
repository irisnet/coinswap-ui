<template>
	<div class="tvl_container">
		<div class="tvl_content_wrap">
			<p class="tvl_content_title">{{$t('home.tvl.title')}}</p>
			<div class="tvl_content_value">
				<span class="token_icon">
					$
				</span>
				<p class="no_connected_label">{{formatTVL(tvl)}}</p>
			</div>
			<p class="connected_value">{{$t('home.tvl.footer')}}</p>
		</div>
	</div>
</template>

<script>
	import {queryTVl} from "../../server/api";
	import Tools from "../../util/utils";
	
	export default {
		name: "HomeTotalValueLocked",
		data() {
			return {
				tvl: '',
				tvlTimer: null
			}
		},
		mounted() {
			this.updateTVl()
			
			this.tvlTimer = setInterval(() => {
				this.updateTVl()
			},10000)
		},
		methods:{
			formatTVL(tvl){
				return Tools.formatBigNumber(tvl)
			},
			updateTVl() {
				queryTVl().then((tvl) => {
					if(Number(tvl?.volume_total_locked) >= 0){
						this.tvl = Number(tvl.volume_total_locked).toFixed(0)
					}
				})
			}
		},
		destroyed(){
			clearInterval(this.tvlTimer)
		}
	}
</script>

<style scoped lang="scss">
	.tvl_container{
		/*margin-right: 0.24rem;*/
		width: 100%;
		.tvl_content_wrap{
			margin: 0 auto;
			width: 4.84rem;
			background: var(--cardBgColor);
			box-sizing: border-box;
			padding: var(--boxPadding24);
			border-radius: var(--borderRadius8);
			@media (max-width: 1010px)  {
				width: 100%;
			}
			@media (max-width: 375px) {
				width: auto;
				margin: 0 0.16rem;
			}
			.tvl_content_title{
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
				margin-bottom: var(--boxPadding24);
			}
			.tvl_content_value{
				display: flex;
				align-items: center;
				.token_icon{
					display: inline-block;
					width: 0.24rem;
					font-size: 0.24rem;
				}
				.no_connected_label{
					font-size: var(--fontSize28);
					color: rgba(53, 83, 172, 1);
					font-weight: var(--fontWt600);
				}
			}
			.connected_value{
				text-align: right;
				margin-top: var(--boxPadding16);
				font-size: var(--fontSize14);
				color:var(--fontColorBlack65);
				line-height:var(--lineHeight20)
			}
		}
	}
</style>
