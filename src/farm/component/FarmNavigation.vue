<template>
	<div class="farm_header_container">
		<div class="farm_header_content">
			<h5 class="farm_title">{{$t('farm.navigation.title')}}</h5>
		</div>
	</div>
</template>

<script>
	export default {
		name: "FarmNavigation"
	}
</script>

<style scoped lang="scss">
	.farm_header_container{
		margin-top: 0.6rem;
		.farm_header_content{
			.farm_title{
				font-size: var(--fontSize48);
				color: var(--hoverColor);
				line-height: var(--lineHeight40);
				font-weight: bold;
				text-align: center;
			}
			.farm_subtitle{
				margin-bottom: 0.40rem;
				margin-top: 0.12rem;
				text-align: center;
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				@media (max-width: 500px) {
					margin-bottom: 0.24rem;
				}
			}
		}
	}

</style>
