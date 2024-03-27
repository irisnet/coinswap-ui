<template>
	<div class="price_container">
		<div class="price_content_label">{{$t('price.title')}}</div>
		<div class="price_content">
			<div class="price_content_left">
				<span class="price_value">{{price}}</span>
				<span v-show="!isChangeToken">{{$store.state.selectedFromToken && $store.state.selectedFromToken.symbol ? $store.state.selectedFromToken.symbol.toUpperCase() :''}}</span>
				<span v-show="isChangeToken">{{$store.state.selectedToToken && $store.state.selectedToToken.symbol ? $store.state.selectedToToken.symbol.toUpperCase() :'' }}</span>
				<span class="price_label">{{$t('price.per')}}</span>
				<span v-show="!isChangeToken">{{$store.state.selectedToToken && $store.state.selectedToToken.symbol ? $store.state.selectedToToken.symbol.toUpperCase() :''}}</span>
				<span v-show="isChangeToken">{{$store.state.selectedFromToken && $store.state.selectedFromToken.symbol ? $store.state.selectedFromToken.symbol.toUpperCase() :''}}</span>
			</div>
			<div class="price_content_icon" @click="changeTokenPrice()">
				<iconfont-component icon-name="icon-jiaohuantoken"></iconfont-component>
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import Tools from "../../util/utils";
	export default {
		name: "PriceComponent",
		components: {IconfontComponent},
		data(){
			return {
				isChangeToken: false,
			}
		},
		computed:{
			price(){
				if(this.$store.state.selectedToToken && this.$store.state.selectedFromToken){
					const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
					const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
					if(this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder){
						let raito ;
						if(this.isChangeToken){
							raito = this.$store.state.selectedToToken.scale - this.$store.state.selectedFromToken.scale;
							const number = Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.fromRaito,raito),toDecimal);
							if(number == 0) {
								return number
							}
							return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.fromRaito,raito),toDecimal)))}`
						}else {
							raito = this.$store.state.selectedFromToken.scale - this.$store.state.selectedToToken.scale
							const number = Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.toRaito,raito),fromDecimal)
							if(number == 0) {
								return number
							}
							return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.toRaito,raito),fromDecimal)))}`
						}
					}
					
					if(this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder){
						let raito ;
						if(this.isChangeToken){
							raito = this.$store.state.selectedToToken.scale - this.$store.state.selectedFromToken.scale
							const number = Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.fromRaito,raito),toDecimal);
							if(number == 0 ) {
								return number
							}
							return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.fromRaito,raito),toDecimal)))}`
						}else {
							raito = this.$store.state.selectedFromToken.scale - this.$store.state.selectedToToken.scale;
							const number = Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.toRaito,raito),fromDecimal);
							if(number == 0) {
								return number
							}
							return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.toRaito,raito),fromDecimal)))}`
						}
					}
					
				}
			},
		},
		methods:{
			changeTokenPrice(){
				this.isChangeToken = !this.isChangeToken
				
			}
		}
	}
</script>

<style scoped lang="scss">
.price_container{
	display: flex;
	justify-content: space-between;
	font-size: var(--fontSize14);
	line-height: var(--lineHeight20);
	color:var(--fontColorBlack65);
	padding-top: var(--boxPadding16);
	@media (max-width: 375px) {
		flex-direction: column;
	}
	.price_content_label{
	
	}
	.price_content{
		text-align: right;
		display: flex;
		align-items: flex-end;
		
		.price_content_left{
			font-size: var(--fontSize14);
			.price_value{
				color: var(--btnColor);
				margin-right: 0.04rem;
			}
			.price_form_token{
				color: var(--btnColor);
			}
			.price_label{
				margin: 0 0.04rem;
				color: var(--fontColorBlack65);
			}
			.price_to_token{
				color: var(--btnColor);
			}
		}
		.price_content_icon{
			margin-left: 0.08rem;
			width: 0.2rem;
			height: 0.2rem;
			cursor: pointer;
		}
	}
}
</style>
