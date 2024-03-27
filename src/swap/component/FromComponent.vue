<template>
	<div class="from_container">
		<div class="from_title_content">
			<span class="from_title_label">
				<span>{{ $t('swapInputFrom.title') }}</span>
				<span v-show="isShowExtimated"> {{ $t('swapInputFrom.estimated') }}</span>
			</span>
			<span class="from_balance_value_content" v-show="getBalance !== '--'" v-if="$store.state.isConnected">
				<span class="from_balance_value_label">{{ $t('swapInputFrom.balance') }}</span>
				<span class="from_balance_value">{{ getBalance }}</span>
			</span>
		</div>
		<div class="ipt_select_content">
			<div class="ipt_content">
				<el-input class="from_ipt"
				          v-model="iptValue"
				          @input="getInputValue()"
				          @blur="resetInputingStatus"
				          @paste="getInputValue()"
				          @mousewheel.prevent
				          v-iptOnlyNum
				          placeholder="0.0000"
				          type="text"></el-input>
				<max-button-component v-show="isShowMaxBtn" @selectAll="selectAll()"></max-button-component>
			</div>
			<div class="select_token_container">
				<defaule-select-token-component
					:isTo="false"
					:isFrom="true"
					v-show="!$store.state.selectedFromToken"></defaule-select-token-component>
				<form-select-token-component v-show="$store.state.selectedFromToken"></form-select-token-component>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "../../components/IconfontComponent";
import DefauleSelectTokenComponent from "./DefauleSelectTokenComponent";
import MaxButtonComponent from "./MaxButtonComponent";
import FormSelectTokenComponent from "./FromSelectTokenComponent";
import Tools from "../../util/utils";
import {MAX_NUMBER_LENGTH} from "../../constant";
const {VUE_APP_FEE} = process.env
export default {
	name: "FromComponent",
	components: {
		FormSelectTokenComponent,
		MaxButtonComponent, DefauleSelectTokenComponent, IconfontComponent
	},
	data() {
		return {
			Tools,
			iptValue: '',
			userBalance: this.$store.state.selectedFromToken && this.$store.state.selectedFromToken.value,
			isClickMaxBtn: false,
			isInputIng: false,
		}
	},
	watch: {
		iptValue() {
			if(this.iptValue){
				this.iptValue = this.iptValue.toString().replace(/[^\d^\.]+/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.')
			}

			if (this.$store.state.selectedFromToken && this.$store.state.selectedFromToken.scale) {
				const scale = this.$store.state.selectedFromToken.scale;
				const value = Tools.formatDecimal(this.iptValue, Number(scale) > MAX_NUMBER_LENGTH ? MAX_NUMBER_LENGTH : Number(scale) || 0);
				this.iptValue = value
			}
		},
		"$store.state.isFromConversion"() {
			if (this.$store.state.isFromConversion) {
				if (!this.isInputIng) {
					const scale = this.$store.state.selectedFromToken && this.$store.state.selectedFromToken.scale;
					this.iptValue = Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedFromToken, this.$store.state.isFromConversion.from.amount), Number(scale) || 0);
					if (this.$store.state.isFromConversion.from.amount < 0) {
						this.iptValue = null
					}
				}
			} else {
				this.iptValue = null
			}
		},
		'$store.state.autoSetToIpt'() {
			if (!Number(this.$store.state.autoSetToIpt)) {
				this.iptValue = ''
			}
		},

	},
	mounted() {
		if (this.$store.state.tokenList && this.$store.state.selectedFromToken) {
			this.$store.state.tokenList.forEach(item => {
				if (item.denom === this.$store.state.selectedFromToken.denom) {
					this.balance = Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedFromToken, item.balance), 6)
				}
			})
		}
	},
	computed: {
        isShowMaxBtn() {
            const baseToken = sessionStorage.getItem('baseToken') ? JSON.parse(sessionStorage.getItem('baseToken')) : {}
            const farmLpBalance = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : {}
            const balancesList = farmLpBalance?.balances?.balancesList || [];
            const balancesListMap = new Map();
            if(balancesList?.length) {
                balancesList.forEach(item => {
                    if(item.denom) {
                        balancesListMap.set(item.denom, item)
                    }
                })
            }
            if(balancesListMap.has(baseToken?.denom)) {
                const balance = balancesListMap.get(baseToken?.denom)?.amount || '';
                if (this.$store.state.isConnected && balance &&  this.getBalance !== '--' && Number(this.getBalance) > 0) {
                  const feeAmount = JSON.parse(VUE_APP_FEE).amount || ''
                    if( Tools.bigNumberSubtract(balance, Number(feeAmount)) > 0){
                        return true
                    }
                    return false
                }
                return false
            }
        },
		isShowExtimated() {
			if (this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder) {
				return true
			}
			return false
		},
		getBalance() {
			let balance = '--'
			if (this.$store.state.tokenList && this.$store.state.selectedFromToken) {
				this.$store.state.tokenList.forEach(item => {
					if (item.denom === this.$store.state.selectedFromToken.denom) {
						balance = Tools.maxToMin(this.$store.state.selectedFromToken, item.balance)
					}
				})
			}

			return balance === '--' ? '--' : Tools.formatDecimalPartToLong(Tools.formatBigNumber(balance))
		},
	},

	methods: {
		resetInputingStatus() {
			this.isInputIng = false
		},
		getInputValue() {
			this.isInputIng = true
			this.iptValue = this.iptValue.replace('--','')
			setTimeout(() => {
				this.iptValue = this.iptValue === '--' ? '' : this.iptValue
				if (!this.iptValue || Number(this.iptValue) === 0) {
					this.$store.commit('isFromConversion', null)
					this.$store.commit('autoSetToIpt', '')
					this.$store.commit('autoSetFromIpt', '')
				}
				if (this.$store.state.autoSetFromIpt) {
					if (this.$store.state.autoSetFromIpt === this.iptValue) {
						let copyInputValue = Number(this.iptValue)
						this.$store.commit("autoSetFromIpt", copyInputValue)
					} else {
						this.$store.commit('autoSetFromIpt', this.iptValue)
					}
				} else {
					this.$store.commit('autoSetFromIpt', this.iptValue)
				}
			}, 300)
		},
		selectAll() {
			this.$store.commit('isClickMaxBtn', true)
			let clickedMaxBtnInputValue = this.$store.state.selectedFromToken.balance
      const feeDenom = JSON.parse(VUE_APP_FEE).denom || ''
      const feeAmount = JSON.parse(VUE_APP_FEE).amount || ''
			if (this.$store.state.selectedFromToken?.denom === feeDenom) {
				clickedMaxBtnInputValue = Tools.bigNumberSubtract(this.$store.state.selectedFromToken.balance, Number(feeAmount))
			}
			this.iptValue = Tools.maxToMin(this.$store.state.selectedFromToken, clickedMaxBtnInputValue)
			this.iptValue = Tools.formatDecimalPartToLong(this.iptValue)
			if (this.$store.state.autoSetFromIpt) {
				if (this.$store.state.autoSetFromIpt === this.iptValue) {
					let copyInputValue = Number(this.iptValue)
					this.$store.commit("autoSetFromIpt", copyInputValue)
				} else {
					this.$store.commit('autoSetFromIpt', this.iptValue)
				}
			} else {
				this.$store.commit('autoSetFromIpt', this.iptValue)
			}
		},

	},
}
</script>

