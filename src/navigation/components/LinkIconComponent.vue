<template>
	<ul class="mobile_side_footer_content">
		<li class="mobile_side_footer_item" v-for="(item,index) in linkList" :key="index">
			<a :href="item.href" target="_blank" rel="noreferrer noopener">
				<div class="img_content">
					<iconfont-component :icon-name="item.iconName"></iconfont-component>
				</div>
			</a>
		</li>
	</ul>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	export default {
		name: "LinkIconComponent",
		components: {IconfontComponent},
		computed:{
			linkList () {
				return this['_i18n'].messages[this['_i18n'].locale].footer
			},
		}
	}
</script>

<style scoped lang="scss">
	.mobile_side_footer_content{
		height: 0.51rem;
		border-top: 0.01rem solid rgba(240, 244, 255, 1);
		margin: 0 0.16rem;
		display: grid;
		grid-template-columns: repeat(4,1fr);
		grid-column-gap: 0.2rem;
		.mobile_side_footer_item{
			width: 100%;
			height: 0.51rem;
			a{
				width: 100%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				.img_content{
					width: 100%;
					max-width: 0.36rem;
					height: 100%;
				}
			}
		}
	}
</style>
