<template>
	<div class="max_content"
	     v-if="$store.state.isConnected"
	     @click.stop="AllIn()">
		<span class="max_label">Max</span>
	</div>
</template>

<script>
	export default {
		name: "MaxButtonComponent",
		data() {
			return {
			
			}
		},
		methods:{
			AllIn(){
				this.$emit('selectAll')
			}
		}
	}
</script>

<style scoped lang="scss">
	.max_content{
		width: 0.48rem;
		background: var(--btnColor);
		border-radius: var(--borderRadius6);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		margin: 0 0 0 0.08rem;
		height: 0.32rem;
		.max_label{
			font-size: var(--fontSize16);
			color: var(--fontColor1);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
			padding-left: 0.2rem;
			padding-right: 0.2rem;
		}
	}
</style>
