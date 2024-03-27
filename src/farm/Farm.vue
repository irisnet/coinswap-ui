<template>
	<div class="farm_page_container">
		<div class="farm_page_content_wrap">
			<farm-navigation></farm-navigation>
<!--			<farm-tabs @clickTabs="getTabs"></farm-tabs>-->
			<farm-item-card :client="client" :option="currentTab"></farm-item-card>
			<div class="error_logo_content" v-show="$store.state.isShowErrorImg">
				<img src="../assets/img/Loading_Error.png" alt="">
				<p class="error_text">
				
				</p>
			</div>
		</div>
	</div>
</template>

<script>
	import FarmNavigation from "./component/FarmNavigation";
	import FarmItemCard from "./component/FarmItemCard";
	import FarmTabs from "./component/FarmTabs";
    import {getClient, singleConfig} from '../util/sdkHelper';
	export default {
		name: "Farm",
		components: {FarmTabs, FarmItemCard, FarmNavigation},
		data () {
			return {
				currentTab:'earnIris',
                client: null
			}
		},
		methods:{
			getTabs(e){
				if(e.name){
					this.currentTab = e.name
				}
			}
		},
        async mounted() {
            this.client = await getClient(singleConfig);
        },
		beforeDestroy(){
			this.$store.commit('toFarmDenom','')
		}
	}
</script>

<style scoped lang="scss">
.farm_page_container{
	width: 100%;
	.farm_page_content_wrap{
		max-width: 12rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		.error_logo_content{
			margin: 0 auto;
			display: flex;
			align-items: center;
			justify-content: center;
			img{
				width: 50%;
			}
		}
	}
}
</style>
