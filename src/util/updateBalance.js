import { getClient, singleConfig } from "./sdkHelper";
import store from "../vuex";
export default async function updateBalance(){
	let tokenList = JSON.parse(localStorage.getItem('config'))
    let client = await getClient(singleConfig);
	if(store.state.address && tokenList){
		client.bank.queryAllBalances(store.state.address).then(res => {
			let addressLpBalance = {
				address: store.state.address,
				balances: res
			}
			
			sessionStorage.setItem('farmLpBalance',JSON.stringify(addressLpBalance))
            store.commit('addressLpBalance', addressLpBalance)
			let addressMap = new Map()
			if(res){
				res.balancesList.forEach( item => {
					addressMap.set(item.denom,item)
				})
			}
		
			for (let tokenItem of tokenList) {
				if(addressMap.has(tokenItem.denom)){
					let coin = {
						amount: addressMap.get(tokenItem.denom)  && addressMap.get(tokenItem.denom).amount ? addressMap.get(tokenItem.denom).amount : '',
						denom: tokenItem.denom
					}
					tokenItem.balance = coin.amount || "0"
				}else {
					tokenItem.balance = '0'
				}
			}
			let baseToken = (tokenList || []).filter(token => token.isBaseToken)
			store.commit('tokenList',tokenList)
			store.commit('defaultToken',baseToken)
		})
	}
}

