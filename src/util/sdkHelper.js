import * as iris from "@irisnet/irishub-sdk";
import {fee, gas, node, chainId, network, liquidityTaskTime, MAX_STROAGE_LIST_LENGTH} from "@/constant";
import updateBalance from "./updateBalance";
import updatePrice from "./updatePrice";
import Tools from "./utils";
import store from "@/vuex";
import BigNumber from "bignumber.js";
import {queryLiquidityPool} from "../server/api";
import moment from 'moment'
import {KEPLR_WALLET} from "../constant";
import {keplrRejectCode} from "@/server/apiCode";
import {getTxResult} from "./webSocket";
const long = require('long')

let baseTxModal = {
    mode: iris.types.BroadcastMode.Sync,
    password: '1234567890'
}

export const Consts = {
    timeout: 10000
}

export const singleConfig = {
    node,
    network: Number(network),
    chainId,
    gas,
    fee,
};
export async function getClient(config) {
    return await iris.newClient(config).withRpcConfig({timeout: Consts.timeout});
}

export async function queryAuthAccount(client, address) {
    return await client.auth.queryAccount(address);
}

export async function queryMainToken() {
    let client = await getClient(singleConfig);
    const [tokens, params] = await Promise.all([client.token.queryTokens(), client.staking.queryParams()]);
    if (tokens && params) {
        const mainToken = (tokens || []).filter(token => token.minUnit === params.params.bondDenom);
        return mainToken[0];
    }
    return {};
}


export async function queryBankBalance(address, denom) {
    let client = await getClient(singleConfig);
    return await client.bank.queryBalance(address, denom);
}

export async function queryBankAllBalances(client, address) {
    return await client.bank.queryAllBalances(address);
}

export async function queryCoinswapLiquidities(denom) {
    const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
    const configMap = new Map()
    if (config && config?.length) {
        config.forEach(item => {
            configMap.set(item.denom, item)
        })
    }
    let lpt = ''
    if (denom) {
        if (configMap.has(denom)) {
            lpt = configMap.get(denom).lpt
        }
    }
    if (lpt) {
        let client = await getClient(singleConfig);
        let data = await client.coinswap.queryLiquidity(lpt);
        if (data) {
            return {
                liquidity: data.pool.lpt,
                standard: data.pool.standard,
                token: data.pool.token,
                fee: data.pool.fee
            }
        }
    }
}

export async function queryAddressLiquidity(client, address) {
    let tokens = ''
    const addressBalance  = sessionStorage.getItem('farmLpBalance') ? JSON.parse(sessionStorage.getItem('farmLpBalance')) : null
    if(addressBalance?.address && addressBalance?.address === address){
        tokens = addressBalance.balances
    }else {
        tokens= await queryBankAllBalances(client, address)
    }
    const liquiditys = sessionStorage.getItem("liquidities") && JSON.parse(sessionStorage.getItem("liquidities"));
    const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
    const configMap = new Map()
    if (config && config?.length) {
        config.forEach(item => {
            configMap.set(item.lpt, item)
        })
    }
    let selfLiquidity = [];
    for (const token of tokens.balancesList || []) {
        if (token?.denom && token?.denom?.startsWith("lpt")) {
            let lptMapDenom = ''
            if (token.denom) {
                if (configMap.has(token.denom)) {
                    lptMapDenom = configMap.get(token.denom).denom
                }
            }
            const liquidity = liquiditys && liquiditys[lptMapDenom] || await queryCoinswapLiquidities(lptMapDenom);
            if (liquidity && token.amount > 0) {
                const liquidityPercentage = Tools.bigNumberDivideToString(token.amount, liquidity.liquidity.amount);
                const tokenAmount = Tools.bigNumberMultiply(liquidity.token.amount, liquidityPercentage);
                const standardAmount = Tools.bigNumberMultiply(liquidity.standard.amount, liquidityPercentage);
                const standardTotal = liquidity.standard.amount;
                const tokenTotal = liquidity.token.amount;
                const standardRatio = Tools.bigNumberDivideToString(tokenTotal, standardTotal);
                const tokenRatio = Tools.bigNumberDivideToString(standardTotal, tokenTotal);
                const selfToken = {
                    liquidityPercentage,
                    fee: liquidity.fee,
                    standardTotal: liquidity.standard,
                    standard: {
                        amount: standardAmount,
                        denom: liquidity.standard.denom,
                    },
                    tokenTotal: liquidity.token,
                    token: {
                        amount: tokenAmount,
                        denom: liquidity.token.denom,
                    },
                    selfLiquidity: token,
                    liquidityTotal: liquidity.liquidity,
                    standardRatio,
                    tokenRatio,
                };
                selfLiquidity.push(selfToken);
            }
        }
    }
    return selfLiquidity;
}

