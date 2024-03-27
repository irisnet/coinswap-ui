<template>
	<ul class="external_link_container">
		<li class="external_link_item" v-for="(item,index) in routerList" :key="index">
      <a v-if="item.isExternalLink" :href="item.href" target="_blank" rel="noreferrer noopener">{{item.name}}</a>
			<a v-else  :href="`${cfg}${item.href}`" target="_blank" rel="noreferrer noopener">{{item.name}}</a>

			<div class="icon_component">
				<iconfont-component :icon-name="item.iconName"></iconfont-component>
			</div>
		</li>
	</ul>
</template>

<script>
import IconfontComponent from "../../components/IconfontComponent";
const { VUE_APP_INFO_URL } = process.env
export default {
	name: "ExternalLinksComponent",
	components: {IconfontComponent},
	data(){
		return {
			cfg:null
		}
	},
	mounted(){
		this.cfg = VUE_APP_INFO_URL
	},
	computed:{
		routerList(){
			return this['_i18n'].messages[this['_i18n'].locale].navigation.externalLink
		}
	}
}
</script>

<style scoped lang="scss">
	.external_link_container{
		display: flex;
		margin-left: 0.16rem;
        @media (max-width: 950px) {
            margin-left: 0.08rem;
        }
		@media (max-width: 820px) {
			flex-direction: column;
			padding-left: 0.11rem;
		}
		.external_link_item{
			display: flex;
			align-items: center;
			padding-bottom: 0.02rem;
			@media (max-width: 820px) {
				padding: 0.12rem 0;
			}
			a{
				color:var(--fontColorBlack65);
				font-size: var(--fontSize16);
			}
			.icon_component{
                margin-right: 0.24rem;
				width: 0.16rem;
				height: 0.16rem;
                @media (max-width: 950px) {
                    margin-right: 0.08rem;
                }
			}
		}
	}
</style>