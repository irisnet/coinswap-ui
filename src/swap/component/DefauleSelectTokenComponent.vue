<template>
	<div class="default_select_content" @click.stop="selectToken">
		<span class="default_select_label">{{$t('defaultSelectedToken')}}</span>
		<span class="default_select_icon iconfont icon-zhankai"></span>
	</div>
</template>

<script>
	export default {
		name: "DefauleSelectTokenComponent",
		props:{
			isFrom:{
				type:Boolean
			},
			isTo: {
				type: Boolean
			}
		},
		methods:{
			selectToken(){
				
				if(this.isTo){
					this.$store.commit('isToSelect',true)
					this.$store.commit('isFromSelect',false)
				}
				
				if(this.isFrom){
					this.$store.commit('isToSelect',false)
					this.$store.commit('isFromSelect',true)
				}
				this.$store.commit('isSelectToken',true)
			}
		}
	}
</script>

<style scoped lang="scss">
	.default_select_content{
		text-align: center;
		border-radius: var(--borderRadius6);
		background: var(--btnColor);
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 0 0.08rem;
		cursor: pointer;
		height: 0.32rem;
		.default_select_label{
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
			color: var(--fontColorWhite);
		}
		.default_select_icon{
			margin-left: 0.08rem;
			font-size: var(--fontSize16);
			color: var(--fontColorWhite);
		}
	}
</style>