export async function queryAddLiquidityDetail(standardAmount, tokenDenom) {
    const liquiditys = sessionStorage.getItem("liquidities") && JSON.parse(sessionStorage.getItem("liquidities"));
    const liquidity = liquiditys && liquiditys[tokenDenom] || await queryCoinswapLiquidities(tokenDenom);
    if (liquidity && liquidity.liquidity.amount != 0) {
        const standardTotal = liquidity.standard.amount;
        const tokenTotal = liquidity.token.amount;
        const liquidityTotal = liquidity.liquidity.amount;
        const tokenAmount = Tools.bigNumberAdd(Tools.bigNumberMultiply(Tools.bigNumberDivideToString(standardAmount, standardTotal), tokenTotal), 1);
        const liquidityAmount = Tools.bigNumberMultiply(Tools.bigNumberDivideToString(standardAmount, standardTotal), liquidityTotal);
        const standardRatio = Tools.bigNumberDivideToString(tokenAmount, standardAmount);
        const tokenRatio = Tools.bigNumberDivideToString(standardAmount, tokenAmount);
        const liquidityPercentage = Tools.bigNumberDivideToString(liquidityAmount, Tools.bigNumberAdd(liquidityAmount, liquidityTotal));
        return {
            tokenAmount,
            standardAmount,
            liquidity: {denom: liquidity.liquidity.denom, amount: liquidityAmount},
            standardRatio,
            tokenRatio,
            liquidityPercentage
        };
    } else if (liquidity && liquidity.liquidity.amount == 0) {
        return {liquidity: {denom: liquidity.liquidity.denom, amount: standardAmount}};
    }
    return {};
}

export async function queryRemoveLiquidityDetail(tokenDenom) {
    const liquiditys = sessionStorage.getItem("liquidities") && JSON.parse(sessionStorage.getItem("liquidities"));
    const liquidity = liquiditys && liquiditys[tokenDenom] || await queryCoinswapLiquidities(tokenDenom);
    if (liquidity) {
        const standardTotal = liquidity.standard.amount;
        const tokenTotal = liquidity.token.amount;
        const standardRatio = Tools.bigNumberDivideToString(tokenTotal, standardTotal);
        const tokenRatio = Tools.bigNumberDivideToString(standardTotal, tokenTotal);
        return {standardRatio, tokenRatio};
    }
    return {};
}

