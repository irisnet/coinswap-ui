<template>
	<div class="confirm_button_content">
		<span class="confirm_button_label">{{this.text}}</span>
	</div>
</template>

<script>
	export default {
		name: "ConfirmButton",
		props: {
			text: {
				type: String,
				default: "Confirm"
			}
		}
	}
</script>

<style scoped lang="scss">
	.confirm_button_content{
		border-radius: var(--borderRadius8);
		background: var(--btnColor);
		display: flex;
		justify-content: center;
		cursor: pointer;
		.confirm_button_label{
			font-size: var(--fontSize16);
			color: var(--fontColor1);
			padding: 0.1rem 0;
			display: inline-block;
			text-align: center;
			cursor: pointer;
			font-weight: var(--fontWt400);
		}
	}

</style>
