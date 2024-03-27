<template>
	<div class="swap_path_component" v-show="isShowPath">
        <p class="swap_path_router_tip">
			<span class="swap_path_router_label">{{$t('txTooltip.swapRoute')}}
				<span class="tool_tip_content">
					<iconfont-component icon-name="icon-bangzhu"></iconfont-component>
					<div class="route_tooltip_content">
						{{$t('txTooltip.swapRouteTip')}}
					</div>
				</span>
			</span>
		</p>
        <div class="swap_path_content">
            <div class="swap_path_left_content">
                <span class="swap_path_form_icon">
                    <img :src="$store.state.selectedFromToken ? setImageSrc($store.state.selectedFromToken) : ''">
                </span>
                <span class="token_label">{{$store.state.selectedFromToken ? $store.state.selectedFromToken.symbol.toUpperCase() : ''}}</span>
            </div>
            <div class="swap_path_center_content">
                <div class="swap_path_icon">
                    <iconfont-component icon-name="icon-lujing"></iconfont-component>
                </div>
                <div class="iris_token_content">
                    <span class="iris_token_logo">
                        <img :src="require('../../assets/img/logo/iris_logo.png')" alt="">
                    </span>
                    <span class="iris_token_label">{{showBaseToken}}</span>
                </div>
                <div class="swap_path_icon">
                    <iconfont-component icon-name="icon-lujing"></iconfont-component>
                </div>
            </div>
            <div class="swap_path_right_content">
                <span class="swap_path_to_icon">
                    <img :src="$store.state.selectedToToken ? setImageSrc($store.state.selectedToToken) :''" alt="">
                </span>
                <span class="token_label">{{$store.state.selectedToToken ? $store.state.selectedToToken.symbol.toUpperCase() : ''}}</span>
            </div>
        </div>
	</div>
</template>

<script>
	import IconfontComponent from "../../components/IconfontComponent";
	export default {
		name: "SwapPathComponent",
		components: {IconfontComponent},
		data() {
			 return {
				 defaultImageSrc: require('../../assets/img/logo/LOGO_Dafult.png')
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
            }
		},
		computed:{
			setImageSrc(){
                return function(selectToken) {
                    if(selectToken) {
                        return this.matchLogo(selectToken.denom);
                    }
                }
			},
			isShowPath(){
				if(this.$store.state.selectedFromToken && !this.$store.state.selectedFromToken.isBaseToken  && this.$store.state.selectedToToken && !this.$store.state.selectedToToken.isBaseToken ){
					return true
				}else {
					return false
				}
			},
			showBaseToken(){
				let baseToken = ""
				if(this.$store.state.tokenList){
					this.$store.state.tokenList.forEach( item => {
						if(item.isBaseToken){
							baseToken =  item.symbol.toUpperCase()
						}
					})
				}
				return baseToken
			}
		}
	}
</script>

<style scoped lang="scss">
	.swap_path_component{
		margin-top: 0.08rem;
        .swap_path_router_tip {
			.swap_path_router_label {
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
				
				.tool_tip_content {
					margin-left: 0.08rem;
					display: inline-block;
					width: 0.16rem;
					height: 0.16rem;
					position: relative;
					cursor: pointer;
					
					&:hover {
						.route_tooltip_content {
							display: block;
						}
					}
					
					.route_tooltip_content {
						display: none;
						position: absolute;
						left: 0.3rem;
						bottom: -0.12rem;
						background: var(--bgWhiteColor);
						width: 2.32rem;
						border-radius: var(--borderRadius8);
						box-sizing: border-box;
						padding: var(--boxPadding16);
						font-size: var(--fontSize16);
						line-height: var(--lineHeight20);
						color: var(--fontColorBlack65);
						border: 0.01rem solid var(--tooltipBoxBorderColor);
						
						&:after {
							content: url("../../assets/img/tips_icon.png");
							position: absolute;
							left: -0.08rem;
							bottom: 0.05rem;
							color: rgba(226, 233, 255, 1);
							z-index: 10;
						}
						@media (max-width: 460px) {
							left: -0.3rem;
							bottom: 0.28rem;
							&:after {
								left: 0.32rem;
								bottom: -0.15rem;
								transform: rotate(-90deg);
							}
						}
					}
				}
			}
		}
        .swap_path_content {
            display: flex;
            box-sizing: border-box;
            margin-top: 0.08rem;
        padding: 0.12rem 0.24rem;
		background: var(--btnColor008);
		border-radius: var(--borderRadius8);
		.swap_path_left_content{
			display: flex;
			align-items: center;
			.swap_path_form_icon{
				width: 0.24rem;
				height: 0.24rem;
				@media (max-width: 375px) {
					display: none;
				}
				img{
					width: 100%;
				}
			}
			.token_label{
				margin-left: 0.08rem;
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}
		}
		.swap_path_center_content{
			display: flex;
			align-items: center;
			flex: 1;
			justify-content: space-between;
			margin: 0 0.27rem;
			@media (max-width: 460px) {
				margin: 0 0.2rem;
				align-items: center;
			}
			.swap_path_icon{
				width: 0.13rem;
				height: 0.13rem;
				margin-bottom: 0.13rem;
			}
			.iris_token_content{
				display: flex;
				align-items: center;
				.iris_token_logo{
					display: inline-block;
					width: 0.24rem;
					height: 0.24rem;
					@media (max-width: 375px) {
						display: none;
					}
					img{
						width: 100%;
					}
				}
				.iris_token_label{
					margin-left: 0.08rem;
					font-size: var(--fontSize14);
					line-height: var(--lineHeight);
					color: var(--fontColorBlack65);
					@media (max-width: 375px) {
						margin-left: 0;
					}
				}
			}
		}
		.swap_path_right_content{
			display: flex;
			align-items: center;
			.swap_path_to_icon{
				width: 0.24rem;
				height: 0.24rem;
				@media (max-width: 375px) {
					display: none;
				}
				img{
					width: 100%;
				}
			}
			.token_label{
				margin-left: 0.08rem;
				font-size: var(--fontSize14);
				color: var(--fontColorBlack65);
				line-height: var(--lineHeight20);
			}
		}
        }
	}
</style>
