<template>
	<div class="farm_stake_container">
		<div class="farm_stake_content">
			<p class="farm_stake_title_content" :class="isDisplayStyle ? 'farm_stake_title_content_other_style' : ''">
				<span class="farm_stake_title_label">{{$t('farm.stakedCard.lpTokenTitle')}}</span>
<!--				<span class="farm_stake_balance_content_wrap" v-show="$store.state.isConnected"  :class="isDisplayStyle ? 'farm_stake_balance_content_wrap_other_style' : ''">
					<span class="farm_stake_balance_label">{{$t('farm.stakedCard.lpBalanceLabel')}}</span>
					<span class="farm_stake_balance_value" :class="isDisplayStyle ? 'farm_stake_balance_value_other_style' : ''">{{Number(lpBalance) > 0 ? formatLpBalanceNumber(lpBalance) : '0'}}</span>
				</span>-->
			</p>
			<div class="farm_stake_stake_button_content">
				<span v-show="$store.state.isConnected" class="farm_stake_value">{{formatLpBalanceNumber(lpStaked)}}</span>
				<span v-show="!$store.state.isConnected">--</span>
			</div>
			<div class="farm_un_stake_button_content" v-show="$store.state.isConnected">
				<el-button class="farm_un_stake_button" type="primary" :disabled="isUnStake" @click="unStakeLp('unstake')">{{$t('farm.stakedCard.unstake')}}</el-button>
			</div>
		</div>
	</div>
</template>

