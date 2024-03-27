<template>
	<div class="page_found_container">
		<div class="page_found_content_wrap">
			<div class="page_found_img_content">
				<img src="../assets/img/404.png" alt="">
			</div>
			<p class="page_found_content">{{$t('errorPage.404.content')}}</p>
			<p class="page_found_tip">{{$t('errorPage.404.tip')}}</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "pageFound"
}
</script>

<style scoped lang="scss">
.page_found_container{
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	.page_found_content_wrap{
		.page_found_img_content{
			max-width: 5.88rem;
			@media (max-width: 375px) {
				margin: 0 0.16rem;
				box-sizing: border-box;
			}
			img{
				width: 100%;
				height: 100%;
			}
		}
		.page_found_content{
			text-align: center;
			font-size: var(--fontSize48);
			color: var(--btnColor);
			line-height: 0.61rem;
			@media (max-width: 480px) {
				font-size: var(--fontSize32);
				line-height: 0.32rem;
			}
			@media (max-width: 375px) {
				font-size: var(--fontSize24);
				line-height: 0.32rem;
			}
		}
		.page_found_tip{
			font-size: var(--fontSize16);
			color: var(--fontColorBlack3);
			line-height: 0.2rem;
			text-align: center;
			margin: 0.3rem 0.16rem 0 0.16rem;
			@media (max-width: 375px) {
				margin-top: 0.24rem;
				font-size: var(--fontSize14);
			}
		}
	}
}
</style>