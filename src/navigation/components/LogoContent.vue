<template>
	<div class="logo_content">
		<div class="logo_img_content">
			<router-link :to="'/'">
<!--				<img src="../../assets/img/LOGO_Bata_32px.png" alt="">-->
				<img :src="logSrc">
			</router-link>
		</div>
	</div>
</template>

<script>
	export default {
		name: "LogoContent",
		computed:{
			logSrc(){
				const location = window.location
				if(location?.href && location.href.includes('testnet')){
					return require('../../assets/img/coinswap_logo_testnet.png')
				}
				return require('../../assets/img/coinswap_logo.png')
			}
		}
	}
</script>

<style scoped lang="scss">
.logo_content{
	width:1.14rem;
	display: flex;
	align-items: center;
	margin-right: 0.32rem;
    @media (max-width: 950px) {
	    margin-right: 0.2rem;
    }
	.logo_img_content{
		width:1.14rem;
		height: 0.38rem;
		display: flex;
		align-items: center;
		a{
			img{
				width: 100%;
			}
		}
		
	}
}
</style>
