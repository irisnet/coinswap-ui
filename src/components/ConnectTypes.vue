<template>
	<div class="connect_types_container">
		<div class="connect_types_wrap">
			<div class="connect_types_card_content">
				<div class="connect_types_card_title_content">
					<p class="connect_types_card_title">{{ $t('navigation.walletConnect') }}</p>
					<div class="connect_types_close_btn" @click.stop="closeWalletList()">
						<iconfont-component icon-name="icon-guanbi"></iconfont-component>
					</div>
				</div>
				<div class="wallet_list_content"
					 v-for="(item,index) in walletList"
					 :key="index" @click="choiceWallet(item.name)">
					<div class="wallet_item_img">
						<img :src="item.src" alt="">
					</div>
					<span class="wallet_name">{{ item.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "./IconfontComponent";
import {KEPLR_WALLET} from "../constant";
const {VUE_APP_CHAINID} = process.env
export default {
	name: "ConnectTypes",
	components: {IconfontComponent},
	data() {
		return {
			walletList: [
				{
					name: KEPLR_WALLET,
					src: require('../assets/img/walletChoiceImage/keplr_logo.png')
				},
			]
		}
	},
	mounted() {
		const currentLoginWallet = KEPLR_WALLET
		window.addEventListener("keplr_keystorechange", () => {
			if (currentLoginWallet === KEPLR_WALLET && this.$store.state.isConnected) {
				this.connectKeplrWallet(KEPLR_WALLET)
			}
		})
		const downloadKeplrStatus = sessionStorage.getItem('isDownloadKeplr') ? JSON.parse(sessionStorage.getItem('isDownloadKeplr')) : null
		
		if (downloadKeplrStatus?.path && downloadKeplrStatus?.status) {
			this.connectKeplrWallet(KEPLR_WALLET)
		}
	},
	methods: {
		closeWalletList() {
			this.$store.commit('walletListMask', false)
		},
		choiceWallet(name) {
			switch (name) {
				case KEPLR_WALLET:
					this.connectKeplrWallet(name)
					break;
			}
			this.$store.commit('walletListMask', false)
		},
		async connectKeplrWallet(name) {
			await this.getKeplr()
			if (window?.keplr) {
				let address = await window.keplr.getKey(VUE_APP_CHAINID).catch(error => {
				})
				if (address?.bech32Address) {
					localStorage.setItem('currentWallet', JSON.stringify(name))
					this.$store.commit('currentWallet', JSON.stringify(name))
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
	}
}
</script>

<style scoped lang="scss">
.connect_types_container {
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
	
	.connect_types_wrap {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.connect_types_card_content {
			background: var(--bgWhiteColor);
			border-radius: var(--borderRadius8);
			width: 4.08rem;
			box-sizing: border-box;
			padding: 0.24rem;
			@media (max-width: 430px) {
				margin: 0 0.2rem;
			}
			
			.connect_types_card_title_content {
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.24rem;
				
				.connect_types_card_title {
					font-size: var(--fontSize20);
					font-weight: bolder;
					line-height: 0.2rem;
				}
				
				.connect_types_close_btn {
					width: 0.16rem;
					height: 0.16rem;
					cursor: pointer;
				}
			}
			
			.wallet_list_content {
				display: flex;
				box-sizing: border-box;
				padding: 0.12rem 0.24rem;
				border: 0.01rem solid rgba(216, 216, 216, 1);
				border-radius: var(--borderRadius4);
				align-items: center;
				margin-top: 0.08rem;
				cursor: pointer;
				
				.wallet_item_img {
					width: 0.4rem;
					height: 0.4rem;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 0.16rem;
					
					img {
						width: 100%;
					}
				}
			}
		}
	}
}
</style>