<template>
	<div class="mobile_side_menu_container"
	     @click.self="hideMask"
	     v-show="$store.state.isShowSideMenu !=='default'"
	     :class="$store.state.isShowSideMenu !== 'default' ? $store.state.isShowSideMenu ? 'show_side_menu' :'hide_side_menu' :''">
		<div class="mobile_side_menu_content_wrap" v-show="$store.state.isShowSideMenu !=='default'" :class="$store.state.isShowSideMenu !== 'default' ? $store.state.isShowSideMenu ? 'show_side_menu_content' :'hide_side_menu_content':''">
			<div class="mobile_side_menu_content_warp_container">
				<div class="mobile_side_content_wrap">
					<ul class="mobile_side_menu_content">
						<li class="mobile_side_menu_item"
							v-for="(item,index) in routerList" :key="index"
							@click.stop="closeSideMenu">
							<router-link :to="item.path" :class="item.path == '/pool' && $store.state.isNavPool ? 'router-link-exact-active' : ''" class="router_item_link">{{item.name}}</router-link>
						</li>
					</ul>
				</div>
				<link-icon-component></link-icon-component>
			</div>

		</div>
	</div>
</template>

<script>
	import LinkIconComponent from "./LinkIconComponent";
	export default {
		name: "MobileSideMenuComponent",
		components: { LinkIconComponent},
		methods:{
			hideMask(){
				this.$store.commit('isShowSideMenu',false)
			},
			handler(e){
				if(e?.target?.screen?.width > 768){
					this.$store.commit('isShowSideMenu','default')
				}
			},
			closeSideMenu(){
				this.$store.commit('isShowSideMenu',false)
			}
		},
		computed:{
			routerList(){
				return this['_i18n'].messages[this['_i18n'].locale].navigation.leftList
			}
		},
		mounted(){
			window.addEventListener('resize',this.handler,false)
		},
	}
</script>

<style scoped lang="scss">
	.show_side_menu{
		animation: showMaskBg 0.3s ease-out;
		animation-fill-mode: forwards;
	}
	.hide_side_menu{
		animation: hideMaskBg 0.3s ease-out;
		animation-fill-mode: forwards;
	}
	.mobile_side_menu_container{
		position: fixed;
		width: 100%;
		height: calc(100% - 0.6rem);
		margin-top: 0.6rem;
		@media (max-width: 820px) {
			display: block;
			z-index: 1;
		}
		.mobile_side_menu_content_wrap{
			width: 2rem;
			height: 100%;
			background: var(--cardBgColor);
			.mobile_side_menu_content_warp_container{
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				height: 100%;
				.mobile_side_content_wrap{
					.mobile_side_menu_content{
						padding-top: 0.16rem;
						.mobile_side_menu_item{
							display: flex;
							align-items: center;
							a{
								width: 100%;
								padding: 0.13rem 0 0.13rem 0.24rem;
								color: var(--fontColorBlack65);
								font-size: var(--fontSize16);
								line-height: 0.22rem;
								border-left: 0.04rem solid transparent;
							}
							.router-link-exact-active{
								border-left: 0.04rem solid var(--btnColor);
								color: var(--fontColorBlack);
								background: var(--btnHoverColor);
								/*text-shadow: 0.01rem 0.01rem 0.01rem rgba(0,0,0,0.25);*/
							}
						}
					}
					.mobile_external_link{
						margin-top: 0.13rem;
						padding-left: 0.1rem;
						@media (max-width: 820px) {
							margin-top: 0;
						}
					}
				}
			}

		}
		.show_side_menu_content{
			animation: showSideMask 0.3s ease-out;
			animation-fill-mode: forwards;
		}
		.hide_side_menu_content{
			animation: hideSideMask 0.3s ease-out;
			animation-fill-mode: forwards;
		}
	}
	@keyframes showMaskBg {
		from{
			background: var(--mobileSideMaskBgColor5);
			z-index: -1;

		}
		to{
			background: var(--mobileSideMaskBgColor30);
			z-index: 0;

		}
	}
	@keyframes hideMaskBg {
		from{
			background: var(--mobileSideMaskBgColor30);
			z-index: 0;
		}
		to{
			background: var(--mobileSideMaskBgColor5);
			z-index: -1;
		}
	}
	@keyframes showSideMask {
		from{
			transform: translateX(-2rem);
		}
		to{
			transform: translateX(0);
		}
	}
	@keyframes hideSideMask {
		from{
			transform: translateX(0);
		}
		to{
			transform: translateX(-2rem);
		}
	}
</style>
