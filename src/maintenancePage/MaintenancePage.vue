<template>
	<div class="maintenance_container">
		<div class="maintenance_wrap">
			<div class="maintenance_img_content">
				<img src="../assets/img/Default-Maintenance.png" alt="">
			</div>
			<p class="maintenance_tip_title">WE ARE UNDER MAINTENANCE</p>
			<div class="link"></div>
			<div class="link_content">
				<link-icon-component></link-icon-component>
			</div>
		</div>
		<footer></footer>
	</div>
</template>

<script>
	import LinkIconComponent from "../navigation/components/LinkIconComponent";
	import Footer from "../footer/Footer";
	export default {
		name: "MaintenancePage",
		components: {Footer, LinkIconComponent}
	}
</script>

<style scoped lang="scss">
	.maintenance_container{
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		.maintenance_wrap{
			max-width: 12rem;
			margin: 0 auto;
			@media (max-width: 820px) {
				margin: 0 0.2rem;
			}
			.maintenance_img_content{
				margin: 0 auto;
				max-width: 4.3rem;
				display: flex;
				justify-content: center;
				img{
					width: 100%;
					height: 100%;
				}
			}
			.maintenance_tip_title{
				text-align: center;
				font-size: 0.48rem;
				color: var(--hoverColor);
				line-height: 0.61rem;
				margin-bottom: 0.36rem;
				@media (max-width: 410px) {
					font-size: 0.23rem;
					line-height: 0.32rem;
				}
			}
			.maintenance_description{
				font-size: 0.16rem;
				background: #fff;
				max-width: 7.38rem;
				box-sizing: border-box;
				border-radius: 0.12rem;
				padding: 0.24rem;
				text-align: left;
				line-height: 0.24rem;
				p:nth-child(1){
					font-size: 0.16rem;
					color: rgba(0,0,0,1);
					font-weight: 600;
				}
				p:nth-child(2){
					margin-top: 0.24rem;
					font-size: 0.16rem;
					color: rgba(0,0,0,1);
				}
				p:nth-child(4){
					margin-top: 0.24rem;
					font-size: 0.16rem;
					color: rgba(0,0,0,1);
				}
				p:nth-child(5){
					margin-top: 0.24rem;
					font-size: 0.16rem;
					color: rgba(0,0,0,1);
				}
			}
			.maintenance_text{
				font-size: 0.16rem;
				line-height: 0.2rem;
				color:var(--fontColorBlack3);
				text-align: center;
			}
			.link{
				margin: 0.32rem auto 0.27rem auto;
				max-width: 4.36rem;
				height: 0.01rem;
				background: var(--poolBorderColor);
			}
			.link_content{
				max-width: 3rem;
				margin: 0 auto;
			}
		}
	}
</style>
