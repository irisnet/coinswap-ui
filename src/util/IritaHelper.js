import moveDecimal from 'move-decimal-point';
import {queryCoins} from "../server/api";
import store from "../vuex";
import {queryMainToken} from "./sdkHelper";

export async function getTokens() {
    let tokenList = []
    const config = await queryCoins().catch((e) => {
        console.error(e)
    });
    const hubBaseToken = await queryMainToken().catch((e) => {
        console.error(e)
    });
    if (config && config?.coins?.length && hubBaseToken && hubBaseToken.minUnit) {
        tokenList = config.coins.map(item => {
            const tokenConfig = {
                "name": item.name,
                "symbol": item.symbol,
                "denom": item.denom,
                "scale": item.scale,
                "coinId": item.coin_id,
                "platform": item.platform,
                "protocol": item.protocol,
                "lpt": item.lp_token,
                "price": item.price,
                "icon": item.icon,
                "tips": item.tips,
                "ibcTransferInfos": item.ibc_transfer_infos,
                "minUnit": item.denom,
                "offline": item.offline,
                "balance": "",
                "iptValue": "",
                "isTo": "",
            }
            if (item.denom === hubBaseToken.minUnit) {
                return {
                    "isBaseToken": true,
                    "isFrom": true,
                    ...tokenConfig
                }
            } else {
                return {
                    "isBaseToken": false,
                    "isFrom": '',
                    ...tokenConfig
                }
            }

        })
    }
    let baseToken = tokenList.filter(item => item.isBaseToken && !item.offline)
    if (baseToken && baseToken.length) {
        sessionStorage.setItem('baseToken', JSON.stringify(baseToken[0]))
    }
    if (tokenList?.length) {
        const configTokenList =  tokenList.filter(item => !item.offline)
        window.localStorage.setItem('config', JSON.stringify(configTokenList));
        store.commit('tokenList', configTokenList)
        window.localStorage.setItem('unstakeConfig',JSON.stringify(tokenList))
    }
}

export async function minUnitFormatCoin(_coin) {
    let tokenData = await getTokens();
    let coin = {
        denom: '',
        amount: ''
    };
    let displayCoin = {};
    if (typeof _coin == 'string') {
        let amount = (/[0-9]+[.]?[0-9]*/.exec(_coin) || [''])[0];
        let denom = _coin.replace(amount, '');
        coin.denom = denom;
        coin.amount = amount;
    } else if (typeof _coin == 'object') {
        coin = {..._coin};
    } else {
        console.warn('invalid amount');
    }

    tokenData.forEach((item) => {
        if (item.minUnit == coin.denom) {
            displayCoin.denom = item.symbol.toUpperCase();
            displayCoin.amount = moveDecimal(String(coin.amount || 0), 0 - item.scale);
        }
    })
    if (!displayCoin.denom) {
        console.warn('Denom did not match');
        return coin;
    }
    return displayCoin;
}

export async function displayFormatCoin(_coin) {
    let tokenData = await getTokens();
    let coin = {
        denom: '',
        amount: ''
    };
    let displayCoin = {};
    if (typeof _coin == 'string') {
        let amount = (/[0-9]+[.]?[0-9]*/.exec(_coin) || [''])[0];
        let denom = _coin.replace(amount, '');
        coin.denom = denom;
        coin.amount = amount;
    } else if (typeof _coin == 'object') {
        coin = {..._coin};
    } else {
        console.warn('invalid amount');
    }

    tokenData.forEach((item) => {
        if (item.symbol == coin.denom) {
            displayCoin.denom = item.minUnit;
            displayCoin.amount = moveDecimal(String(coin.amount || 0), Number(item.scale));
        }
    })
    if (!displayCoin.denom) {
        console.warn('Denom did not match');
        return coin;
    }
    return displayCoin;
}
