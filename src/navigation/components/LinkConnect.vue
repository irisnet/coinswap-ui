<template>
	<div class="link_container">
		<div class="link_content">
			<div class="link_iconfont iconfont" @click.stop="showLinkContentToggle">
				<iconfont-component  v-show="!$store.state.isShowLinkContent" icon-name="icon-qita"></iconfont-component>
				<iconfont-component  v-show="$store.state.isShowLinkContent" icon-name="icon-xuanzhong"></iconfont-component>
			</div>
			<ul class="link_list_content" v-show="$store.state.isShowLinkContent">
				<li class="link_item_content"
				    v-for="(item,index) in linkList"
				    :key="index">
					<a :href="item.href"
					   rel="noreferrer noopener"
					   target="_blank" class="link_item">{{item.label}}</a>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	export default {
		name: "LinkConnect",
		components: {IconfontComponent},
		data(){
			return {
				isShowLinkContent:false
			}
		},
		methods:{
			showLinkContentToggle(){
				if(this.$store.state.isShowLinkContent){
					this.$store.commit('isShowLinkContent',false)
					return
				}
				this.$store.commit('isShowLinkContent',true)
			}
		},
		computed:{
			linkList() {
				return this['_i18n'].messages[this['_i18n'].locale].navigation.linkList
			}
		}
	}
</script>

<style scoped lang="scss">
	.link_container{
		margin-left: 0.16rem;
		.link_content{
			position: relative;
			.link_iconfont{
				width: 0.36rem;
				height: 0.36rem;
				cursor: pointer;

			}
			.link_list_content{
				display: flex;
				flex-direction: column;
				position: absolute;
				top: 0.65rem;
				right: 0.1rem;
				background: var(--bgWhiteColor);
				box-sizing: border-box;
				border-radius: var(--borderRadius4);
				overflow: hidden;
				padding-top: 0.1rem;
				padding-bottom: 0.1rem;
				z-index: 1;
				.link_item_content{
					width: 1.36rem;
					font-size: var(--fontSize16);
					&:hover{
						background: var(--btnHoverColor);
					}
					.link_item{
						display: inline-block;
						padding: 0.08rem 0.16rem;
						width: 100%;
						height: 100%;
						color: var(--fontColorBlack65);
						font-size: var(--fontSize16);
						&:hover{
							color: var(--btnColor);
						}
					}
				}
			}
		}
	}
</style>
