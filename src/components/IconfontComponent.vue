<template>
	<svg class="icon" aria-hidden="true">
		<use :xlink:href="`#${iconName}`"></use>
	</svg>
</template>

<script>
	export default {
		name: "IconfontComponent",
		props:{
			iconName:{
				type:String
			}
		}
	}
</script>

<style scoped lang="scss">
	.icon{
		width: 100%;
		height: 100%;
		vertical-align: -0.15em;
		fill: currentColor;
		overflow: hidden;
	}
</style>
