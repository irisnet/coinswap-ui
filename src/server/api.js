import request from "./request"




export const  queryFarmList = (address) => {
	return request ({
		url:`/api/farm/pools?address=${address}`,
		method:'get',
	})
}
export const  queryFarmRewards = (address) => {
	return request ({
		url:`/api/farm/rewards?address=${address}`,
		method:'get',
	})
}
export const queryTVl = () => {
	return request({
		url:'/api/farm/infos',
		method:'get'
	})
}
export const queryCoins = () => {
	return request ({
		url:'/api/farm/coins',
		method:'get'
	})
}
export const queryLiquidityPool = (denom) => {
	return request({
		url:`/api/liquidity/pool?denom=${denom}`
	})
}
export const getNoticeStatusByAddress = (address) => {
	return request({
		url:`/api/farm/claim?address=${address}`,
		method:'get'
	})
}
export const setNoticeStatusByAddress = (address) => {
	return request({
		url:`/api/farm/claim`,
		data:address,
		method:'post'
	})
}
export const queryPrice = () => {
	return request({
		url:`/api/farm/coins_price`,
		method:'get'
	})
}
export const getNotice = () => {
	return request({
		url:`/api/notice`,
		method:'get'
	})
}