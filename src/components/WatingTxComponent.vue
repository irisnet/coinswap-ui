<template>
	<div class="waiting_container">
		<div class="waiting_content_wrap">
			<div>
				<div class="waiting_content_close_content">
				<span class="waiting_content_close_icon" @click="closeWaiting()">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</span>
				</div>
				<div class="waiting_content_loading_content">
					<img src="../assets/img/loading/loading.gif" alt="">
				</div>
				<h3 class="waiting_title">{{$t('waitingTxBox.title')}}</h3>
				<p class="waiting_text_content">
					{{swapString}}
				</p>
				<p class="waiting_text_content">
					{{$t('waitingTxBox.text')}}
				</p>
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "./IconfontComponent";
	import Tools from "../util/utils";
	export default {
		name: "WaitingTxComponent",
		components: {IconfontComponent},
		data() {
			return {
				appHeight: 0,
			}
		},
		
		computed:{
			swapString(){
				if(this.$store.state.swapObj && this.$store.state.selectedFromToken && this.$store.state.selectedToToken){
					return `Swapping
					${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.maxToMin(this.$store.state.selectedFromToken, this.$store.state.swapObj.input.amount)))}
						 ${this.$store.state.selectedFromToken.symbol.toUpperCase()}
						 for
						  ${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.maxToMin(this.$store.state.selectedToToken,this.$store.state.swapObj.output.amount)))}
						  ${this.$store.state.selectedToToken.symbol.toUpperCase()}
						  `
				}
			}
		},
		methods:{
			closeWaiting(){
				this.$store.commit('isWaitingConfirmBox',false)
			}
		},
	}
</script>

<style scoped lang="scss">
	.waiting_container{
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0,0,0,0.3);
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 101;
		.waiting_content_wrap{
			width: 4rem;
			background: var(--fontColor1);
			border-radius: var(--borderRadius8);
			box-sizing: border-box;
			padding:var(--boxPadding24);
			@media (max-width: 432px) {
				margin: 0 0.16rem;
			}
			.waiting_content_close_content{
				display: flex;
				justify-content: flex-end;
				.waiting_content_close_icon{
					width: 0.16rem;
					height: 0.16rem;
					display: inline-block;
					cursor: pointer;
				}
			}
			.waiting_content_loading_content{
				height: 1.2rem;
				display: flex;
				justify-content: center;
				img{
					height: 100%;
				}
			}
			.waiting_title{
				text-align: center;
				margin-bottom: 0.2rem;
				margin-top: 0.24rem;
				font-size: var(--fontSize);
			}
			.waiting_text_content{
				text-align: center;
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}
		}
		.error_container{
			display: flex;
			align-items: center;
			justify-content: center;
			.error_content_wrap{
				.error_container{
					.waiting_content_close_content{
						display: flex;
						justify-content: flex-end;
						.waiting_content_close_icon{
							width: 0.16rem;
							height: 0.16rem;
							display: inline-block;
							cursor: pointer;
						}
					}
					
				}
				.tx_error{
					margin-top: 0.4rem;
					margin-bottom: 0.4rem;
				}
			}
		
		}
	}
</style>
