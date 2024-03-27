<template>
	<div class="transaction_setting_container">
		<div class="transaction_setting_content_wrap">
			<div class="transaction_title_content">
				<span class="transaction_title">{{$t('transactionSlippageSetting.title')}}</span>
				<span class="tooltip_content_icon">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="tooltip_content">
						{{$t('transactionSlippageSetting.settingTip')}}
					</div>
				</span>
			</div>
			<p class="tooltip_title">{{$t('transactionSlippageSetting.slippageTolerance')}}</p>
			<div class="slippage_set_btn_content">
				<div class="slippage_btn_container">
					<div class="slippage_btn"
					     v-for="(item,index) in slippageList"
					     @click.stop="selectSlippageList(index,item)"
					     :key="index" :class="item.isActive ? 'change_bg_color' : 'reset_bc_color'">
						<span class="slippage_value">{{item.value}} %</span>
					</div>
				</div>
				<div class="slippage_ipt_content" :class="isShowError ? 'error_border' : ''" :style="{'border-color': isChangeBorderColor ? 'var(--btnColor)':''}">
					<el-input
							class="slippage_ipt"
							type="number"
							v-model="slippageIptValue"
							@click.stop.native="changeBorderColor"
							@blur="confirmValue"
							placeholder="0.5"
							oninput="value=value.replace(/[^0-9.]/g,'')"
							></el-input>
					<span class="slippage_label">%</span>
				</div>
			</div>
			<p class="warring_tooltip_content" :class="isShowError ? 'error_color' : ''" v-if="isShowWarning">
				{{warningText}}
			</p>
		</div>
	</div>
	
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	import Tools from "../../util/utils";
	export default {
		name: "SwapTransactionSetting",
		components: {IconfontComponent},
		data() {
			return {
				isShowError:false,
				slippageIptValue: this.$store.state.slippageToleranceValue || '',
				isShowWarning:false,
				isShowErrorText:false,
				isChangeBorderColor:false,
				slippageList:[
					{
						value:0.1,
						isActive:false
					},
					{
						value: 0.5,
						isActive: true
					},
					{
						value: 1,
						isActive: false
					}
				],
				warningText: "",
			}
		},
		computed:{

		},
		watch:{
			'$store.state.isShowSetting'(){
				if(this.$store.state.isShowSetting) {
					this.showWarningText()
				}
			},
			slippageIptValue(){

				let str = this.slippageIptValue.toString()
				if(str.length > 6){
					str = str.substr(0,6)
				}
				this.slippageIptValue = str
				if(Number(this.slippageIptValue) < 0.5){
					this.isShowWarning = true
				}else {
					let slippageIptValueSte = this.slippageIptValue.toString()
					if((slippageIptValueSte > 49.99) || slippageIptValueSte && slippageIptValueSte.includes('.') && slippageIptValueSte.split('.')[1].length > 2){
						this.isShowErrorText = true
					}else {
						this.isShowWarning = false
						this.isShowErrorText = false
					}
				}

				
				let inputValue = this.slippageIptValue.toString()
				inputValue = inputValue.replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
				if(inputValue &&  inputValue.includes('.')){
					let decimals = inputValue.split('.')[1]
					if(decimals.length > 2){
						this.slippageIptValue = Tools.formatDecimal(this.slippageIptValue,2)
					}
				}
				this.showWarningText()
				this.isShowSlippageTolerance(this.slippageIptValue)
			}
		},
		methods:{
			showWarningText(){
				const slippageThreshold = 0.5
				const minFrontrunSlippageThreshold = 5
				const maxFrontrunSlippageThreshold = 49.99
				if(Number(this.slippageIptValue) < slippageThreshold){
					this.isShowWarning = true
					this.isShowError = false
					this.warningText = this['_i18n'].messages[this['_i18n'].locale].transactionSlippageSetting.warningTxFailed
				}else if( minFrontrunSlippageThreshold < Number(this.slippageIptValue) &&  Number(this.slippageIptValue) <= maxFrontrunSlippageThreshold){
					this.isShowWarning = true
					this.isShowError = false
					this.warningText =  this['_i18n'].messages[this['_i18n'].locale].transactionSlippageSetting.warningTxFrontrun
				}else if( Number(this.slippageIptValue) > maxFrontrunSlippageThreshold){
					this.isShowWarning = true
					this.isShowError = true
					this.warningText =  this['_i18n'].messages[this['_i18n'].locale].transactionSlippageSetting.warningTxPercentage
				}
			},
			changeBorderColor(){
				this.isChangeBorderColor = true
			},
			getIptValue(){
				this.slippageList.forEach(item => {
					item.isActive = false
				})
			},
			isShowSlippageTolerance(value){
				if(Number(value) !== 0.5){
					this.$store.commit('isShowSlippageTolerance',true)
				}else {
					this.$store.commit('isShowSlippageTolerance',false)
				}
			},
			selectSlippageList(index,item){
				this.slippageList.forEach(item => {
					item.isActive = false
				})
				this.slippageList[index].isActive = true
				this.slippageIptValue = this.slippageList[index].value
				this.$store.commit('slippageToleranceValue',this.slippageIptValue)
				this.isShowSlippageTolerance(item.value)
			},
			confirmValue() {
				if(this.slippageIptValue > 49.99) {
					this.slippageIptValue = this.$store.state.slippageToleranceValue
				} else {
					this.slippageIptValue = Tools.formatDecimal(this.slippageIptValue,2)
					
					this.$store.commit('slippageToleranceValue',Number(this.slippageIptValue))
				}
				this.isShowErrorText = false

				this.matchingButton()
			},
			matchingButton() {
				this.slippageList.forEach(item => {
					if(item.value == this.slippageIptValue) {
						item.isActive = true
					} else {
						item.isActive = false
					}
				})
			}
		},
		mounted() {
			this.matchingButton()
		}
	}
