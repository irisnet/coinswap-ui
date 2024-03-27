import {queryPrice} from "../server/api";

export default async function updatePrice(){
    const coinPrice  = await queryPrice().catch(error => {console.error(error)})
    sessionStorage.setItem('coinPrice',JSON.stringify(coinPrice))
}