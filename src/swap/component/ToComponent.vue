<template>
	<div class="to_container">
		<div class="to_title_content">
			<span class="to_title_label">
				<span>{{$t('swapInputTo.title')}}</span>
				<span v-show="isShowExtimated"> {{$t('swapInputTo.estimated')}}</span>
			</span>
			<span class="to_balance_value_content" v-show="getBalance !== '--'" v-if="$store.state.isConnected">
				<span class="to_balance_value_label">{{$t('swapInputTo.balance')}}</span>
				<span class="to_balance_value">{{getBalance}}</span>
			</span>
		</div>
		<div class="ipt_select_content">
			<div class="ipt_content">
				<el-input class="to_ipt"
				       v-iptOnlyNum
				       v-model="iptValue"
				       @mousewheel.prevent
				       @input="getInputValue()"
				       @blur="resetInputIngStatus"
				       placeholder="0.0000"
				       type="text"></el-input>
			</div>
			<div class="select_token_container">
				<defaule-select-token-component
						:isFrom="false"
						:isTo="true"
						v-if="!$store.state.selectedToToken"></defaule-select-token-component>
				<to-select-token-component v-if="$store.state.selectedToToken"></to-select-token-component>
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import DefauleSelectTokenComponent from "./DefauleSelectTokenComponent";
	import SelectTokenComponent from "./FromSelectTokenComponent";
	import ToSelectTokenComponent from "./ToSelectTokenComponent";
	import Tools from "../../util/utils";
	import {MAX_NUMBER_LENGTH} from "../../constant";
	export default {
		name: "ToComponent",
		components: {ToSelectTokenComponent, DefauleSelectTokenComponent, IconfontComponent},
		data () {
			return {
				Tools,
				iptValue: '',
				isClickMaxBtn: false,
				isInputIng: false,
			}
		},
		watch: {
			iptValue(){
				if(this.iptValue){
					this.iptValue = this.iptValue.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
				}

				if(this.$store.state.selectedToToken && this.$store.state.selectedToToken.scale){
					const scale = this.$store.state.selectedToToken.scale;
					this.iptValue = Tools.formatDecimal(this.iptValue,Number(scale) > MAX_NUMBER_LENGTH ? MAX_NUMBER_LENGTH : Number(scale) || 0);
				}
				
			},
			'$store.state.isFromConversion'(){
				if(this.$store.state.isFromConversion){
					if(!this.isInputing){
						const scale = this.$store.state.selectedToToken && this.$store.state.selectedToToken.scale;
						this.iptValue = Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedToToken,this.$store.state.isFromConversion.to.amount),Number(scale) > MAX_NUMBER_LENGTH ? MAX_NUMBER_LENGTH : Number(scale) || 0);
					}
				} else {
					this.iptValue = null
					this.$store.commit("isShowPriceAndCard",false)
				}
			},
			'$store.state.autoSetFromIpt'(){
				if(!Number(this.$store.state.autoSetFromIpt)){
					this.iptValue = ''
				}
			},
		},
		computed: {
			isShowExtimated(){
				if(this.$store.state.isFromConversion){
					if(!this.$store.state.isFromConversion.isBuyOrder){
						return true
					}else {
						return false
					}
				}
				return false
			},
			getBalance () {
				let balance = '--'
				if(this.$store.state.tokenList && this.$store.state.selectedToToken){
					this.$store.state.tokenList.forEach( item => {
						if(item.denom === this.$store.state.selectedToToken.denom && item.balance){
							balance = Tools.maxToMin(this.$store.state.selectedToToken,item.balance)
						}
					})
				}
				return Tools.formatDecimalPartToLong(balance)
			},
		},
		methods: {
			resetInputIngStatus(){
				this.isInputing = false
			},
			getInputValue () {
				this.isInputing = true
				this.iptValue = this.iptValue.replace('--','')
				this.iptValue = Tools.formatDecimalPartToLong(this.iptValue)
				setTimeout(() =>{
					this.iptValue  = this.iptValue === '--' ? '' : this.iptValue
					if(!this.iptValue || Number(this.iptValue) === 0){
						this.$store.commit('isFromConversion',null)
						this.$store.commit('autoSetToIpt','')
						this.$store.commit('autoSetFromIpt','')
					}
					if(this.$store.state.autoSetToIpt) {
						if(this.$store.state.autoSetToIpt === this.iptValue) {
							let copyInputValue = Number(this.iptValue)
							this.$store.commit("autoSetToIpt",copyInputValue)
						} else {
							this.$store.commit('autoSetToIpt',this.iptValue)
						}
					} else {
						this.$store.commit('autoSetToIpt',this.iptValue)
					}
				},300)
			}
		},
	}
</script>

<style scoped lang="scss">
	.to_container {
		box-sizing: border-box;
		background: var(--btnColor008);
		padding: var(--boxPadding16);
		border-radius: var(--borderRadius8);
		
		.to_title_content {
			font-size: var(--fontSize14);
			line-height: var(--lineHeight20);
			color: var(--fontColorBlack65);
			display: flex;
			justify-content: space-between;
			
			.to_balance_value_content {
				.to_balance_value {
					margin-left: 0.04rem;
				}
			}
		}
		
		.ipt_select_content {
			margin-top: 0.16rem;
			display: flex;
			@media (max-width: 820px) {
				flex-direction: column;
			}
			.select_token_container{
				@media (max-width: 820px) {
					width: 100%;
					display: flex;
					justify-content: flex-end;
					height: 0.4rem;
					margin-top: 0.08rem;
				}
				.select_content {
					display: flex;
					background: var(--bgWhiteColor);
					align-items: center;
					border-radius: var(--borderRadius6);
					height: 0.32rem;
					.token_img_content {
						margin-left: 0.08rem;
						width: 0.24rem;
						height: 0.24rem;
						display: flex;
						align-items: center;
						justify-content: center;
						
						img {
							width: 100%;
						}
					}
					
					.token_name {
						margin-left: 0.08rem;
						color: var(--fontColorBlack);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						font-weight: var(--fontWt400);
					}
					
					.select_icon {
						width: 0.48rem;
						height: 0.2rem;
						display: flex;
						align-items: center;
					}
				}
			}
			.ipt_content {
				flex: 1;
				
				.to_ipt {
					width: 100%;
					background: transparent;
					border: none;
					font-size: var(--fontSize28);
					color: rgba(53, 83, 172, 1);
					font-weight: var(--fontWt600);
				}

				:deep(.el-input__inner) {
					background: transparent !important;
					padding: 0;
					border: none !important;
					color: rgba(53, 83, 172, 1) !important;
				}

				:deep(.el-input__inner::placeholder) {
					color: rgba(53, 83, 172, 0.3) !important;
				}
			}
			
		}
	}
</style>
