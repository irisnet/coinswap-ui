import axios from "axios"
axios.defaults.withCredentials = false
import {errorCode, networkStatus, successCode} from "./apiCode";
import store from "../vuex";
const service = axios.create({
	baseUrl: '',
	timeout: 40000
})


service.interceptors.response.use(
	(response) => {
		if(response.status === networkStatus){
			if(response.data.code === successCode){
				store.commit('isShowErrorImg',false)
                if(response.config.url.includes("pools")) {
                    return Promise.resolve(response.data);
                }
				return Promise.resolve(response.data.data)
			}else {
				if(response.config.url.includes('pools')){
					
					return Promise.resolve({
						code: errorCode
					})
				}else {
					return Promise.resolve(null)
				}
			}
			
		}else {
		}
	},
	(error) => {
		if(error.response.config.url.includes('pools')){
			return Promise.resolve({
				code: errorCode
			})
		}else {
			return Promise.reject(error)
		}
	}
)
export default service