export async function buildUnsignedTx(client, chainId, address, msgs, memo) {
    const currentConnectWallet = KEPLR_WALLET
    let baseTx = {...baseTxModal};
    baseTx.memo = memo ? memo : ' '
    const authAccount = await queryAuthAccount(client, address);
    if (authAccount) {
        baseTx.account_number = authAccount.accountNumber;
        baseTx.sequence = authAccount.sequence;
        baseTx.chainId = client.config.chainId;
        let unsignedStdTx = client.tx.buildTx(msgs, baseTx);
        switch (currentConnectWallet){
            case KEPLR_WALLET:
                return await keplrSignTx(client, chainId,unsignedStdTx);
        }
    }
    return "";
}
async function keplrSignTx(client, chainId,unsignedStdTx){
    if(window.keplr){
        await window.keplr.enable(chainId)
        const keplrAddrObj = await window.keplr.getKey(chainId)
        if(unsignedStdTx?.txData?.sequence === undefined){
            unsignedStdTx.setPubKey(Buffer.from(keplrAddrObj.pubKey).toString('hex'), 0)
        } else {
            unsignedStdTx.setPubKey(Buffer.from(keplrAddrObj.pubKey).toString('hex'))
        }
        const signDoc = unsignedStdTx.getSignDoc(unsignedStdTx?.txData?.account_number || 0,chainId)
        const kepkrDirectObj = {
            bodyBytes: signDoc.getBodyBytes(),
            authInfoBytes: signDoc.getAuthInfoBytes(),
            chainId: signDoc.getChainId(),
            accountNumber:  new long(signDoc.getAccountNumber())
        }
        const keplrSignedDoc = await window.keplr.signDirect(chainId,keplrAddrObj.bech32Address,kepkrDirectObj).catch(error => {
            console.log(error)
            return {
                code:keplrRejectCode,
                message:'keplr reject '
            }
        })
        if(keplrSignedDoc?.code){
            return  {
                code:keplrRejectCode,
                message:'keplr reject '
            }
        }
        unsignedStdTx.addSignature(keplrSignedDoc.signature.signature);
        unsignedStdTx.body = client.protobuf.deserializeTxBody(keplrSignedDoc.signed.bodyBytes,true)
        unsignedStdTx.authInfo = client.protobuf.deserializeAuthInfo(keplrSignedDoc.signed.authInfoBytes,true)
        return unsignedStdTx
    }
}
export async function broadcastTx(client,recover_signed_std_tx_str,transferNeedData) {
    const currentConnectWallet = KEPLR_WALLET
    let signed_std_tx = ''
    switch (currentConnectWallet){
        case KEPLR_WALLET:
            signed_std_tx = recover_signed_std_tx_str;
            break;
    }
    let storageTransactions = JSON.parse(localStorage.getItem('transactions')) || []
    let connectedData = JSON.parse(localStorage.getItem('walletconnect')) || {}
    const address = connectedData ? connectedData.accounts[0] : ''
    return await client.tx.broadcast(signed_std_tx, baseTxModal.mode).then(res => {
        let chainId = client?.config?.chainId;
        let newAddTxList = []
        if (storageTransactions?.length && res?.hash) {
            const connectedAddressTxList = storageTransactions.filter(item => item.address === address)
            const newAddressTxList = storageTransactions.filter(item => item.address !== address) || []
            if (connectedAddressTxList && connectedAddressTxList.length) {
                connectedAddressTxList[0].list.unshift({
                    hash:res.hash,
                    chainId,
                    dstChainId: transferNeedData?.dstChainId || '',
                    txStatus: 'noStatus'
                })
                if(connectedAddressTxList[0].list?.length) {
                    if(connectedAddressTxList[0].list.length > MAX_STROAGE_LIST_LENGTH) {
                        connectedAddressTxList[0].list?.splice(MAX_STROAGE_LIST_LENGTH);
                    }
                }
            } else {
                newAddressTxList.unshift({
                    address: address,
                    list: [{
                        hash:res.hash,
                        chainId,
                        dstChainId: transferNeedData?.dstChainId || '',
                        txStatus: 'noStatus'
                    }]
                })
                if(newAddressTxList?.length) {
                    if(newAddressTxList[0]?.list?.length) {
                        if(newAddressTxList[0].list.length > MAX_STROAGE_LIST_LENGTH) {
                            newAddressTxList[0].list?.splice(MAX_STROAGE_LIST_LENGTH);
                        }
                    }
                }
            }
            newAddTxList = [...newAddressTxList, ...connectedAddressTxList]
        } else {
            newAddTxList.unshift({
                address: address,
                list: [{
                    hash:res.hash,
                    chainId,
                    dstChainId: transferNeedData?.dstChainId || '',
                    txStatus: 'noStatus'
                }]
            })
            if(newAddTxList?.length) {
                if(newAddTxList[0]?.list?.length) {
                    if(newAddTxList[0].list.length > MAX_STROAGE_LIST_LENGTH) {
                        newAddTxList[0].list?.splice(MAX_STROAGE_LIST_LENGTH);
                    }
                }
            }
        }
        localStorage.setItem('transactions', JSON.stringify(newAddTxList))
        if(chainId && res?.hash) {
            getTxResult(chainId, res.hash, transferNeedData);
        }
        updateBalance()
        updatePrice()
        return res;
    }).catch(e => {
        console.log(e,'broadcast error')
        return e
    })
}

