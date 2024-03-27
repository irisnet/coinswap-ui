<template>
	<div class="from_container">
		<div class="from_title_content">
			<span class="from_title_label">{{$t('poolFromInput.title')}}</span>
			<!-- balance -->
			<span class="from_balance_value_content" v-show="getBalance !== '--'"  v-if="$store.state.isConnected">
				<span class="from_balance_value_label">{{$t('poolFromInput.balance')}}</span>
				<span class="from_balance_value">{{Tools.formatBigNumber(getBalance)}}</span>
			</span>
		</div>
		<div class="ipt_select_content">
			<!-- input -->
				<div class="ipt_content">
					<!-- @blur="unLockStandrad()" -->
					<el-input class="from_ipt"
					       v-iptOnlyNum
					       v-model="iptValue"
					       @focus="lockStandrad()"
					       @blur="unLockStandrad()"
					       @mousewheel.prevent
					          placeholder="0.0000" type="text"></el-input>
				</div>
				<!-- max -->
			<div class="from_content">
				<max-button-component v-if="isShowMaxBtn" @selectAll="selectAll()"></max-button-component>
				<!-- iris -->
				<standard-token-component />
			</div>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import MaxButtonComponent from "./MaxButtonComponent";
	import StandardTokenComponent from "./StandardTokenComponent";
	import Tools from "@/util/utils";
	import { decimalNum,fee,gas } from "@/constant";
  const {VUE_APP_FEE} = process.env
	export default {
		name: "StandardComponent",
		components: {
			MaxButtonComponent, StandardTokenComponent,IconfontComponent
		},
		data(){
			return {
				Tools,
				iptValue: null,
				isShowMaxBtn:false,
				decimalNum
			}
		},
		watch:{
            '$store.state.standardInputToken':{
                handler() {
                if(this.$store.state.standardInputToken && this.$store.state.standardInputToken.balance){
                  const feeAmount = JSON.parse(VUE_APP_FEE)?.amount || ''
                    if( Tools.bigNumberSubtract(this.$store.state.standardInputToken.balance, Number(feeAmount)) > 0){
                    this.isShowMaxBtn = true;
                    }else {
                    this.isShowMaxBtn = false;
                    }
                }else {
                    this.isShowMaxBtn = false;
                    this.iptValue = null;
                }
                },
                immediate: true
            },
			iptValue(){
				if(this.iptValue){
					this.iptValue = this.iptValue.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
				}

				this.$store.commit('standardIptValue',this.iptValue);
				this.iptValue < Number(this.maxIptValue) ? this.isShowMaxBtn = true : this.isShowMaxBtn = false;
			},
			'$store.state.standardIptValue'() {
				if(this.$store.state.standardIptValue) {
					this.iptValue = Tools.formatDecimal(this.$store.state.standardIptValue,decimalNum)
				} else {
					this.iptValue = null
				}
			}
		},
		computed:{
			getBalance(){
				if(this.$store.state.standardInputToken && this.$store.state.standardInputToken.balance){
					return Tools.maxToMin(this.$store.state.standardInputToken,this.$store.state.standardInputToken.balance)
				}
				return 0
			},
			maxIptValue() {
				const minUnitBalance = this.$store.state.standardInputToken.balance;
				const subtract = Tools.bigNumberSubtract(minUnitBalance,fee.amount)
				const displayBalance = Tools.maxToMin(this.$store.state.standardInputToken,subtract)
				if(displayBalance > 0) {
					return displayBalance
				} 
				return 0
			},
		},
		methods: {
			selectAll(){
				this.iptValue = this.maxIptValue;
				this.isShowMaxBtn = false;
				this.lockStandrad();
			},
			lockStandrad() {
				this.$store.commit("standardInputLock",true)
				this.$store.commit("tokenInputLock",false)
			},
			unLockStandrad() {
				this.$store.commit("standardInputLock",false)
				this.$store.commit("tokenInputLock",false)
			}
		},
	}
</script>

<style scoped lang="scss">
	.from_container{
		margin-top: var(--boxPadding24);
		box-sizing: border-box;
		background: var(--btnColor008);
		padding:var(--boxPadding16);
		border-radius: var(--borderRadius8);
		.from_title_content{
			display: flex;
			justify-content: space-between;
			font-size: var(--fontSize14);
			line-height: var(--lineHeight20);
			color: var(--fontColorBlack65);
			.from_balance_value_content{
				.from_balance_value{
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
			.from_content{
				display: flex;
				justify-content: flex-end;
				height: 0.32rem;
				.select_content {
					background: var(--poolBorderColor);
					:deep( .token_name ){
						color: var(--forbidText);
					}
					:deep( .select_icon ){
						color: var(--forbidText);
					}
				}
			}
			
		}
	}
</style>
