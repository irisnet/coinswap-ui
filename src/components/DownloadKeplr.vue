<template>
	<div class="download_keplr_container">
		<div class="download_keplr_content">
			<p class="download_keplr_title">{{$t('downloadKeplr.title')}}</p>
			<div class="download_block">
				<a class="link_content" href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap" target="_blank" rel="noreferrer noopener">
					<img class="chrome_logo" src="../assets/img/logo_google.png" alt="">
					<p class='download_keplr_for_chrome'>{{$t('downloadKeplr.installLabel')}}</p>
				</a>
			</div>
			<p class="download_keplr_refresh_label">
				<span class="download_keplr_text">{{$t('downloadKeplr.please')}}</span>
				<span class="download_keplr_refresh_text" @click="refreshPage()">{{$t('downloadKeplr.refresh')}}</span>
				<span class="download_keplr_text">{{$t('downloadKeplr.refreshText')}}</span>
			</p>
		</div>
	</div>
</template>

<script>
import IconfontComponent from "@/components/IconfontComponent";
export default {
	name: "DownloadKeplrWallet",
	components: {IconfontComponent},
	methods:{
		closeDownloadKeplr(){
			this.$store.commit('downloadKeplr',false)
			this.$store.commit('walletListMask',true)
			
		},
		refreshPage(){
			const downloadKewplrStatusObj = {
				path: this.$route.path,
				status: true
			}
			sessionStorage.setItem('isDownloadKeplr',JSON.stringify(downloadKewplrStatusObj))
			window.location.reload()
		}
	}
}
</script>

<style scoped lang="scss">
	.download_keplr_container{
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
		.download_keplr_content{
			box-sizing: border-box;
			background: var(--bgWhiteColor);
			border-radius: var(--borderRadius8);
			max-width: 3.38rem;
			padding: 0.24rem;
			.download_keplr_title{
				font-size: var(--fontSize20);
				line-height: 0.24rem;
				color:var(--fontColorBlack)
			}
			.download_block{
				margin-top: 0.24rem;
				border: 0.01rem solid rgba(216, 216, 216, 1);
				border-radius: var(--borderRadius4);
				box-sizing: border-box;
				padding: 0.1rem 0.24rem;
				.link_content{
					display: flex;
					align-items: center;
					.chrome_logo{
						max-width: 0.56rem;
					}
					.download_keplr_for_chrome{
						margin-left: 0.16rem;
						font-size: var(--fontSize20);
						color:var(--fontColorBlack);
						line-height: 0.32rem;
					}
				}
			}
			.download_keplr_refresh_label{
				margin-top: 0.08rem;
				font-size: var(--fontSize14);
				line-height: 0.24rem;
				color: var(--fontColorBlack65);
				.download_keplr_text{
				
				}
				.download_keplr_refresh_text{
					color: var(--hoverColor);
					border-bottom: 0.01rem solid var(--hoverColor);
					cursor: pointer;
					margin: 0 0.04rem;
				}
			}
			.download_keplr_look_around{
				margin-top: 0.16rem;
				color: var(--hoverColor);
				font-size: var(--fontSize14);
				line-height: 0.16rem;
				cursor: pointer;
				.download_look_around_icon{
					margin-left: 0.04rem;
					display: inline-block;
					width: 0.14rem;
					height: 0.14rem;
				}
			}
		}
	}
</style>