export async function swapToken(isBuyOrder, fromToken, toToken, slippageTolerance) {
    let baseToken = sessionStorage.getItem('baseToken') ? JSON.parse(sessionStorage.getItem('baseToken')) : await queryMainToken()
    const {denom: fromDenom, amount: fromAmount} = fromToken;
    const {denom: toDenom, amount: toAmount} = toToken;
    const {minUnit: mainToken, scale, symbol} = baseToken;
    const liquiditys = sessionStorage.getItem("liquidities") && JSON.parse(sessionStorage.getItem("liquidities"));
    if (!isBuyOrder) {
        if (fromDenom === mainToken || toDenom === mainToken) {
            const queryDenom = fromDenom === mainToken ? toDenom : fromDenom;
            const liquidity = liquiditys && liquiditys[queryDenom] || await queryCoinswapLiquidities(queryDenom);
            if (liquidity) {
                const {
                    to,
                    fromRaito,
                    toRaito,
                    liquidityProviderFee,
                    minimumReceived
                } = sellCompute(fromToken, liquidity, slippageTolerance);
                const poolInputAmount = fromDenom === mainToken ? liquidity.standard.amount : liquidity.token.amount;
                const poolOutputAmount = toDenom === mainToken ? liquidity.standard.amount : liquidity.token.amount;
                const priceImpact = getOnePriceImpact(poolInputAmount, poolOutputAmount, fromAmount, to, liquidityProviderFee);
                return {
                    from: {denom: fromDenom, amount: fromAmount},
                    to: {denom: toDenom, amount: to},
                    fromRaito,
                    toRaito,
                    liquidityProviderFee: {denom: fromDenom, amount: liquidityProviderFee},
                    priceImpact,
                    minimumReceived,
                    isBuyOrder
                };
            }
        }
        if (fromDenom !== mainToken && toDenom !== mainToken) {
            const oneLiquidity = liquiditys && liquiditys[fromDenom] || await queryCoinswapLiquidities(fromDenom);
            const twoLiquidity = liquiditys && liquiditys[toDenom] || await queryCoinswapLiquidities(toDenom);
            if (oneLiquidity && twoLiquidity) {
                const {
                    to,
                    fromRaito,
                    toRaito,
                    liquidityProviderFee,
                    minimumReceived
                } = sellTwoCompute(fromToken, oneLiquidity, twoLiquidity, slippageTolerance);
                const poolOneInputAmount = oneLiquidity.token.amount;
                const poolOneOutputAmount = oneLiquidity.standard.amount;
                const poolTwoInputAmount = twoLiquidity.standard.amount;
                const poolTwoOutputAmount = twoLiquidity.token.amount;
                const priceImpact = getTwoPriceImpact(poolOneInputAmount, poolOneOutputAmount, poolTwoInputAmount, poolTwoOutputAmount, fromAmount, to, liquidityProviderFee);
                return {
                    from: {denom: fromDenom, amount: fromAmount},
                    to: {denom: toDenom, amount: to},
                    fromRaito,
                    toRaito,
                    liquidityProviderFee: {denom: fromDenom, amount: liquidityProviderFee},
                    priceImpact,
                    minimumReceived,
                    isBuyOrder
                };
            }
        }
    } else {
        if (fromDenom === mainToken || toDenom === mainToken) {
            const queryDenom = fromDenom === mainToken ? toDenom : fromDenom;
            const liquidity = liquiditys && liquiditys[queryDenom] || await queryCoinswapLiquidities(queryDenom);
            if (liquidity) {
                const {
                    from,
                    fromRaito,
                    toRaito,
                    maximumSold,
                    liquidityProviderFee
                } = buyCompute(toToken, liquidity, slippageTolerance);
                const poolInputAmount = fromDenom === mainToken ? liquidity.standard.amount : liquidity.token.amount;
                const poolOutputAmount = toDenom === mainToken ? liquidity.standard.amount : liquidity.token.amount;
                const priceImpact = getOnePriceImpact(poolInputAmount, poolOutputAmount, from, toAmount, liquidityProviderFee);
                return {
                    from: {denom: fromDenom, amount: from},
                    to: {denom: toDenom, amount: toAmount},
                    fromRaito,
                    toRaito,
                    liquidityProviderFee: {denom: fromDenom, amount: liquidityProviderFee},
                    priceImpact,
                    maximumSold,
                    isBuyOrder
                };
            }
        }
        if (fromDenom !== mainToken && toDenom !== mainToken) {
            const oneLiquidity = liquiditys && liquiditys[toDenom] || await queryCoinswapLiquidities(toDenom);
            const twoLiquidity = liquiditys && liquiditys[fromDenom] || await queryCoinswapLiquidities(fromDenom);
            if (oneLiquidity && twoLiquidity) {
                const {
                    from,
                    fromRaito,
                    toRaito,
                    maximumSold,
                    liquidityProviderFee
                } = buyTwoCompute(toToken, oneLiquidity, twoLiquidity, slippageTolerance);
                const poolOneInputAmount = twoLiquidity.token.amount;
                const poolOneOutputAmount = twoLiquidity.standard.amount;
                const poolTwoInputAmount = oneLiquidity.standard.amount;
                const poolTwoOutputAmount = oneLiquidity.token.amount;
                const priceImpact = getTwoPriceImpact(poolOneInputAmount, poolOneOutputAmount, poolTwoInputAmount, poolTwoOutputAmount, from, toAmount, liquidityProviderFee);
                return {
                    from: {denom: fromDenom, amount: from},
                    to: {denom: toDenom, amount: toAmount},
                    fromRaito,
                    toRaito,
                    liquidityProviderFee: {denom: fromDenom, amount: liquidityProviderFee},
                    priceImpact,
                    maximumSold,
                    isBuyOrder
                };
            }
        }
    }
}

