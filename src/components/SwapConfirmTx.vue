<template>
    <div class="swap_confirm_container">
        <div class="swap_confirm_content_wrap">
            <div class="swap_confirm_content_title_content">
                <span class="swap_confirm_content_title">Confirm Coinswap</span>
                <span class="swap_confirm_content_close_icon" @click.stop="closeSwapConfirmTxBox">
					<iconfont-component icon-name="icon-guanbi"></iconfont-component>
				</span>
            </div>
            <div class="swap_token_from_token_content">
                <div class="swap_token_from_to_token_left">
                    <img :src="$store.state.selectedFromToken ? setImageSrc($store.state.selectedFromToken) : ''"
                         alt="">
                    <span class="swap_token_form_value">{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(displayFromToken)) }}</span>
                </div>
                <span
                    class="swap_token_from_name ">{{
                        $store.state.selectedFromToken.symbol ? $store.state.selectedFromToken.symbol.toUpperCase() : ''
                    }}</span>
            </div>
            <p class="swap_token_icon">
                <iconfont-component icon-name="icon-jiantou"></iconfont-component>
            </p>
            <div class="swap_token_to_token_content">
                <div class="swap_token_to_token_left">
                    <img :src="$store.state.selectedToToken ? setImageSrc($store.state.selectedToToken) : ''" alt="">
                    <span class="swap_token_to_token_value">{{ Tools.formatDecimalPartToLong(Tools.formatBigNumber(displayToToken)) }}</span>
                </div>
                <span
                    class="swap_token_to_name">{{
                        $store.state.selectedToToken.symbol ? $store.state.selectedToToken.symbol.toUpperCase() : ''
                    }}</span>
            </div>
            <div class="price_update" v-if="$store.state.isPriceUpdate">
                <div class="price_update_content">
					<span class="price_update_icon">
						<iconfont-component icon-name="icon-jinggao"></iconfont-component>
					</span>
                    <span class="price_update_label">Price Updated</span>
                </div>
                <div class="accept_button">
                    <span class="accept_button_label">Accept</span>
                </div>
            </div>
            <p class="swap_token_tooltip_content">
                {{ tooltip }}
            </p>
            <div class="swap_token_tx_tooltip_content">
                <p class="swap_token_tx_content">
                    <span class="swap_token_tx_label">{{ $t('price.title') }}</span>
                    <span class="swap_token_tx_value">{{ price }}</span>
                </p>
                <p class="swap_token_tx_content">
                    <span class="swap_token_tx_label" v-if="!isShowMinimum">{{ $t('txTooltip.minReceived') }}</span>
                    <span class="swap_token_tx_label" v-if="isShowMinimum">{{ $t('txTooltip.maxSold') }}</span>
                    <span class="swap_token_tx_value">
						{{ minimumReceived }}
					</span>
                </p>
                <p class="swap_token_tx_content">
                    <span class="swap_token_tx_label">{{ $t('txTooltip.priceImpact') }}</span>
                    <span class="swap_token_tx_value" :style="{color:isChangeColor}"> {{ priceImpact }} %</span>
                </p>
                <p class="swap_token_tx_content">
                    <span class="swap_token_tx_label">{{ $t('txTooltip.liquidityProviderFee') }}</span>
                    <span class="swap_token_tx_value">{{ liquidityFee }}</span>
                </p>
            </div>
            <div class="swap_token_confirm_button_content" @click="sendTx">
                <confirm-button></confirm-button>
            </div>
        </div>
    </div>
</template>

