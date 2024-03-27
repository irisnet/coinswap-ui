<template>
	<div class="notice_container_content">
		<div class="notice_content_wrap">
			<h3 class="notice_title">{{ $t('notice.title') }}</h3>
			<div class="notice_container_content_wrap">
				<p class="notice_content">{{ $t('notice.content1') }}</p>
				<p class="notice_content">{{ $t('notice.content2') }}</p>
				<p class="notice_content">{{ $t('notice.content3') }}</p>
<!--				<ul class="notice_list_content">
					<li class="notice_list_item" v-for="(item,index) in noticeListContent" :key="index">
						<span>{{ item.itemContent }}</span>
					</li>
				</ul>-->
<!--				<p class="notice_tip_content">{{ $t('notice.tip') }}</p>-->
<!--				<p class="notice_second_tip_content">{{ $t('notice.secondTip') }}</p>-->
			</div>
			<div class="notice_check_box_content">
				<el-checkbox v-model="isChecked"></el-checkbox>
				<span class="check_box_content">{{ $t('notice.checkBoxContent') }}</span>
			</div>
			<div class="button_content">
				<el-button @click.stop="closeWindow()">{{ $t('notice.declineBtnLabel') }}</el-button>
				<el-button :disabled="!isChecked" type="primary" @click.stop="agree()">
					{{ $t('notice.agreeBtnLabel') }}
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import {setNoticeStatusByAddress,getNoticeStatusByAddress} from "../server/api";
export default {
	name: "NoticeComponent",
	data() {
		return {
			isChecked: false,
			address:'',
			opsConfig: {
				scrollPanel: {
					scrollingY: true,
					maxHeight: 300,
				},
				rail: {
					opacity: '1',
					background: 'rgba(112, 147, 255, 0.2)',
					// border: '1px solid #cecece',
					size: '4px'
				},
				bar: {
					keepShow: true,
					size: '4px',
					minSize: 0.1,
					background: 'rgba(112, 147, 255, 0.2)',
				},
				vuescroll: {
					wheelScrollDuration: 0,
					wheelDirectionReverse: false,
					locking: true,
					checkShifKey: true
				}
			}
		}
	},
	watch:{
		"$store.state.address":{
			handler(value){
				if(value){
					this.address = value
					this.isChecked = false
					getNoticeStatusByAddress(value).then(noticeStatus => {
						if(!noticeStatus?.claimed){
							this.$store.commit('isReadmeNotice',true)
							localStorage.setItem('isReadmeNotice',true)
							return
						}else {
							this.$store.commit('isReadmeNotice',false)
							localStorage.setItem('isReadmeNotice',false)
						}
					})
				}else {
					this.$store.commit('isReadmeNotice',false)
				}
			},
			deep:true
		}
	},
	mounted(){
		let walletInfo = JSON.parse(localStorage.getItem('walletconnect')) || ''
		if(walletInfo){
			this.address = walletInfo.accounts[0]
		}
		this.getNoticeStatus()
	},
	methods: {
		async getNoticeStatus(){
			if(this.address){
				await getNoticeStatusByAddress(this.address).then(noticeStatus => {
					if(!noticeStatus?.claimed){
						this.$store.commit('isReadmeNotice',true)
						localStorage.setItem('isReadmeNotice',true)
						return
					}else {
						this.$store.commit('isReadmeNotice',false)
						localStorage.setItem('isReadmeNotice',false)
					}
				})
			}
		},
		async setNoticeStatus(){
			let noticeStatus = await setNoticeStatusByAddress({address:this.address})
			return noticeStatus
		},
		closeWindow() {
			var userAgent = navigator.userAgent;
			if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
				window.open('', '_self').close()
				window.location.href = "about:blank"
			} else {
				window.opener = null;
				window.open("about:blank", "_self");
				window.close();
			}
		},
		agree() {
			this.setNoticeStatus()
			if (this.isChecked) {
				localStorage.setItem('isReadmeNotice', false)
				this.$store.commit('isReadmeNotice', false)
			}
		},
	},
	computed: {
		noticeListContent() {
			return this['_i18n'].messages[this['_i18n'].locale].notice.list
		}
	},
	destroyed (){
		this.isChecked = false
	}
}
</script>

<style scoped lang="scss">
.notice_container_content {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: var(--markBgColor);
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
	
	.notice_content_wrap {
		max-width: 4.8rem;
		box-sizing: border-box;
		padding: 0.24rem;
		background: var(--bgWhiteColor);
		border-radius: var(--borderRadius8);
		margin: 0 0.48rem;
		@media (max-width: 560px) {
			margin: 0 0.16rem;
		}
		
		.notice_title {
			font-size: var(--fontSize20);
			color: var(--fontColorBlack);
			line-height: var(--lineHeight32);
			font-weight: var(--fontWt600);
			margin-bottom: 0.18rem;
		}
		.notice_container_content_wrap{
			max-height: 3rem;
			overflow-y: auto;
		}
		.notice_content {
			margin-top: 0.18rem;
			font-size: var(--fontSize14);
			color: var(--fontColorBlack);
			line-height: var(--lineHeight20);
			margin-right: 0.06rem;
			
		}
		.notice_content:first-child{
			margin-top: 0;
		}
		
		.notice_list_content {
			margin-top: 0.16rem;
			margin-right: 0.06rem;
			
			.notice_list_item {
				font-size: var(--fontSize14);
				line-height: var(--lineHeight20);
				color: var(--fontColorBlack65);
				padding-left: 0.18rem;
				position: relative;
				
				&::before {
					content: "•";
					color: var(--btnColor);
					font-size: var(--fontSize14);
					margin-right: 0.09rem;
					position: absolute;
					left: 0;
					top: 0;
				}
			}
		}
		
		.notice_tip_content {
			margin-top: 0.16rem;
			margin-right: 0.06rem;
			font-size: var(--fontSize14);
			color: var(--fontColorBlack);
			line-height: var(--lineHeight20);
		}
		
		.notice_second_tip_content {
			margin-right: 0.06rem;
			font-size: var(--fontSize14);
			color: var(--fontColorBlack);
			line-height: var(--lineHeight20);
		}
		
		.notice_check_box_content {
			margin-top: 0.16rem;
			border-radius: var(--borderRadius8);
			border: 0.01rem solid var(--poolBorderColor);
			box-sizing: border-box;
			padding: 0.16rem;
			
			:deep(.el-checkbox) {
				.is-checked {
					.el-checkbox__inner {
						background-color: var(--removeLiquidityPriceColor);
						border-color: var(--removeLiquidityPriceColor);
					}
				}
			}
			
			.check_box_content {
				margin-left: 0.08rem;
				color: var(--fontColorBlack65);
				font-size: var(--fontSize12);
				line-height: var(--lineHeight20);
			}
		}
		
		.button_content {
			margin-top: 0.16rem;
			display: flex;
			
			.el-button--default {
				flex: 1;
				border: 0.01rem solid var(--btnForbidColor);
				color: var(--btnColor);
				font-size: var(--fontSize16);
				line-height: var(--lineHeight20);
				border-radius: var(--borderRadius8);
				
				&:hover {
					background-color: transparent;
				}
			}
			
			.el-button--primary {
				flex: 1;
				border-radius: var(--borderRadius8);
				color: var(--bgWhiteColor);
				background-color: var(--btnColor);
				border-color: transparent;
			}
			
			.is-disabled {
				background-color: var(--poolBorderColor);
			}
		}
	}
}
</style>