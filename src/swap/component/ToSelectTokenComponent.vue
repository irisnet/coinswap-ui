<template>
	<div class="select_content" @click.stop="selectToken()">
		<div class="token_img_content">
			<img :src="setImageSrc" alt="">
		</div>
		<span class="token_name">{{$store.state.selectedToToken.symbol ? $store.state.selectedToToken.symbol.toUpperCase() : ''}}</span>
		<div class="select_icon">
			<iconfont-component icon-name="icon-zhankai"></iconfont-component>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	
	export default {
		name: "ToSelectTokenComponent",
		components: {IconfontComponent},
		data() {
			return {
				tokenName :'',
				defaultImageSrc: require('../../assets/img/logo/LOGO_Dafult.png')
			}
		},
		computed:{
			setImageSrc(){
                if (this.$store.state.selectedToToken) {
                    return this.matchLogo(this.$store.state.selectedToToken.denom);
				}
			}
		},
		methods:{
            matchLogo(item) {
                const configs = JSON.parse(localStorage.getItem('config')).length ? JSON.parse(localStorage.getItem('config')) : [];
                let image = '';
                configs?.forEach(config => {
                    if(config?.denom == item) {
                        image = config.icon;
                    }
                })
                return image ? image : this.defaultImageSrc;
            },
			selectToken(){
				this.$store.commit('isToSelect',true)
				this.$store.commit('isFromSelect',false)
				this.$store.commit('isSelectToken',true)
			}
		}
	}
</script>

<style scoped lang="scss">
	.select_content{
		display: flex;
		background: var(--bgWhiteColor);
		align-items: center;
		border-radius: var(--borderRadius6);
		cursor: pointer;
		margin-left: 0.08rem;
		.token_img_content{
			margin-left: 0.08rem;
			width: 0.24rem;
			height: 0.24rem;
			display: flex;
			align-items: center;
			justify-content: center;
			img{
				width: 100%;
			}
		}
		.token_name{
			margin-left: 0.08rem;
			color: var(--fontColorBlack);
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
		}
		.select_icon{
			width: 0.48rem;
			height: 0.2rem;
			display: flex;
			align-items: center;
		}
	}
</style>
