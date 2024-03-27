<template>
	<div class="wallet_connect_container">
		<div class="wallet_connect_content" v-if="!$store.state.address"
			 @click.stop="showWalletList()">
			<span class="iconfont icon-wallet"></span>
			<span class="wallet_connect_label">{{ $t('navigation.walletConnect') }}</span>
		</div>
		<div class="wallet_connect_address_content" @click.stop="showAddressCard" v-if="$store.state.address">
			<span class="keplr_logo_content">
				<img src="../../assets/img/walletChoiceImage/keplr_logo.png" alt="">
			</span>
			<span class="wallet_connect_address">
				{{ formatAddress }}
			</span>
			<!--TODO 发送交易中的展示框-->
			<!--			<span class="wallet_wait_pending_content">-->
			<!--				pending....-->
			<!--			</span>-->
		</div>
		<div class="address_content">
			<address-detail v-if="$store.state.addressCardIsClosed"></address-detail>
		</div>
	</div>
</template>

<script>
import Tools from "../../util/utils";
import AddressDetail from "../../components/AddressDetail";
import IconfontComponent from "../../components/IconfontComponent";
import {KEPLR_WALLET,WALLET_CONNECT_WALLET} from "@/constant";
const {VUE_APP_CHAINID,VUE_APP_FEE} = process.env
export default {
	name: "WalletConnectContent",
	components: {IconfontComponent, AddressDetail},
	data() {
		return {
			walletConnector: '',
			healthCheckTimer: null,
			id: '',
			dataTestTimer: null,
			isKeplr: false,
			currentWallet: 'keplr',
			keplrWallet : KEPLR_WALLET,
			walletWallet: WALLET_CONNECT_WALLET,
		}
	},
	watch: {
		'$store.state.isConnected'() {
			clearTimeout(this.dataTestTimer);
			clearTimeout(this.healthCheckTimer);
			this.dataTestTimer = null;
			this.healthCheckTimer = null;
		},
	},
	computed: {
		formatAddress() {
			return this.$store.state.address ? Tools.formatAddress(this.$store.state.address) : ''
		}
	},
	mounted() {
		this.walletConnector = JSON.parse(localStorage.getItem('walletconnect'))
		if (this.walletConnector && this.walletConnector.accounts && this.walletConnector.accounts.length) {
			this.$store.commit('address', this.walletConnector.accounts[0])
		}
		if (this.walletConnector?.connected) {
			this.$store.commit('isConnected', true)
		}
	},
	methods: {
		showAddressCard() {
			if (!this.$store.state.address) {
				return
			}
			this.$store.commit('closedAddressCard', true)
		},
    async getKeplr() {
      if (window.keplr) {
        return window.keplr;
      }

      if (document.readyState === "complete") {
        return window.keplr;
      }

      return new Promise((resolve) => {
        const documentStateChange = (event) => {
          if (
              event.target &&
              (event.target).readyState === "complete"
          ) {
            resolve(window.keplr);
            document.removeEventListener("readystatechange", documentStateChange);
          }
        };

        document.addEventListener("readystatechange", documentStateChange);
      });
    },
		async showWalletList() {
      console.log(process)
      await this.getKeplr()
      if (window?.keplr) {
        let address = await window.keplr.getKey(VUE_APP_CHAINID).catch(error => {
        })
        if (address?.bech32Address) {
          const walletConnectObj = {
            accounts: [address?.bech32Address],
            connected: true
          }
          localStorage.setItem('walletconnect', JSON.stringify(walletConnectObj))
          this.$store.commit('address', address?.bech32Address)
          this.$store.commit('isConnected', true)
        } else {
          this.$message.error(' Please check your Keplr.')
          sessionStorage.removeItem('isDownloadKeplr')
        }
      } else {
        this.$store.commit('downloadKeplr', true)
      }
		},
		getIsMobile() {
			if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
				return true
			} else {
				return  false
			}
		},
	}
}
</script>

<style scoped lang="scss">
.wallet_connect_container {
	background: var(--btnColor);
	border-radius: var(--borderRadius8);
	position: relative;
	
	.wallet_connect_content {
		text-align: center;
		cursor: pointer;
		.iconfont{
			padding-left: 0.16rem;
			color: var(--fontColorWhite);
			font-size: 0.16rem;
			line-height: 0.16rem;
		}
		.wallet_connect_label {
			display: inline-block;
			padding: 0.12rem 0.11rem;
			box-sizing: border-box;
			color: var(--fontColorWhite);
			/*font-weight: var(--fontWt600);*/
			line-height: 1;
		}
	}
	
	.wallet_connect_address_content {
		border-radius: var(--borderRadius8);
		color: var(--fontColorBlack65);
		background: var(--bgWhiteColor);
		display: flex;
		box-sizing: border-box;
		padding: 0.09rem 0.16rem;
		border: 0.01rem solid var(--btnForbidColor);
		cursor: pointer;
		
		.wallet_connect_icon {
			width: 0.24rem;
			height: 0.16rem;
			display: inline-block;
		}
		.keplr_logo_content{
			display: inline-block;
			width: 0.20rem;
			height: 0.20rem;
			img{
				width: 100%;
			}
		}
		
		.wallet_connect_address {
			margin-left: 0.16rem;
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
			color: var(--fontColorBlack65);
		}
	}
	
	.address_content {
		@media (max-width: 820px) {
			display: none;
		}
		position: absolute;
		right: 0;
		top: 0.64rem;
		z-index: 102;
	}
}

</style>