<script>
import IconfontComponent from "./IconfontComponent";
import ConfirmButton from "./ConfirmButton";
import Tools from "../util/utils";
import {getClient, singleConfig, SwapOrderUnsignedTX, broadcastTx, queryBankBalance} from '../util/sdkHelper'
import {fee, chainId, KEPLR_WALLET, WALLET_CONNECT_WALLET, BROADCASTING, insufficientFee} from "../constant/index"
import {showBroadcasting} from "../util/notifyPopUp"
const {VUE_APP_FEE} = process.env
export default {
    name: "SwapConfirmTx",
    components: {ConfirmButton, IconfontComponent},
    data() {
        return {
            client: null,
            Tools,
            storageTx: [],
            defaultImageSrc: require('../assets/img/logo/LOGO_Dafult.png')
        }
    },
    methods: {
        matchLogo(item) {
            const configs = JSON.parse(localStorage.getItem('config')).length ? JSON.parse(localStorage.getItem('config')) : [];
            let image = '';
            configs?.forEach(config => {
                if(config?.denom == item) {
                    image = config.icon;
                }
            })
            return image ? image : this.defaultImageSrc;
        },
        closeSwapConfirmTxBox() {
            this.$store.commit('isShowSwapConfirmTxBox', false)
        },
        async broadcastSwapTx(signTxData) {
            await broadcastTx(this.client, signTxData).then(res => {
                if (res && res.hash) {
                    this.$store.commit('isWaitingConfirmBox', false)
	                this.$store.commit('autoSetFromIpt', 0)
	                this.$store.commit('autoSetToIpt',0)
	                this.$store.commit('isFromConversion', null)
                    showBroadcasting(BROADCASTING);
                    

                    this.$store.commit('isWaitPending', true)

                } else {
                    this.$store.commit('isWaitingConfirmBox',false)
                    this.$store.commit('isBroadcastTxError', true)
                }
            }).catch(error => {
                console.log(error, 'error Info');
                this.$store.commit('isBroadcastTxError', true)
            });
        },
        async validatorTxBalance() {
            let address = this.$store.state.address
            let isNotNext = true
            const feeDenom = JSON.parse(VUE_APP_FEE).denom || ''
            let userCurrentBalance = await queryBankBalance(this.$store.state.address, feeDenom)
            const swapIncludesIrisTxFee = JSON.parse(VUE_APP_FEE).amount
            const swapNotIncludesIrisTxFee = Tools.bigNumberMultiply(JSON.parse(VUE_APP_FEE).amount, 2)
            if (this.$store.state.swapObj
                && this.$store.state.swapObj.input.denom === feeDenom
                || this.$store.state.swapObj.output.denom === feeDenom) {
                if (Number(userCurrentBalance?.balance?.amount) < Number(swapIncludesIrisTxFee)) {
                    isNotNext = false
                }
            } else if (this.$store.state.swapObj
                && this.$store.state.swapObj.input.denom === feeDenom
                && this.$store.state.swapObj.output.denom === feeDenom) {
                if (Number(userCurrentBalance?.balance?.amount) < Number(swapNotIncludesIrisTxFee)) {
                    isNotNext = false
                }
            }
            return isNotNext
        },
        async sendTx() {
            let data = await this.validatorTxBalance()
            if (!data) {
	            const notifyData = JSON.parse(JSON.stringify(insufficientFee))
	            this.$store.commit('transactionResult',notifyData)
                return
            }
            this.$store.commit('isBroadcastTxError', false)
            const config = JSON.parse(localStorage.getItem('walletconnect')) || null
            this.$store.commit('isWaitingConfirmBox', true)
            const currentConnectWallet = KEPLR_WALLET
            if (this.$store.state.swapObj) {
                SwapOrderUnsignedTX(this.client, chainId, this.$store.state.swapObj).then(result => {
					if(result?.code){
						this.$store.commit('isWaitingConfirmBox', false)
						this.$store.commit('isBroadcastTxError', true)
						return;
					}
                    if (result && fee) {
                        if (currentConnectWallet && currentConnectWallet === KEPLR_WALLET) {
                            this.broadcastSwapTx(result)
                            return
                        }
                        if (currentConnectWallet && currentConnectWallet === WALLET_CONNECT_WALLET) {
                            let txData = {
                                id: 1,
                                jsonrpc: "2.0",
                                method: "call_request",
                                params: {
                                    chainId: 566,
                                    request: {
                                        method: "tx_sign",
                                        params: [
                                            {
                                                fee: [fee],
                                                unsignTxStr: result
                                            }
                                        ]
                                    }
                                }
                            }
                            if (config) {
                                let connector = new walletConnector(config)
                                connector.sendCustomRequest(txData).then(signTxData => {
                                    if (signTxData) {
                                        this.$store.commit('isWaitingConfirmBox', false)
                                        this.$store.commit('isWaitPending', true)
                                        this.broadcastSwapTx(signTxData)
                                    }
                                }).catch(e => {
                                    console.log(e, "send error")
                                    this.$store.commit('isWaitingConfirmBox', false)
                                    location.reload();
                                })
                            }
                        }
                    }
                }).catch(e => {
                    console.log(e, 'build tx')
                })
            }
            this.$store.commit('isShowSwapConfirmTxBox', false)
        },
    },

    computed: {
        setImageSrc() {
            return function(selectToken) {
                if (selectToken) {
                    return this.matchLogo(selectToken.denom);
                }
            }
        },
        tooltip() {

            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
                const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
                if (this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder) {
                    return `Output is estimated. You will receive at least ${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.minimumReceived, this.$store.state.selectedToToken.scale), toDecimal)))} ${this.$store.state.selectedToToken.symbol.toUpperCase()} or the transaction will revert.`
                }
                if (this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder) {
                    return `Output is estimated. You will sold at most  ${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.maximumSold, this.$store.state.selectedFromToken.scale), fromDecimal)))} ${this.$store.state.selectedFromToken.symbol.toUpperCase()} or the transaction will revert.`
                }

            }
        },
        displayToToken() {
            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
                if (this.$store.state.isFromConversion) {
                    return Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedToToken, this.$store.state.isFromConversion.to.amount), toDecimal)
                }
            }
        },
        displayFromToken() {
            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
                if (this.$store.state.isFromConversion) {
                    return Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedFromToken, this.$store.state.isFromConversion.from.amount), fromDecimal)
                }
            }
        },
        isChangeColor() {
            if (Number(this.priceImpact) > 5) {
                return 'rgba(255, 98, 98, 1)'
            } else if (3 < Number(this.priceImpact) && Number(this.priceImpact) < 5) {
                return 'rgba(255, 167, 0, 1)'
            } else if (1 < Number(this.priceImpact) && Number(this.priceImpact) < 3) {
                return 'rgba(112, 144, 255, 1)'
            } else if (Number(this.priceImpact) < 1) {
                return "rgba(109, 212, 0, 1)"
            }
        },
        isShowMinimum() {
            if (this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder) {
                return false
            }
            if (this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder) {
                return true
            }
        },
        price() {
            if (this.$store.state.selectedToToken && this.$store.state.selectedFromToken) {
                const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
                const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
                let raito;
                if (this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder) {
                    raito = this.$store.state.selectedToToken.scale - this.$store.state.selectedFromToken.scale;
                    return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.fromRaito, raito), toDecimal)))} ${this.$store.state.selectedToToken.symbol.toUpperCase()} / ${this.$store.state.selectedFromToken.symbol.toUpperCase()}`
                }
                if (this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder) {
                    raito = this.$store.state.selectedFromToken.scale - this.$store.state.selectedToToken.scale
                    return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.toRaito, raito), fromDecimal)))} ${this.$store.state.selectedFromToken.symbol.toUpperCase()} / ${this.$store.state.selectedToToken.symbol.toUpperCase()}`
                }
            }
        },
        priceImpact() {
            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                if (this.$store.state.isFromConversion) {
                    let priceImpact = (this.$store.state.isFromConversion.priceImpact * 100).toFixed(2)
                    if (Number(priceImpact) < 0.01) {
                        return `< 0.01`
                    }
                    return `${priceImpact}`
                }
            }
            return ''
        },
        minimumReceived() {
            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
                const toDecimal = Number(this.$store.state.selectedToToken.scale) || 0;
                if (this.$store.state.isFromConversion && !this.$store.state.isFromConversion.isBuyOrder) {
                    return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.minimumReceived, this.$store.state.selectedToToken.scale), toDecimal)))} ${this.$store.state.selectedToToken.symbol.toUpperCase()}`
                }
                if (this.$store.state.isFromConversion && this.$store.state.isFromConversion.isBuyOrder) {
                    return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.formatPrice(this.$store.state.isFromConversion.maximumSold, this.$store.state.selectedFromToken.scale), fromDecimal)))} ${this.$store.state.selectedFromToken.symbol.toUpperCase()}`
                }

            }
        },
        liquidityFee() {
            if (this.$store.state.selectedFromToken && this.$store.state.selectedToToken) {
                const fromDecimal = Number(this.$store.state.selectedFromToken.scale) || 0;
                if (this.$store.state.isFromConversion) {
                    return `${Tools.formatDecimalPartToLong(Tools.formatBigNumber(Tools.formatDecimal(Tools.maxToMin(this.$store.state.selectedFromToken, this.$store.state.isFromConversion.liquidityProviderFee.amount), fromDecimal)))} ${this.$store.state.selectedFromToken.symbol.toUpperCase()}`
                }
            }
            return ''
        }
    },
    async mounted() {
        this.client = await getClient(singleConfig);
    }
}
</script>

