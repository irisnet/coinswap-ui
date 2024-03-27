<template>
	<div class="swap_button_content">
		<router-link class="swap_link_button" to="/coinswap">
			{{$t('swapButton')}}
		</router-link>
	</div>
</template>

<script>
	export default {
		name: "SwapButton"
	}
</script>

<style scoped lang="scss">
	.swap_button_content{
		.swap_link_button{
			color: var(--fontColorWhite);
			font-size: var(fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
			background: var(--btnColor);
			padding: 0.1rem 0.11rem;
			border-radius: var(--borderRadius8);
		}
	}
</style>
