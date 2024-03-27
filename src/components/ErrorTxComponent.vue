<template>
	<div class="error_container">
		<div class="error_content_wrap">
			<div >
				<div class="error_content_close_content">
				<span class="error_content_close_icon" @click="closeErrorBox()">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</span>
				</div>
				<div class="error_content_loading_content">
					<iconfont-component icon-name="icon-erro"></iconfont-component>
				</div>
				<h3 class="error_title">{{$t('transactionErrorTipBox.title')}}</h3>
				<p class="error_text_content">
					{{swapString}}
				</p>
				<p class="error_text_content">
					{{$t('transactionErrorTipBox.text')}}
				</p>
			</div>
		</div>
	</div>
</template>

<script>
	import Tools from "../util/utils";
	import IconfontComponent from "./IconfontComponent";
	
	export default {
		name: "ErrorTxComponent",
		components: {IconfontComponent},
		computed:{
			swapString(){
				if(this.$store.state.swapObj){
					if(this.$store.state.selectedFromToken && this.$store.state.selectedToToken){
						return `Swapping
					${Tools.formatDecimalPartToLong(Tools.maxToMin(this.$store.state.selectedFromToken, this.$store.state.swapObj.input.amount))}
						 ${this.$store.state.selectedFromToken.symbol.toUpperCase()}
						 for
						  ${Tools.formatDecimalPartToLong(Tools.maxToMin(this.$store.state.selectedToToken,this.$store.state.swapObj.output.amount))}
						  ${this.$store.state.selectedToToken.symbol.toUpperCase()}`
					}
					
				}
			}
		},
		methods:{
			closeErrorBox(){
				this.$store.commit('isBroadcastTxError',false)
			}
		},
	}
</script>

<style scoped lang="scss">
	.error_container{
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
		.error_content_wrap{
			width: 4rem;
			background: var(--fontColor1);
			border-radius: var(--borderRadius8);
			box-sizing: border-box;
			padding:var(--boxPadding24);
			.error_content_close_content{
				display: flex;
				justify-content: flex-end;
				.error_content_close_icon{
					width: 0.16rem;
					height: 0.16rem;
					display: inline-block;
					cursor: pointer;
				}
			}
			.error_content_loading_content{
				height: 1.2rem;
				display: flex;
				justify-content: center;
				img{
					height: 100%;
				}
			}
			.error_title{
				text-align: center;
				margin-bottom: 0.2rem;
				margin-top: 0.24rem;
				font-size: var(--fontSize);
			}
			.error_text_content{
				text-align: center;
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}
		}
	}
</style>
