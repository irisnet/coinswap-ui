import {queryCoins} from "../server/api";
export default async function getAllTokenList() {
	return await queryCoins()
}