function sellCompute(fromToken, liquidity, slippageTolerance) {
    const {denom: fromDenom, amount: fromAmount} = fromToken;
    const fee = Tools.bigNumberSubtract(1, liquidity.fee);
    const liquidityProviderFee = Tools.bigNumberMultiply(fromAmount, liquidity.fee);
    const {numerator, denominator} = Tools.getFractionalExpression(fee, 0.0000001);
    const x = liquidity.standard.denom === fromDenom ? liquidity.standard : liquidity.token;
    const y = liquidity.standard.denom !== fromDenom ? liquidity.standard : liquidity.token;
    const to = Tools.bigNumberDivideToString(Tools.bigNumberMultiply(Tools.bigNumberMultiply(numerator, fromAmount), y.amount), Tools.bigNumberAdd(Tools.bigNumberMultiply(denominator, x.amount), Tools.bigNumberMultiply(numerator, fromAmount)));
    const fromRaito = Tools.bigNumberDivideToString(to, fromAmount);
    const toRaito = Tools.bigNumberDivideToString(fromAmount, to);
    const minimumReceived = Tools.bigNumberDivideToString(to, Tools.bigNumberAdd(slippageTolerance, 1));
    return {to, fromRaito, toRaito, liquidityProviderFee, minimumReceived};
}