</script>

<style scoped lang="scss">
.transaction_setting_container{
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	right: 0;
	top: 0.45rem;
	.transaction_setting_content_wrap{
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		width: 4rem;
		box-sizing: border-box;
		padding: var(--boxPadding24);
		border: 0.01rem solid var(--tooltipBoxBorderColor);
		z-index: 20;
		@media (max-width: 460px) {
			padding: var(--boxPadding16);
			width: auto;
		}
		.transaction_title_content{
			display: flex;
			align-items: center;
			border-bottom: 0.01rem solid var(--lineColor);
			padding-bottom: 0.14rem;
			.transaction_title{
				font-size: var(--fontSize20);
				color: var(--fontColorBlack);
				font-weight: var(--fontWt600);
				line-height: var(--lineHeight32);
			}
			.tooltip_content_icon{
				display: inline-block;
				width: 0.16rem;
				height: 0.16rem;
				margin-left: 0.16rem;
				cursor: pointer;
				position: relative;
				&:hover{
					.tooltip_content{
						display: block;
					}
				}
				.tooltip_content{
					display: none;
					background: var(--bgWhiteColor);
					position: absolute;
					left: 0.32rem;
					bottom: -0.1rem;
					width: 2rem;
					border-radius: var(--borderRadius8);
					box-sizing: border-box;
					padding: var(--boxPadding16);
					font-size: var(--fontSize16);
					line-height: var(--lineHeight20);
					color: var(--fontColorBlack65);
					border: 0.01rem solid var(--tooltipBoxBorderColor);
					z-index: 20;
					&:after{
						content:url("../../assets/img/tips_icon.png");
						position:absolute;
						left: -0.08rem;
						bottom: 0.05rem;
						color: rgba(226, 233, 255, 1);
						z-index: 10;
					}
					@media (max-width: 620px) {
						left: -2.15rem;
						&:after{
							left: 1.98rem;
							transform: rotate(-180deg);
							bottom: 0.03rem;
						}
					}
				}
			}
		}
		.tooltip_title{
			margin: 0.14rem 0;
			color: var(--fontColorBlack65);
			line-height: var(--lineHeight20);
		}
		.slippage_set_btn_content{
			display: flex;
			@media (max-width: 460px) {
				flex-direction: column;
			}
			.slippage_btn_container{
				display: flex;
				.slippage_btn{
					width: 0.7rem;
					height: 0.32rem;
					border-radius: 0.16rem;
					text-align: center;
					line-height: 0.32rem;
					border: 0.01rem solid var(--tooltipBoxBorderColor);
					margin-right: 0.08rem;
					cursor: pointer;
					.slippage_value{
						font-size: var(--fontSize16);
						color:var(--fontColorBlack65)
					}
				}
				.change_bg_color{
					background: var(--btnColor);
					.slippage_value{
						color: var(--fontColor1);
					}
				}
				.reset_bc_color{
					background: transparent;
					color: var(--fontColorBlack65);
				}
			}
			
			
			.slippage_ipt_content{
				width: 1.12rem;
				border: 0.01rem solid rgba(112, 147, 255, 0.35);
				border-radius: 0.16rem;
				height: 0.32rem;
				display: flex;
				align-items: center;
				@media (max-width: 460px) {
					margin-top: 0.12rem;
				}
				.slippage_ipt{
					:deep(.el-input__inner){
						border: none;
						background: transparent;
						line-height: 1;
						font-size: var(--fontSize16);
						padding: 0;
						text-align: right;
						color: var(--fontColorBlack65);
					}
					:deep(.el-input__inner)::placeholder{
						color: var(--fontColorBlack3) !important;
					}
				}
				
				.slippage_label{
					margin-right: 0.1rem;
					color: var(--fontColorBlack65);
				}
			}
			.error_border{
				border-color: var(--errorColor)
			}
		}
		.warring_tooltip_content{
			margin-top: 0.08rem;
			font-size: var(--fontSize14);
			color: var(--warringColor);
		}
		.error_color{
			color: var(--errorColor);
		}
		.error_tooltip_content{
			margin-top: 0.08rem;
			font-size: var(--fontSize14);
			color: var(--errorColor);
		}
	}
}
</style>
