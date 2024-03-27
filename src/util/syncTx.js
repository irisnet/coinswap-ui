import axios from 'axios'
import {REMOVE_LIQUIDITY, TRANSFER, TX_EVENTS_ATTRIBUTES_AMOUNT, EVENT_REMOVE_LIQUIDITY_TOKEN_PAIR} from "../constant";
import {chainConfig} from "../constant/chainConfig";
const {VUE_APP_EXPLORER_URL} = process.env
const getTxInfoByTxHashUri = `${VUE_APP_EXPLORER_URL}/api/txs/`
import * as iris from "@irisnet/irishub-sdk";
import {Consts} from "./sdkHelper";
import {txType} from "../constant";
import store from '../vuex';
const base64 = require('js-base64')

export async function syncTx() {
    let txList = JSON.parse(localStorage.getItem('transactions')) || [];
    const currentStorageAddress = JSON.parse(localStorage.getItem('walletconnect')) || [];
    const currentAddress = currentStorageAddress ? currentStorageAddress.accounts[0] : '';
    let currentAddressTransactions = txList?.length ? txList.filter(item => item.address === currentAddress) : [];
    let formattedTx = currentAddressTransactions?.length ? currentAddressTransactions[0]?.list : [];
    const failedTx = formattedTx?.length && formattedTx?.filter(item => !item.txStatus);
    let chainConfigMap = new Map()
    if (chainConfig?.length) {
        chainConfig.forEach(item => {
            chainConfigMap.set(item.chainId, item)
        })
    }
    if(failedTx?.length) {
        for(const tx of failedTx) {
            if(!tx?.msgs?.length) {
                const config = chainConfigMap.get(tx.chainId);
                const client = iris.newClient(config).withRpcConfig({timeout: Consts.timeout});
                const resultData = await client.tendermint.queryTx(tx.hash);
                if(Object.keys(resultData)?.length) {
                    if (resultData?.tx_result?.events?.length) {
                        resultData.tx_result.events.forEach(item => {
                            if (item?.attributes?.length) {
                                item.attributes.forEach(value => {
                                    value.key = base64.decode(value.key || '')
                                    value.value = base64.decode(value.value || '')
                                })
                            }
                        })
                    }
                    const hubTxType = resultData?.tx?.body?.messagesList[0].type
                    tx.msgType = txType[hubTxType];
                    tx.txStatus = resultData?.tx_result?.code ? 0 : 1;
                    tx.events = resultData?.tx_result?.events;
                    tx.msgs = resultData?.tx?.body?.messagesList;
                    tx.ibcStatus = 'noIbcStatus';
                    tx.ibcTxResult = {};
                    tx.packetDstChannel = '';
                    tx.packetSequence = '';
                }
            }
        }
        localStorage.setItem('transactions', JSON.stringify(txList))
        store.commit('failedUpdateTimer', new Date().getTime())
    }
}

export function parseSwapOrderEvents(events) {
    let eventArray = []
    for (const eventItem of events) {
        if (eventItem.type === TRANSFER) {
            for (const attributesItem of eventItem.attributes) {
                if (attributesItem.key === TX_EVENTS_ATTRIBUTES_AMOUNT) {
                    const tokenAmount = formatAccountCoinsAmount(attributesItem.value)
                    eventArray.push(tokenAmount)
                }
            }
        }
    }
    return eventArray.filter((item, index) => index !== 0)
}


export function parseAddLqEvents(events) {
    let eventArray = []
    for (const eventItem of events) {
        if (eventItem.type === TRANSFER) {
            for (const attributesItem of eventItem.attributes) {
                if (attributesItem.key === TX_EVENTS_ATTRIBUTES_AMOUNT) {
                    if (attributesItem.value.includes(',')) {
                        const tokenAmount1 = formatAccountCoinsAmount(attributesItem.value.split(',')[0])
                        const tokenAmount2 = formatAccountCoinsAmount(attributesItem.value.split(',')[1])
                        eventArray.push(tokenAmount1, tokenAmount2)
                    }
                }
            }
        }
    }
    return eventArray
}

export function parseRemoveLqEvents(events) {
    let eventArray = []
    let transferEvens = events.filter(item => item.type === TRANSFER)
    let removeLiquidityEvent = events.filter(item => item.type === REMOVE_LIQUIDITY)
    let removeLiquidityItemObj = removeLiquidityEvent[0]
    let removeLiquidityMap = new Map()
    for (const removeLiquidityItem of removeLiquidityItemObj.attributes) {
        removeLiquidityMap.set(removeLiquidityItem.key, removeLiquidityItem)
    }
    let removeLiquidityInfo = transferEvens[transferEvens.length - 1]
    for (const removeLiquidityItemElement of removeLiquidityInfo.attributes) {
        if (removeLiquidityItemElement.key === TX_EVENTS_ATTRIBUTES_AMOUNT) {
            if (removeLiquidityItemElement.value.includes(',')) {
                const tokenAmount1 = formatAccountCoinsAmount(removeLiquidityItemElement.value.split(',')[0])
                const tokenAmount2 = formatAccountCoinsAmount(removeLiquidityItemElement.value.split(',')[1])
                eventArray.push(tokenAmount1, tokenAmount2)
            } else {
                const pair = removeLiquidityMap.get(EVENT_REMOVE_LIQUIDITY_TOKEN_PAIR)
                const token1Denom = pair.value.split('-')[0]
                const token2Denom = pair.value.split('-')[1]
                const defaultTokenAmount = {
                    denom: token2Denom,
                    amount: '0'
                }
                let tokenAmount1 = formatAccountCoinsAmount(removeLiquidityItemElement.value)
                let tokenAmount2 = defaultTokenAmount
                if (tokenAmount1.denom !== token1Denom) {
                    tokenAmount2 = [tokenAmount1, tokenAmount1 = tokenAmount2][0]
                }
                eventArray.push(tokenAmount1, tokenAmount2)
            }
            return eventArray
        }
    }
}

function formatAccountCoinsAmount(coinsAmount) {
    const token = {
        denom: '',
        amount: '0'
    }
    token.denom = coinsAmount.includes('ibc') ? `ibc${coinsAmount.split('ibc')[1]}` :/[A-Za-z\-]{2,15}/.exec(coinsAmount)[0]
    token.amount = /[0-9]+[.]?[0-9]*/.exec(coinsAmount)[0]
    return token
}