function sellTwoCompute(fromToken, oneLiquidity, twoLiquidity, slippageTolerance) {
    const {denom: fromDenom, amount: fromAmount} = fromToken;
    const {to: oneSwap} = sellCompute(fromToken, oneLiquidity);
    const {to} = sellCompute({denom: oneLiquidity.standard.denom, amount: oneSwap}, twoLiquidity);
    const liquidityProviderFee = Tools.bigNumberMultiply(fromAmount, Tools.bigNumberMultiply(oneLiquidity.fee, 2));
    const fromRaito = Tools.bigNumberDivideToString(to, fromAmount);
    const toRaito = Tools.bigNumberDivideToString(fromAmount, to);
    const minimumReceived = Tools.bigNumberDivideToString(to, Tools.bigNumberAdd(slippageTolerance, 1));
    return {to, fromRaito, toRaito, liquidityProviderFee, minimumReceived};
}

function buyCompute(toToken, liquidity, slippageTolerance) {
    const {denom: toDenom, amount: toAmount} = toToken;
    const fee = Tools.bigNumberSubtract(1, liquidity.fee);
    const {numerator, denominator} = Tools.getFractionalExpression(fee, 0.0000001);
    const y = liquidity.standard.denom === toDenom ? liquidity.standard : liquidity.token;
    const x = liquidity.standard.denom !== toDenom ? liquidity.standard : liquidity.token;
    if (y.amount != toAmount) {
        const from = Tools.bigNumberAdd(Tools.bigNumberDivideToString(Tools.bigNumberMultiply(Tools.bigNumberMultiply(denominator, x.amount), toAmount), Tools.bigNumberMultiply(numerator, Tools.bigNumberSubtract(y.amount, toAmount))), 1);
        const fromRaito = Tools.bigNumberDivideToString(toAmount, from);
        const toRaito = Tools.bigNumberDivideToString(from, toAmount);
        const maximumSold = new BigNumber(Tools.bigNumberMultiply(from, Tools.bigNumberAdd(slippageTolerance, 1))).toFixed();
        const liquidityProviderFee = Tools.bigNumberMultiply(from, liquidity.fee);
        return {from, fromRaito, toRaito, liquidityProviderFee, maximumSold};
    } else {
        return {from: -1, fromRaito: "-1", liquidityProviderFee: -1, maximumSold: "-1", toRaito: "-1"}
    }
}

function buyTwoCompute(toToken, oneLiquidity, twoLiquidity, slippageTolerance) {
    const {denom: toDenom, amount: toAmount} = toToken;
    const {from: oneSwap} = buyCompute(toToken, oneLiquidity, slippageTolerance);
    const {from} = buyCompute({denom: oneLiquidity.standard.denom, amount: oneSwap}, twoLiquidity, slippageTolerance);
    const fromRaito = Tools.bigNumberDivideToString(toAmount, from);
    const toRaito = Tools.bigNumberDivideToString(from, toAmount);
    const liquidityProviderFee = Tools.bigNumberMultiply(from, Tools.bigNumberMultiply(oneLiquidity.fee, 2));
    const maximumSold = new BigNumber(Tools.bigNumberMultiply(from, Tools.bigNumberAdd(slippageTolerance, 1))).toFixed();
    return {from, fromRaito, toRaito, liquidityProviderFee, maximumSold};
}

function getOnePriceImpact(poolInputAmount, poolOutputAmount, inputAmount, outputAmount, liquidityProviderFee) {
    const midPrice = Tools.bigNumberDivideToString(poolOutputAmount, poolInputAmount);
    const exactQuote = Tools.bigNumberMultiply(midPrice, Tools.bigNumberSubtract(inputAmount, liquidityProviderFee));
    const priceImpact = Tools.bigNumberDivideToString(Tools.bigNumberSubtract(exactQuote, outputAmount), exactQuote);
    return priceImpact
}