<style scoped lang="scss">
.swap_confirm_container {
    position: fixed;
    left: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 101;

    .swap_confirm_content_wrap {
        width: 4.24rem;
        background: var(--bgWhiteColor);
        border-radius: var(--borderRadius8);
        box-sizing: border-box;
        padding: var(--boxPadding24);
        margin-bottom: 0.14rem;
        @media (max-width: 456px) {
            margin: 0 0.16rem 0.14rem 0.16rem;
        }

        .swap_confirm_content_title_content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.24rem;

            .swap_confirm_content_title {
                font-size: var(--fontSize20);
                line-height: var(--lineHeight32);
                font-weight: var(--fontWt600);
                color: var(--fontColorBlack);
            }

            .swap_confirm_content_close_icon {
                width: 0.16rem;
                height: 0.16rem;
                cursor: pointer;
            }
        }

        .swap_token_from_token_content {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .swap_token_from_to_token_left {
                display: flex;
                align-items: center;

                img {
                    width: 0.24rem;
                    height: 0.24rem;
                }

                .swap_token_form_value {
                    font-size: var(--fontSize20);
                    line-height: var(--lineHeight20);
                    font-weight: var(--fontWt600);
                    color: rgba(53, 83, 172, 1);
                    margin-left: 0.16rem;
                }
            }

            .swap_token_from_name {
                font-size: var(--fontSize14);
                line-height: var(--lineHeight20);
                color: var(--fontColorBlack65);
                font-weight: var(--fontWt400);
            }
        }

        .price_update {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: var(--borderRadius8);
            border: 0.01rem solid rgba(255, 166, 0, 1);
            box-sizing: border-box;
            padding: 0.12rem 0.08rem;
            margin: 0.16rem 0;

            .price_update_content {
                display: flex;
                align-items: center;

                .price_update_icon {
                    width: 0.24rem;
                    height: 0.24rem;
                    display: inline-block;
                }

                .price_update_label {
                    margin-left: 0.08rem;
                    font-size: var(--fontSize16);
                    line-height: var(--lineHeight20);
                    color: var(--fontColorBlack65)
                }
            }

            .accept_button {
                .accept_button_label {
                    background: var(--btnColor);
                    border-radius: var(--borderRadius8);
                    font-size: var(--fontSize16);
                    line-height: var(--lineHeight20);
                    color: var(--fontColor1);
                    padding: 0.06rem 0.08rem;
                    cursor: pointer;
                }
            }
        }

        .swap_token_icon {
            width: 0.12rem;
            height: 0.12rem;
            margin-left: 0.05rem;
        }

        .swap_token_to_token_content {
            margin-top: 0.14rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.16rem;

            .swap_token_to_token_left {
                display: flex;
                align-items: center;

                img {
                    width: 0.24rem;
                    height: 0.24rem;
                }

                .swap_token_to_token_value {
                    font-size: var(--fontSize20);
                    line-height: var(--lineHeight20);
                    font-weight: var(--fontWt600);
                    color: rgba(53, 83, 172, 1);
                    margin-left: 0.16rem;
                }
            }

            .swap_token_to_name {
                font-size: var(--fontSize14);
                line-height: var(--lineHeight20);
                color: var(--fontColorBlack65);
                font-weight: var(--fontWt400);
            }
        }

        .swap_token_tooltip_content {
            font-size: var(--fontSize14);
            line-height: var(--lineHeight20);
            color: var(--fontColorBlack65);
            margin-bottom: 0.16rem;
        }

        .swap_token_tx_tooltip_content {
            border-top: 0.01rem solid var(--lineColor);
            padding-top: 0.16rem;

            .swap_token_tx_content {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.08rem;
                @media (max-width: 375px) {
                    flex-direction: column;
                }

                .swap_token_tx_label {
                    font-size: var(--fontSize14);
                    line-height: var(--lineHeight20);
                    color: var(--fontColorBlack65);
                }

                .swap_token_tx_value {
                    font-size: var(--fontSize14);
                    line-height: var(--lineHeight20);
                    color: var(--btnColor);
                    font-weight: var(--fontWt600);
                }
            }

            .swap_token_tx_content:last-child {
                margin-bottom: 0;
            }

            .swap_token_tx_content:nth-child(3) {
                .swap_token_tx_value {
                    color: rgba(94, 183, 0, 1);
                }
            }
        }

        .swap_token_confirm_button_content {
            margin-top: 0.17rem;
        }
    }
}
</style>
