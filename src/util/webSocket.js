import {chainConfig} from '../constant/chainConfig';
import {txType, ORIGINAL_CHAIN_SUBSCRIPTION_TIMEOUT, TARGET_CHAIN_SUBSCRIPTION_TIMEOUT, TRANSFER, mintscanRoute} from '../constant';
import store from '../vuex';
import lang from '../assets/lang/en';
const base64 = require('js-base64');
const {VUE_APP_IBC_EXPLORER_URL,VUE_APP_EXPLORER_URL} = process.env
export const getTxResult = (chainId, txHash, transferNeedData) => {
    let wsUrl = '';
    chainConfig.forEach(item => {
        if(item.chainId === chainId) {
            wsUrl = item.webSocketUrl;
        }
    })
    let connectCount = 0;
    let timer = null;
    webSocketInit(chainId, txHash, transferNeedData);
    function webSocketInit(chainId, txHash, transferNeedData) {
        let ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'subscribe',
                    params: {
                        query: `tm.event='Tx' AND tx.hash='${txHash}'`
                    }
                })
            )
        }
        ws.onerror = (event) => {
            if(event && event.type === 'error') {
                if(connectCount < 3) {
                    reconnect(chainId, txHash, transferNeedData);
                } else {
                    resetStatus();
                }
            }
        }
        ws.onclose = () =>{
        }
        ws.onmessage = (msg) => {
            let jsonResultData = JSON.parse(msg?.data);
            if(jsonResultData?.result) {
                if(Object.keys(jsonResultData.result).length) {
                    clearTimeout(timer);
                    let msgAction = jsonResultData.result?.events && jsonResultData.result?.events['message.action'] ? jsonResultData.result.events['message.action'][0]?.split('/')[1] ? jsonResultData.result.events['message.action'][0]?.split('/')[1] : jsonResultData.result.events['message.action'][0] : '';
                    let txStatus = jsonResultData.result?.data?.value?.TxResult?.result.code ? 0 : 1;
                    let events = jsonResultData.result?.data?.value?.TxResult?.result?.events || [];
                    if (jsonResultData.result?.data?.value?.TxResult?.result?.events?.length) {
                        jsonResultData.result?.data?.value?.TxResult?.result?.events.forEach(item => {
                            if (item?.attributes?.length) {
                                item.attributes.forEach(value => {
                                    value.key = base64.decode(value.key || '')
                                    value.value = base64.decode(value.value || '')
                                })
                            }
                        })
                    }
                    let txData = lang.transactionText;
                    let transactionObj = {
                        img: txStatus ? txData.successfulImg : txData.failedImg,
                        title: txStatus ? txData.successful : txData.failed,
                        link: `${VUE_APP_EXPLORER_URL}/${mintscanRoute[chainId]}/txs/${txHash}`,
                        viewonExplorer: txData.viewonExplorer
                    }
                    store.commit('transactionResult', transactionObj);
                    let storageTransactions = JSON.parse(localStorage.getItem('transactions')) || []
                    const connectedData = JSON.parse(localStorage.getItem('walletconnect')) || {}
                    const address = connectedData?.accounts[0] || ''
                    if(storageTransactions?.length) {
                        let connectedAddressTxList = storageTransactions.filter(item => item.address === address)
                        if(connectedAddressTxList?.length) {
                            connectedAddressTxList[0] && connectedAddressTxList[0]?.list?.forEach(item => {
                                if(item?.hash === txHash) {
                                    item.txStatus = txStatus;
                                    item.msgType = txType[msgAction] || msgAction || '';
                                    item.events = events;
                                    item.msgs = [];
                                    item.ibcStatus = 'noIbcStatus';
                                    item.ibcTxResult = {};
                                    item.packetDstChannel = '';
                                    item.packetSequence = '';
                                }
                            })
                            localStorage.setItem('transactions', JSON.stringify(storageTransactions))
                            store.commit('updateTimer', new Date().getTime());
                            ws.close();
                            if((txType[msgAction] || msgAction) === TRANSFER) {
                                const packetDstChannel = jsonResultData.result?.events['send_packet.packet_dst_channel'] ? jsonResultData.result.events['send_packet.packet_dst_channel'][0] : '';
                                const packetSequence = jsonResultData.result?.events['send_packet.packet_sequence'] ? jsonResultData.result.events['send_packet.packet_sequence'][0] : '';
                                if(packetDstChannel && packetSequence) {
                                    if(packetDstChannel && packetSequence && txHash && transferNeedData && Object.keys(transferNeedData)?.length) {
                                        getIbcTxResult(packetDstChannel, packetSequence, txHash, transferNeedData);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    timer = setTimeout(() => {
                        if(!Object.keys(jsonResultData.result).length) {
                            resetStatus();
                            ws.close();
                        }
                    }, ORIGINAL_CHAIN_SUBSCRIPTION_TIMEOUT)
                }
            }
        }
    }
    function reconnect(chainId, txHash, transferNeedData) {
        connectCount++;
        webSocketInit(chainId, txHash, transferNeedData);
    }
}
export const getIbcTxResult = (dstChannel, packetSequence, txHash, transferNeedData) => {
    let wsIbcUrl = '';
    chainConfig.forEach(item => {
        if(item.chainId === transferNeedData?.dstChainId) {
            wsIbcUrl = item.webSocketUrl;
        }
    })
    let ibcCount = 0;
    let ibcTimer = null;
    ibcWebSocketInit(dstChannel, packetSequence, txHash, transferNeedData)
    function ibcWebSocketInit(dstChannel, packetSequence, txHash, transferNeedData) {
        let wsIbc = new WebSocket(wsIbcUrl);
        wsIbc.onopen = () => {
            wsIbc.send(
                JSON.stringify({
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'subscribe',
                    params: {
                        order_by: "desc",
                        page: "1",
                        per_page: "1",
                        query: `tm.event='Tx' and recv_packet.packet_dst_channel='${dstChannel}' and recv_packet.packet_sequence='${packetSequence}'`
                    },
                })
            )
        }
        wsIbc.onerror = (event) => {
            if(event && event.type === 'error') {
                if(ibcCount < 3) {
                    ibcReconnect(dstChannel, packetSequence, txHash, transferNeedData);
                }
            }
        }
        wsIbc.onclose = () => {
        }
        wsIbc.onmessage = (msg) => {
            let ibcResultData = JSON.parse(msg?.data);
            if(ibcResultData?.result) {
                if(Object.keys(ibcResultData.result)?.length) {
                    clearTimeout(ibcTimer);
                    let ibcStatus = ibcResultData.result?.events && ibcResultData.result?.events['write_acknowledgement.packet_ack'] && JSON.parse(ibcResultData.result?.events['write_acknowledgement.packet_ack'][0])?.result?.toString()?.includes('error')  ? 0 : 1;
                    let ibcTxResult = {
                        result: ibcResultData.result?.data?.value?.TxResult?.result || {},
                        events: ibcResultData.result?.events || {}
                    }
                    let txData = lang.IBCTrasactionText;
                    let type = '';
                    switch(transferNeedData?.type) {
                        case 'deposit': 
                            type = txData.ibcType.deposit;
                            break;
                        case 'withdraw':
                            type = txData.ibcType.withdraw;
                            break;
                    }
                    if(ibcStatus) {
                        let ibcTransferInfos = {
                            img: txData.successfulImg,
                            title: txData.successful,
                            amount: transferNeedData.amount,
                            denom: transferNeedData.denom,
                            type,
                            ibcText: txData.ibcText,
                            ibcLink: `${VUE_APP_IBC_EXPLORER_URL}/transfers/details?hash=${txHash}`
                        }
                        store.commit('transactionResult', ibcTransferInfos);
                    } else {
                        let ibcTransferInfos = {
                            img: txData.failedImg,
                            title: txData.failed,
                            link: `${VUE_APP_IBC_EXPLORER_URL}/transfers/details?hash=${txHash}`,
                            viewonExplorer: txData.viewonExplorer
                        }
                        store.commit('transactionResult', ibcTransferInfos);
                    }
                    let storageTransactions = JSON.parse(localStorage.getItem('transactions')) || []
                    const connectedData = JSON.parse(localStorage.getItem('walletconnect')) || {}
                    const address = connectedData?.accounts[0] || ''
                    if(storageTransactions?.length) {
                        const connectedAddressTxList = storageTransactions.filter(item => item.address === address)
                        if(connectedAddressTxList?.length) {
                            connectedAddressTxList[0] && connectedAddressTxList[0]?.list?.forEach(item => {
                                if(item?.hash === txHash) {
                                    item.ibcStatus = ibcStatus;
                                    item.ibcTxResult = ibcTxResult;
                                    item.packetDstChannel = dstChannel;
                                    item.packetSequence = packetSequence;
                                }
                            })
                            localStorage.setItem('transactions', JSON.stringify(storageTransactions))
                            store.commit('updateTimer', new Date().getTime());
                            wsIbc.close();
                        }
                    }
                } else {
                    ibcTimer = setTimeout(() => {
                        if(!Object.keys(ibcResultData.result)?.length) {
                            wsIbc.close();
                        }
                    }, TARGET_CHAIN_SUBSCRIPTION_TIMEOUT)
                }
            }
        }
    }
    function ibcReconnect(dstChannel, packetSequence, txHash, transferNeedData) {
        ibcCount++;
        ibcWebSocketInit(dstChannel, packetSequence, txHash, transferNeedData);
    }
}

function resetStatus() {
    let storageTransactions = JSON.parse(localStorage.getItem('transactions')) || []
    const connectedData = JSON.parse(localStorage.getItem('walletconnect')) || {}
    const address = connectedData?.accounts[0] || ''
    if(storageTransactions?.length) {
        const currentAddressTransactions = storageTransactions.filter(item => item.address === address)
        if(currentAddressTransactions?.length) {
            currentAddressTransactions[0] && currentAddressTransactions[0]?.list?.forEach(item => {
                item.txStatus = item.txStatus === 'noStatus' ? 0 : item.txStatus;
            })
        }
        localStorage.setItem('transactions', JSON.stringify(storageTransactions))
    }
}