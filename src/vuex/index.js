import Vue from "vue"
import Vuex from 'vuex'
import {getClient, singleConfig} from "../util/sdkHelper";
import {KEPLR_WALLET} from "../constant";
Vue.use(Vuex)
let walletconnect = localStorage.getItem('walletconnect') ? JSON.parse(localStorage.getItem('walletconnect')) : null
let tokenList = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : []
let currentWallet = KEPLR_WALLET
const defaultToken = (tokenList || []).filter(item => item.isBaseToken);
const store = new Vuex.Store({
	state () {
		return {
			isShowOptimizePrompt: sessionStorage.getItem('isShowOptimizePrompt') ? JSON.parse(sessionStorage.getItem('isShowOptimizePrompt')) : true,
			address: walletconnect ? walletconnect.accounts[0] : '',
			addressCardIsClosed: false,
			isShowLinkContent: false,
			isConnected: walletconnect ? walletconnect.connected : false,
			isShowSetting: false,
			isSelectToken: false,
			isHaveLiquidity: false,
			fromBalance: '',
			toBalance: '',
			showDefaultSelectToken: false,
			tokenList: tokenList,
			defaultToken: null,
			selectedFromToken: defaultToken[0] || {},
			selectedToToken: null,
			isFromSelect: false,
			isToSelect: false,
			isShowSlippageTolerance: false,
			slippageToleranceValue: 0.5,
			isShowAddLiquidityConfirmTxBox: false,
			isClickMaxBtn: false,
			isShowConfirmTxBox: false,
			isShowSwapConfirmTxBox: false,
			isPriceUpdate: false,
			slefLiquidity: [],
			removeConfirmData: {},
			standardInputToken: {},
			isSelectAddLiquidity: false,
			selectedAddLiquidityToken: null,
			tokenIptValue: null,
			isStartSelectAddLiquidity: false,
			addLiquidityTxDetail: {},
			standardInputLock: false,
			tokenInputLock: false,
			isWaitingConfirmBox: false,
			conversion: null,
			swapObj: null,
			isChangeToken: false,
			isBuyOrder: false,
			isFromConversion: null,
			isToConversion: null,
			needSaveToIpt: '',
			autoSetToIpt: '',
			autoSetFromIpt: '',
			isNavPool: false,
			isWaitPending: false,
			isBroadcastTxError: false,
			addLiquidityTokenRatio: null,
			addLiquidityStandardRatio: null,
			isShowPriceAndCard: true,
			isShowStakeMask: {
				isShow: false,
				type: '',
				data:null
			},
			isShowHarvestWaitingMask:false,
			isShowErrorImg:false,
			isShowSideMenu: sessionStorage.getItem('isShowSideMenu') || 'default',
			walletConnectUri:'',
			isHideHeaderAndFooter: true,
			toFarmDenom: '',
			isReadmeNotice: localStorage.getItem('isReadmeNotice') ? JSON.parse(localStorage.getItem('isReadmeNotice')):true,
			walletListMask: false,
			currentWallet:currentWallet? currentWallet : '',
			downloadKeplr: false,
			isShowDepositWithdrawTipBox:false,
			depositWithdrawConfig: null,
			isSwapBtnDisable: false,
			liquidityNativeValue:'0',
            addressLpBalance: {},
            transactionResult: {},
            updateTimer: null,
            failedUpdateTimer: null
		}
	},
	mutations: {
		failedUpdateTimer (state, data) {
			state.failedUpdateTimer = data
		},
		updateTimer (state, data) {
			state.updateTimer = data
		},
		transactionResult (state, data) {
			state.transactionResult = data
		},
		isShowOptimizePrompt (state, data) {
			state.isShowOptimizePrompt = data
		},
		liquidityNativeValue (state, data) {
			state.liquidityNativeValue = data
		},
		isSwapBtnDisable (state, data) {
			state.isSwapBtnDisable = data
		},
		depositWithdrawConfig (state, data) {
			state.depositWithdrawConfig = data
		},
		isShowDepositWithdrawTipBox (state, data) {
			state.isShowDepositWithdrawTipBox = data
		},
		downloadKeplr (state, data) {
			state.downloadKeplr = data
		},
		currentWallet (state, data) {
			state.currentWallet = data
		},
		walletListMask (state, data) {
			state.walletListMask = data
		},
		isReadmeNotice (state, data) {
			state.isReadmeNotice = data
		},
		toFarmDenom (state, data) {
			state.toFarmDenom = data
		},
		isHideHeaderAndFooter (state, data) {
			state.isHideHeaderAndFooter = data
		},
		walletConnectUri (state, data) {
			state.walletConnectUri = data
		},
		isShowSideMenu (state, data) {
			state.isShowSideMenu = data
		},
		isShowErrorImg (state, data) {
			state.isShowErrorImg = data
		},
		isShowHarvestWaitingMask (state, data) {
			state.isShowHarvestWaitingMask = data
		},
		isShowStakeMask (state, data) {
			state.isShowStakeMask = {...data}
		},
		isBroadcastTxError (state, data) {
			state.isBroadcastTxError = data
		},
		defaultToken (state, data) {
			state.defaultToken = data
		},
		isWaitPending (state, data) {
			state.isWaitPending = data
		},
		autoSetFromIpt (state, data) {
			if(state.autoSetFromIpt === data ){
				state.autoSetFromIpt = ''
				state.autoSetFromIpt = data
			}else {
				state.autoSetFromIpt = data
			}
			
		},
		autoSetToIpt (state, data) {
			if(state.autoSetToIpt === data ){
				state.autoSetToIpt = ''
				state.autoSetToIpt = data
				
			}else {
				state.autoSetToIpt = data
			}
		},
		needSaveToIpt (state, data) {
			state.needSaveToIpt = data
		},
		isFromConversion (state, data) {
			state.isFromConversion = data
		},
		isToConversion (state, data) {
			state.isToConversion = data
		},
		
		isBuyOrder (state, data) {
			state.isBuyOrder = data
		},
		isChangeToken (state, data) {
			state.isChangeToken = data
		},
		swapObj (state, data) {
			state.swapObj = data
		},
		conversion (state, data) {
			state.conversion = data
		},
		isWaitingConfirmBox (state, data) {
			state.isWaitingConfirmBox = data
		},
		isPriceUpdate (state, data) {
			state.isPriceUpdate = data
		},
		isShowSwapConfirmTxBox (state, data) {
			state.isShowSwapConfirmTxBox = data
		},
		isShowConfirmTxBox (state, data) {
			state.isShowConfirmTxBox = data
		},
		isShowAddLiquidityConfirmTxBox(state,data){
			state.isShowAddLiquidityConfirmTxBox = data
		},
		isClickMaxBtn(state,data){
			state.isClickMaxBtn = data
		},
		
		slippageToleranceValue (state, data) {
			state.slippageToleranceValue = data
		},
		isShowSlippageTolerance (state, data) {
			state.isShowSlippageTolerance = data
		},
		isFromSelect (state, data) {
			state.isFromSelect = data
		},
		isToSelect (state, data) {
			state.isToSelect = data
		},
		selectedFromToken (state, data) {
			state.selectedFromToken = data
		},
		selectedToToken (state, data) {
			state.selectedToToken = data
		},
		tokenList (state, data) {
			state.tokenList = data
		},
		fromBalance (state, data) {
			state.fromBalance = data
		},
		toBalance(state,data){
			state.toBalance = data
		},
		async address (state,data) {
			state.address = data
			if(data){
                let client = await getClient(singleConfig);
				client.bank.queryAllBalances(data).then(res => {
					let addressMap = new Map()
					res.balancesList.forEach( item => {
						addressMap.set(item.denom,item)
					})
					for (let tokenItem of tokenList) {
						if(addressMap.has(tokenItem.denom)){
							let coin = {
								amount: addressMap.get(tokenItem.denom)  && addressMap.get(tokenItem.denom).amount ? addressMap.get(tokenItem.denom).amount : '',
								denom: tokenItem.denom
							}
							tokenItem.balance = coin.amount || "0"
						}
					}
					let baseToken = (tokenList || []).filter(token => token.isBaseToken)
					store.commit('tokenList',tokenList)
					store.commit('defaultToken',baseToken)
					
				}).catch(e => {
					console.log(e)
				})
			}
		},
		closedAddressCard (state, data) {
			state.addressCardIsClosed = data
		},
		isShowLinkContent (state, data) {
			state.isShowLinkContent = data
		},
		isShowSetting (state, data) {
			state.isShowSetting = data
		},
		isSelectToken (state, data) {
			state.isSelectToken = data
		},
		isHaveLiquidity (state, data) {
			state.isHaveLiquidity = data
		},
		isConnected (state, data) {
			state.isConnected = data
		},
		showDefaultSelectToken (state, data) {
			state.showDefaultSelectToken = data
		},
		slefLiquidity (state, data) {
			state.slefLiquidity = data
		},
		removeConfirmData (state, data) {
			state.removeConfirmData = data
		},
		standardIptValue (state, data) {
			state.standardIptValue = data
		},
		isSelectAddLiquidity (state, data) {
			state.isSelectAddLiquidity = data
		},
		selectedAddLiquidityToken (state, data) {
			state.selectedAddLiquidityToken = data
		},
		tokenIptValue (state, data) {
			state.tokenIptValue = data
		},
		isStartSelectAddLiquidity (state, data) {
			state.isStartSelectAddLiquidity = data
		},
		addLiquidityTxDetail (state, data) {
			state.addLiquidityTxDetail = data
		},
		standardInputLock (state, data) {
			state.standardInputLock = data
		},
		tokenInputLock (state, data) {
			state.tokenInputLock = data
		},
		isNavPool (state, data) {
			state.isNavPool = data
		},
		standardInputToken (state, data) {
			state.standardInputToken = data
		},
		addLiquidityTokenRatio (state, data) {
			state.addLiquidityTokenRatio = data
		},
		addLiquidityStandardRatio (state, data) {
			state.addLiquidityStandardRatio = data
		},
		isShowPriceAndCard (state, data) {
			state.isShowPriceAndCard = data
		},
        addressLpBalance(state, data) {
            state.addressLpBalance = data
        }
	}
})
export default store
