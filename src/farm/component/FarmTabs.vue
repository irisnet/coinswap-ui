<template>
	<el-tabs v-model="activeName" @tab-click="handleClick">
		<el-tab-pane label="Earn IRIS" name="earnIris"></el-tab-pane>
		<el-tab-pane label="Finished" name="finished"></el-tab-pane>
	</el-tabs>
</template>

<script>
export default {
	name: "FarmTabs",
	data () {
		return {
			activeName:'earnIris'
		}
	},
	methods:{
		handleClick(tab){
			this.$emit('clickTabs',tab)
		}
	}
}
</script>

<style lang="scss">
.el-tabs{
	margin: 0 0.16rem;
	@media (max-width: 1200px) {
		margin: 0 0.48rem;
	}
	/*@media (max-width: 810px) {
		margin: 0 0.16rem;
	}*/
	@media (max-width: 500px) {
		margin: 0 0.16rem;
	}
}
.el-tabs__item{
	color: var(--fontColorBlack65);
	font-size: var(--fontSize20);
	&:hover{
		color: var(--hoverColor);
	}
}
.el-tabs__item.is-active{
	color: var(--hoverColor);
}
.el-tabs__active-bar{
	background-color: var(--hoverColor);
}
</style>