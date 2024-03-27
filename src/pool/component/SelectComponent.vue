<template>
	<div class="to_container">
		<div class="to_title_content">
			<span class="to_title_label">{{$t('poolToInput.title')}}</span>
			<span class="to_balance_value_content" v-show="getBalance !== '--'" v-if="$store.state.isConnected && $store.state.isSelectAddLiquidity">
				<span class="to_balance_value_label">{{$t('poolToInput.balance')}}</span>
				<span class="to_balance_value">{{getBalance}}</span>
			</span>
		</div>
		<div class="ipt_select_content">
			<div class="ipt_content">
				<!-- @blur="unLockToken()" -->
				<el-input class="from_ipt"
				       v-iptOnlyNum
				       v-model="iptValue"
				       placeholder="0.0000"
				       @input="setIptValue"
					   @focus="lockToken()"
					   @blur="unLockToken()"
					   @mousewheel.prevent
					   type="text"></el-input>
			</div>
			<div class="to_btn_container">
				<max-button-component v-if="isShowMaxBtn" @selectAll="selectAll()"></max-button-component>
				<defaule-select-token-component
						:isToken="true"
						v-if="!$store.state.isSelectAddLiquidity" />
				<select-token-component  v-if="$store.state.isSelectAddLiquidity" />
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import MaxButtonComponent from "./MaxButtonComponent";
	import DefauleSelectTokenComponent from "./DefauleSelectTokenComponent";
	import SelectTokenComponent from "./SelectTokenComponent";
	import Tools from "@/util/utils";
	import { decimalNum } from "@/constant";

	export default {
		name: "SelectComponent",
		components: {SelectTokenComponent, DefauleSelectTokenComponent, IconfontComponent,MaxButtonComponent},
		data(){
			return {
				Tools,
				iptValue: null,
				isShowMaxBtn:false,
				isClickMaxBtn:false
			}
		},
		watch:{
			'$store.state.selectedAddLiquidityToken':{
				handler() {
					if(this.$store.state.selectedAddLiquidityToken && this.$store.state.selectedAddLiquidityToken.balance){
							this.isShowMaxBtn = true
					}else {
						this.isShowMaxBtn = false
						this.iptValue = null
					}
				},
				immediate: true
			},

			'$store.state.tokenIptValue'() {
				if(this.$store.state.selectedAddLiquidityToken && this.$store.state.selectedAddLiquidityToken.scale) {
					const decimalNum = this.$store.state.selectedAddLiquidityToken.scale
					if(decimalNum == 0 && this.$store.state.tokenIptValue) {
						this.iptValue = Math.floor(this.$store.state.tokenIptValue)
					} else if (this.$store.state.tokenIptValue) {
						this.iptValue = Tools.formatDecimalPartToLong(Tools.formatDecimal(this.$store.state.tokenIptValue,Number(decimalNum)))
					} else {
						this.iptValue = null
					}
				}
			},
		},
		computed:{
			getBalance(){
				if(this.$store.state.selectedAddLiquidityToken){
					return Tools.formatDecimalPartToLong(Tools.maxToMin(this.$store.state.selectedAddLiquidityToken,this.$store.state.selectedAddLiquidityToken.balance))
				}
				return 0
			},
		},
		methods: {
			setIptValue(){
				if(this.iptValue){
					this.iptValue = this.iptValue.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
				}
				this.$store.commit('tokenIptValue',this.iptValue)
				this.iptValue = Tools.formatDecimalPartToLong(this.iptValue?.toString())
				this.iptValue < Number(this.getBalance) ? this.isShowMaxBtn = true : this.isShowMaxBtn = false;
			},
			selectAll(){
				this.iptValue = this.getBalance;
				this.setIptValue()
				this.$store.commit('isClickMaxBtn',true);
				this.isShowMaxBtn = false;
				this.lockToken();
			},
			lockToken() {
				this.$store.commit("standardInputLock",false)
				this.$store.commit("tokenInputLock",true)
			},
			unLockToken() {
				this.$store.commit("standardInputLock",false)
				this.$store.commit("tokenInputLock",false)
			}
		},
	}
</script>

<style scoped lang="scss">
	.to_container{
		box-sizing: border-box;
		background: var(--btnColor008);
		padding:var(--boxPadding16);
		border-radius: var(--borderRadius8);
		.to_title_content{
			font-size: var(--fontSize14);
			line-height: var(--lineHeight20);
			color: var(--fontColorBlack65);
			display: flex;
			justify-content: space-between;
			.to_balance_value_content{
				.to_balance_value{
					margin-left: 0.04rem;
				}
			}
		}
		.ipt_select_content{
			margin-top: 0.16rem;
			display: flex;
			@media (max-width: 460px) {
				flex-direction: column;
			}
			.ipt_content{
				flex: 1;
				.from_ipt {
					width: 100%;
					background: transparent;
					border:none;
					font-size: var(--fontSize28);
					color: rgba(53, 83, 172, 1);
					font-weight: var(--fontWt600);
					:deep( .el-input__inner) {
						background: transparent !important;
						padding: 0;
						border: none !important;
						color: rgba(53, 83, 172, 1) !important;
					}

					:deep(.el-input__inner)::placeholder {
						color: rgba(53, 83, 172, 0.3) !important;
					}
				}

			}
			.to_btn_container{
				display: flex;
				justify-content: flex-end;
				height: 0.32rem;
				.select_content{
					display: flex;
					background: var(--bgWhiteColor);
					align-items: center;
					border-radius: var(--borderRadius6);
					.token_img_content{
						margin-left: 0.08rem;
						width: 0.24rem;
						height: 0.24rem;
						display: flex;
						align-items: center;
						justify-content: center;
						img{
							width: 100%;
						}
					}
					.token_name{
						margin-left: 0.08rem;
						color: var(--fontColorBlack);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						font-weight: var(--fontWt400);
					}
					.select_icon{
						width: 0.48rem;
						height: 0.2rem;
						display: flex;
						align-items: center;
					}
				}
			}
		}
	}
</style>