<script>
	import Tools from "../../util/utils";
	import {queryBankBalance} from "../../util/sdkHelper";
	import {irisAmount, irisTxDenom, MAX_DISPLAY_LPT_AVAILABLE} from "../../constant";
  const {VUE_APP_FEE} = process.env
	export default {
		name: "FarmStake",
		props:{
			activeStake:{
				type:Boolean
			},
			stakeUnStakeData:{
				type:Object
			}
		},
		watch:{
			stakeUnStakeData:{
				handler(){
					let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
					if(baseToken && this?.stakeUnStakeData?.lpBalance){
						this.lpBalance = Tools.maxToMin(baseToken,this.stakeUnStakeData.lpBalance)
					}else {
						this.lpBalance = ''
					}
					if(baseToken && this?.stakeUnStakeData?.lpStaked){
						this.lpStaked = Tools.maxToMin(baseToken,this.stakeUnStakeData.lpStaked)
					}else {
						this.lpStaked = ''
					}
				},
				deep:true,
				immediate: true
			},
		},
		data() {
			return {
				lpBalance:'0',
				lpStaked:'0',
				messageBoxStatus:  false,
			}
		},
		computed:{
			isStake (){
				if(this.stakeUnStakeData && this.stakeUnStakeData.lpBalance > 0 && this.stakeUnStakeData?.status !== 1 && this.stakeUnStakeData?.activityOn  && this.$store.state.isConnected ){
					return  false
				}else {
					return true
				}
			},
			isUnStake(){
				if(this.stakeUnStakeData && this.stakeUnStakeData.lpStaked > 0 && this.$store.state.isConnected ){
					return  false
				}else {
					return true
				}
			},
            isDisplayStyle() {
                return Number(this.lpBalance) > 0 && this.formatLpBalanceNumber(this.lpBalance)?.toString()?.length > MAX_DISPLAY_LPT_AVAILABLE;
            }
		},
		mounted(){
			let baseToken = JSON.parse(sessionStorage.getItem('baseToken'))
			if(baseToken && this?.stakeUnStakeData?.lpBalance){
				this.lpBalance = Tools.maxToMin(baseToken,this.stakeUnStakeData.lpBalance)
			}else {
				this.lpBalance = '0'
			}
			if(baseToken && this?.stakeUnStakeData?.lpStaked){
				this.lpStaked = Tools.maxToMin(baseToken,this.stakeUnStakeData.lpStaked)
			}else {
				this.lpStaked = '0'
			}
			if(this.$store.state.toFarmDenom && this.$store.state.toFarmDenom === this.stakeUnStakeData.lpToken){
				this.stakeLp('stake')
			}
		},
		methods:{
			formatLpBalanceNumber(number){
				return Tools.formatDecimalPartToLong(Tools.formatBigNumber(number))
			},
			async validatorBalance (type) {
				let isNextStep = true
				let feeAmount =  JSON.parse(VUE_APP_FEE)?.amount || ''
				if (this.$store.state.address) {
					let currentAccountAmount = await queryBankBalance(this.$store.state.address, irisTxDenom)
					let userSendTxMinFee = currentAccountAmount.balance.amount
					let needMinFee = 0
					if (currentAccountAmount?.balance?.amount >= 0 && feeAmount) {
						if (type === 'stake') {
							needMinFee = feeAmount
						} else if (type === 'unstake') {
							needMinFee = Tools.bigNumberAdd(irisAmount, feeAmount)
						}
					}
					if (Number(userSendTxMinFee) < Number(needMinFee)) {
						isNextStep = false
					}
					
				} else {
					isNextStep = false
				}
				return isNextStep
			},
			async unStakeLp(type){

				this.$store.commit('isShowStakeMask',{
					isShow:true,
					type: 'unStake',
					data: this.stakeUnStakeData
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.farm_stake_container{
		margin-top: 0.08rem;
		border: 0.01rem solid var(--poolBorderColor);
		border-radius: var(--borderRadius8);
		box-sizing: border-box;
		padding: 0.08rem 0.16rem;
		.farm_stake_content{
			@media (max-width: 375px) {
				display: flex;
				flex-direction: column;
			}
			.farm_stake_title_content{
				display: flex;
				justify-content: space-between;
				align-items: center;

				.farm_stake_title_label{
					font-size: var(--fontSize14);
					color:var(--fontColorBlack65);
					line-height: var(--lineHeight20);
				}
				.farm_stake_balance_content_wrap{
					.farm_stake_balance_label{
						font-size: var(--fontSize14);
						color: var(--fontColorBlack65);
						line-height: var(--lineHeight20);
					}
					.farm_stake_balance_value{
						margin-left: 0.04rem;
						font-size: var(--fontSize14);
						color:var(--fontColorBlack65)
					}
					.farm_stake_balance_value_other_style{
						margin-left: 0;
                        margin-top: 0.04rem;
					}
				}
                .farm_stake_balance_content_wrap_other_style {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
			}
            .farm_stake_title_content_other_style {
                align-items: flex-start;
            }
			.farm_stake_stake_button_content{
				margin-top: 0.08rem;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.farm_stake_value{
					color: var(--hoverColor);
					font-size: var(--fontSize20);
					line-height: var(--lineHeight32);
				}
				.default_stake_style{
					color: var(--fontColorBlack65);
				}
				.farm_stake_button{
					border-radius: var(--borderRadius6);
					background: var(--hoverColor);
					border: none;
					font-size: var(--fontSize16);
					line-height: var(--lineHeight20);
					padding: 0.06rem 0.2rem;
					font-weight: var(--fontWt400);
				}
				.is-disabled{
					background: var(--tooltipBoxBorderColor);
					cursor: default;
					border: none;
				}
			}
			.farm_un_stake_button_content{
				margin-top: 0.08rem;
				.farm_un_stake_button{
					width: 100%;
					border-radius: var(--borderRadius8);
					background: var(--bgWhiteColor);
					border: 0.01rem solid var(--btnForbidColor);
					font-size: var(--fontSize16);
					line-height: var(--lineHeight20);
					color: var(--btnColor);
					padding: 0.09rem 0.2rem;
					font-weight: var(--fontWt400);
				}
				.is-disabled{
					background: var(--tooltipBoxBorderColor);
					cursor: default;
					color: var(--fontColorWhite);
					border: 0.01rem solid transparent;
				}
			}
		}
	}
</style>