function getTwoPriceImpact(poolOneInputAmount, poolOneOutputAmount, poolTwoInputAmount, poolTwoOutputAmount, inputAmount, outputAmount, liquidityProviderFee) {
    const midPrice = Tools.bigNumberMultiply(Tools.bigNumberDivideToString(poolOneOutputAmount, poolOneInputAmount), Tools.bigNumberDivideToString(poolTwoOutputAmount, poolTwoInputAmount));
    const exactQuote = Tools.bigNumberMultiply(midPrice, Tools.bigNumberSubtract(inputAmount, liquidityProviderFee));
    const priceImpact = Tools.bigNumberDivideToString(Tools.bigNumberSubtract(exactQuote, outputAmount), exactQuote);
    return priceImpact
}

export async function depositIbcTransferByClient (client,chainId,params) {
    const {from,port,channel,sender,receiver,timeout_timestamp,depositToken } = params
    const  msgs = [
        {
            type: iris.types.TxType.MsgTransfer,
            value: {
                source_port: port,
                source_channel: channel,
                token: depositToken,
                sender: sender,
                receiver: receiver,
                timeout_timestamp:timeout_timestamp
            }
        }
    ]
    const memo = ' '
    return buildUnsignedTx(client,chainId,from,msgs, memo);
}

export async function SwapOrderUnsignedTX(client, chainId, params) {
    const {input, output, is_buy_order, deadline, sender} = params;
    const msgs = [
        {
            type: iris.types.TxType.MsgSwapOrder,
            value: {
                input: {address: sender, coin: input},
                output: {address: sender, coin: output},
                deadline,
                is_buy_order,
            },
        },
    ];
    return buildUnsignedTx(client, chainId, sender, msgs);
}

export async function addLiquidityUnsignedTX(client, chainId, params) {
    const {max_token, exact_standard_amt, min_liquidity, deadline, sender} = params;
    const msgs = [
        {
            type: iris.types.TxType.MsgAddLiquidity,
            value: {
                max_token,
                exact_standard_amt,
                min_liquidity,
                deadline,
                sender,
            },
        },
    ];
    return buildUnsignedTx(client, chainId, sender, msgs);
}

export async function RemoveLiquidityUnsignedTX(client, chainId, params) {
    let {withdraw_liquidity, min_token, min_standard_amt, deadline, sender} = params;
    const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : null
    const configMap = new Map()
    if (config && config?.length) {
        config.forEach(item => {
            configMap.set(item.denom, item)
        })
    }
    let lpt = ''
    if (withdraw_liquidity.denom) {
        if (configMap.has(withdraw_liquidity.denom)) {
            lpt = configMap.get(withdraw_liquidity.denom).lpt
        }
    }
    
    if (lpt) {
        withdraw_liquidity.denom = lpt
    }
    const msgs = [
        {
            type: iris.types.TxType.MsgRemoveLiquidity,
            value: {
                withdraw_liquidity,
                min_token,
                min_standard_amt,
                deadline,
                sender,
            },
        },
    ];
    return buildUnsignedTx(client, chainId, sender, msgs);
}

export async function sendUnSignTx(client, chainId, params) {
    const {from, poolId} = params
    const msgs = [
        {
            type: iris.types.TxType.MsgHarvest,
            value: {
                pool_id: poolId,
                sender: from,
            }
        }
    ]
    return buildUnsignedTx(client, chainId, from, msgs);
}

export async function buildFarmStake(client, chainId, params) {
    const {from,amount, poolId} = params
    const msgs = [
        {
            type: iris.types.TxType.MsgStake,
            value: {
                pool_id: poolId,
                amount:amount,
                sender: from,
            }
        }
    ]
    return buildUnsignedTx(client, chainId, from, msgs);
}

