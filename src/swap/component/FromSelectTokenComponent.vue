<template>
	<div class="select_content" @click.stop="selectToken()">
		<div class="token_img_content">
			<img :src="$store.state.selectedFromToken && JSON.stringify($store.state.selectedFromToken) !== '{}' ? setImageSrc : storageFromSetImageSrc" alt="">
		</div>
		<span class="token_name">{{$store.state.selectedFromToken && $store.state.selectedFromToken.symbol ? $store.state.selectedFromToken.symbol.toUpperCase() :fromToken ? fromToken.symbol.toUpperCase() : ''}}</span>
		<div class="select_icon">
			<iconfont-component icon-name="icon-zhankai"></iconfont-component>
		</div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	
	export default {
		name: "FormSelectTokenComponent",
		components: {IconfontComponent},
		data () {
			return {
				imgSrc: "",
				defaultImageSrc: require('../../assets/img/logo/LOGO_Dafult.png'),
				fromToken: null
			}
		},
		computed: {
			setImageSrc () {
				if (this.$store.state.selectedFromToken) {
                    return this.matchLogo(this.$store.state.selectedFromToken.denom)
				}
			},
			storageFromSetImageSrc () {
				if (this.fromToken) {
                    return this.matchLogo(this.fromToken.denom);
				}
			}
		},
		
		methods: {
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
			selectToken () {
				this.$store.commit('isToSelect', false)
				this.$store.commit('isFromSelect', true)
				this.$store.commit('isSelectToken', true)
			},
			getBaseToken () {
				if (sessionStorage.getItem('baseToken')) {
					this.fromToken = JSON.parse(sessionStorage.getItem('baseToken'))
					if(JSON.stringify(this.$store.state.selectedFromToken)  === '{}' ){
						this.$store.commit('selectedFromToken',this.fromToken)
					}
				} else {
					this.fromToken = null
				}
			}
		},
		mounted () {
			this.getBaseToken()
			let formTokenTime = setInterval(() => {
				if (this.fromToken) {
					clearInterval(formTokenTime)
				} else {
					this.getBaseToken()
				}
			})
		}
	}
</script>

<style scoped lang="scss">
	.select_content {
		display: flex;
		background: var(--bgWhiteColor);
		align-items: center;
		border-radius: var(--borderRadius6);
		cursor: pointer;
		margin-left: 0.08rem;
		height: 0.32rem;
		.token_img_content {
			margin-left: 0.08rem;
			width: 0.24rem;
			height: 0.24rem;
			display: flex;
			align-items: center;
			justify-content: center;
			
			img {
				width: 100%;
			}
		}
		
		.token_name {
			margin-left: 0.08rem;
			color: var(--fontColorBlack);
			font-size: var(--fontSize16);
			line-height: var(--lineHeight20);
			font-weight: var(--fontWt400);
		}
		
		.select_icon {
			width: 0.48rem;
			height: 0.2rem;
			display: flex;
			align-items: center;
		}
	}
</style>