<style scoped lang="scss">
.from_container {
	margin-top: var(--boxPadding24);
	box-sizing: border-box;
	background: var(--btnColor008);
	padding: var(--boxPadding16);
	border-radius: var(--borderRadius8);

	.from_title_content {
		display: flex;
		justify-content: space-between;
		font-size: var(--fontSize14);
		line-height: var(--lineHeight20);
		color: var(--fontColorBlack65);

		.from_balance_value_content {
			.from_balance_value {
				margin-left: 0.04rem;
			}
		}
	}

	.ipt_select_content {
		margin-top: 0.16rem;
		display: flex;
		@media(max-width: 820px) {
			flex-direction: column;
		}

		.ipt_content {
			flex: 1;
			width: 100%;
			display: flex;
			justify-content: space-between;

			.from_ipt {
				width: 100%;
				background: transparent;
				border: none;
				font-size: var(--fontSize28);
				color: rgba(53, 83, 172, 1);
				font-weight: var(--fontWt600);

				:deep( .el-input__inner ){
					background: transparent !important;
					padding: 0;
					border: none !important;
					color: rgba(53, 83, 172, 1) !important;
				}

				:deep(.el-input__inner)::placeholder {
					color: rgba(53, 83, 172, 0.3) !important;
				}

				@media (max-width: 460px) {
					width: 1.6rem;
				}
				@media (max-width: 360px) {
					font-size: var(--fontSize24);
				}
			}

			.from_ipt::placeholder {
				color: rgba(53, 83, 172, 0.3);
				font-weight: 600;
			}
		}

		.select_token_container {
			@media (max-width: 820px) {
				width: 100%;
				display: flex;
				justify-content: flex-end;
				height: 0.4rem;
				margin-top: 0.08rem;
			}
		}
	}
}
</style>