export async function buildFarmUnStake(client, chainId, params) {
    const {from,amount, poolId} = params
    const msgs = [
        {
            type: iris.types.TxType.MsgUnstake,
            value: {
                pool_id: poolId,
                amount:amount,
                sender: from,
            }
        }
    ]
    return buildUnsignedTx(client, chainId, from, msgs);
}

export async function liquidityTask() {
    window.liquidityTimer = window.setInterval(async () => {
        try {
            const tokenList = store.state.tokenList;
            let map = {};
            if (tokenList && tokenList.length > 0) {
                const liquidityInfo = sessionStorage.getItem('liquidities') ? JSON.parse(sessionStorage.getItem('liquidities')) : null
                let denoms = []
                tokenList.forEach(token => {
                    if(!token.isBaseToken){
                        denoms.push(token.denom)
                    }
                })
                let allDenomLiquidityPool = [],allDenomLiquidityPoolFromRpcNode = []
                if (denoms?.length) {
                    allDenomLiquidityPool = await queryLiquidityPool(denoms.toString()).catch(async (error) => {
                        allDenomLiquidityPoolFromRpcNode = []
                        for (const denom of denoms) {
                            const res = await queryCoinswapLiquidities(denom);
                            res.update_at = moment().unix()
                            allDenomLiquidityPoolFromRpcNode.push(res)
                            allDenomLiquidityPool = allDenomLiquidityPoolFromRpcNode
                        }
                    })
                }
                if(allDenomLiquidityPool?.length){
                    allDenomLiquidityPool.forEach(async (denomLiquidityPool) => {
                        const storageTimestamp = liquidityInfo && liquidityInfo[denomLiquidityPool.denom] && liquidityInfo[denomLiquidityPool.denom].update_at ? liquidityInfo[denomLiquidityPool.denom].update_at : 0
                        let diffTimestampForStorage = moment().unix() - storageTimestamp
                        let apiTimestampForTokenDenom = 0
                        if (denomLiquidityPool?.update_at) {
                            apiTimestampForTokenDenom = denomLiquidityPool.update_at
                            let diffTimestampForApi = moment().unix() - apiTimestampForTokenDenom
                            if (diffTimestampForStorage > 10 || diffTimestampForApi > 10){
                                denomLiquidityPool = await queryCoinswapLiquidities(denomLiquidityPool.denom);
                            }
                        }
                        allDenomLiquidityPool.push(denomLiquidityPool)
                        
                    })
                }else {
                    for (const denom of denoms) {
                        const res = await queryCoinswapLiquidities(denom);
                        res.update_at = moment().unix()
                        allDenomLiquidityPoolFromRpcNode.push(res)
                        allDenomLiquidityPool = allDenomLiquidityPoolFromRpcNode
                    }
                    allDenomLiquidityPool = allDenomLiquidityPoolFromRpcNode
                }
                if(allDenomLiquidityPool?.length){
                    allDenomLiquidityPool.forEach( item => {
                        map[item?.token?.denom] = item
                    })
                }
                sessionStorage.setItem("liquidities", JSON.stringify(map));
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }, liquidityTaskTime);
}

export async function newLiquidityTask() {
    window.liquidityTaskTimer = setInterval(async () => {
        let liquidityMap = {};
        const liquidityArr = await queryLiquidityPool().catch(error => {
            console.error(error)
        });
        if (liquidityArr?.length) {
            for (const liquidityPool of liquidityArr) {
                if (liquidityPool?.token?.denom) {
                    liquidityMap[liquidityPool.token.denom] = liquidityPool
                }
            }
        }
        sessionStorage.setItem("liquidities", JSON.stringify(liquidityMap));
    }, liquidityTaskTime)
}

export async function closeLiquidityTask() {
    try {
        clearInterval(window.liquidityTimer);
        clearInterval(window.liquidityTaskTimer)
        return true;
    } catch (e) {
        return e;
    }
}