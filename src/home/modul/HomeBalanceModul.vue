<template>
	<div class="balance_container">
		<div class="balance_content_wrap">
			<p class="balance_content_title">{{$t('home.balance.title')}}</p>
			<div class="balance_content_value">
<!--				<span class="token_icon">-->
<!--					<img src="../../assets/img/logo/iris_logo.png" alt="">-->
<!--				</span>-->
				<span class="no_connected_label">
					<span class="denom_style">$</span>{{ $store.state.isConnected ? userBalance ? userBalance.replace('$','') :  '0' : '0'}}</span>
				<span class="connected_value"></span>
			</div>
		</div>
	</div>
</template>

<script>
	import Tools from "../../util/utils";
	
	export default {
		name: "HomeBalanceModul",
		data(){
			return {
				userBalance: 0
			}
		},
		props:{
			balance:{
				type:String
			}
		},
		watch:{
			balance(newValue,oldValue){
				this.userBalance = newValue
			}
		},
		create(){
			this.userBalance = this.props.balance
		},
		methods:{
			formatBalance(balance){
				let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
				if(baseToken){
					return Tools.formatBigNumber(balance,baseToken.scale)
				}else {
					return  balance
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.balance_container{
		width: 100%;
		margin-left: 0.32rem;
		@media (max-width: 800px) {

			margin: 0.24rem 0 0.16rem 0;
		}
		@media (max-width: 375px) {
			width: 100%;
			margin: 0.24rem 0 0.16rem 0;
		}
		.balance_content_wrap{
			width: 4.84rem;
			background: var(--cardBgColor);
			box-sizing: border-box;
			padding: var(--boxPadding24);
			border-radius: var(--borderRadius8);
			@media (max-width: 1010px) {
				width: 100%;
			}
			@media (max-width: 375px) {
				width: auto;
				margin: 0 0.16rem;
			}
			.balance_content_title{
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
				margin-bottom: var(--boxPadding24);
			}
			.balance_content_value{
				display: flex;
				align-items: center;
				margin-bottom: 0.36rem;
				.token_icon{
					width: 0.24rem;
					height: 0.24rem;
					display: inline-block;
					img{
						width: 100%;
					}
					margin-right: 0.1rem;
				}
				.no_connected_label{
					font-size: var(--fontSize28);
					color: rgba(53, 83, 172, 1);
					font-weight: var(--fontWt600);
					.denom_style{
						display: inline-block;
						width: 0.24rem;
						color: rgba(0, 0, 0, 1);
						font-size: 0.24rem;
						font-weight: var(--fontWt400);
					}
				}
			}
		}
	}
</style>
