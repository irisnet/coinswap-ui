<template>
	<div class="router_container">
		<ul class="router_list_content">
			<li class="router_list_item"
			    v-for="(item,index) in routerList"
			    :key="index">
				<router-link :to="item.path" :class="item.path == '/pool' && $store.state.isNavPool ? 'router-link-exact-active' : ''" class="router_item_link">{{item.name}}</router-link>
			</li>
		</ul>
	</div>
</template>

<script>
	export default {
		name: "RouterContent",
		computed:{
			routerList(){
				return this['_i18n'].messages[this['_i18n'].locale].navigation.leftList
			}
		}
	}
</script>

<style scoped lang="scss">
.router_container{
	height: 0.6rem;
	line-height: 0.6rem;
	.router_list_content{
		display: flex;
		height: 100%;
		.router_list_item{
			height: 100%;
			.router_item_link{
				display: inline-block;
				height: 100%;
				color: var(--fontColorBlack65);
				text-align: center;
				margin: 0 var(--boxPadding16);
                @media (max-width: 950px) {
                    margin: 0 var(--boxPadding8);
                }
			}
			.router-link-exact-active{
				border-bottom: 0.02rem solid var(--btnColor);
				color: var(--fontColorBlack);
				/*text-shadow: 0.01rem 0.01rem 0.01rem rgba(0,0,0,0.25);*/
			}
		}
		
	}
}
</style>
