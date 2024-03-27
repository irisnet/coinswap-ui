<template>
	<div class="logo_content">
		<div class="logo_content_wrap">
<!--			<img src="../../assets/img/LOGO_Beta.png" alt="">-->
			<img :src="logSrc" alt="">
		</div>
	</div>
</template>

<script>
	export default {
		name: "homeLogoContent",
		computed:{
			logSrc(){
				const location = window.location
				if(location?.href && location.href.includes('testnet')){
					return require('../../assets/img/coinswap_logo.png')
				}
				return require('../../assets/img/coinswap_logo_big.png')
			}
		}
	}
</script>

<style scoped lang="scss">
	.logo_content{
		margin-top: 1.03rem;
		margin-bottom: 0.6rem;
		.logo_content_wrap{
			width: 3.05rem;
			height: 1.12rem;
			margin: 0 auto;
			img{
				width: 100%;
			}
		}
	}
</style>
