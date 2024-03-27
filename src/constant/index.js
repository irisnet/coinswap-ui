export const decimalNum = 6
const {VUE_APP_FEE,VUE_APP_GAS,VUE_APP_NODE,VUE_APP_CHAINID,VUE_APP_NETWORK,VUE_APP_TIME_OUT} = process.env

export const fee = JSON.parse(VUE_APP_FEE)

export const gas = VUE_APP_GAS

export const node = VUE_APP_NODE

export const chainId = VUE_APP_CHAINID

export const network = VUE_APP_NETWORK

export const liquidityTaskTime = Number(VUE_APP_TIME_OUT) || 6 * 1000

export const farmRewardDenom  = {
	uiris: 'IRIS'
}

export const irisAmount = '100000'

export const irisTxDenom = JSON.parse(VUE_APP_FEE)?.denom || ''

export const harvestTxMemo  = 'harvest'

export const stakeTxMemo = 'stake'

export const unStakeTxMemo = 'unstake'

export const HEALTH_CHECK_RATE = 10000;
export const HEALTH_CHECK_TIMEOUT = 20000;

export const MAX_DISPLAY_LPT_AVAILABLE = 13;

export const WALLET_CONNECT_SUBSCRIBE_METHOD = {
    TX_SIGN:'tx_sign',
    HEALTH_CHECK:'health_check',
}
export const TRANSFER = 'transfer'
export const TX_EVENTS_ATTRIBUTES_AMOUNT = 'amount'
export const SWAP_ORDER = 'swap_order'
export const ADD_LIQUIDITY = 'add_liquidity'
export const REMOVE_LIQUIDITY = 'remove_liquidity'
export const EVENT_REMOVE_LIQUIDITY_TOKEN_PAIR = 'token_pair'
export const KEPLR_WALLET = 'Keplr'
export const WALLET_CONNECT_WALLET = 'WalletConnect'
export const IBC_TRANSFER = 'transfer'
export const FARM_STAKE = 'stake'
export const FARM_UNSTAKE ='unstake'
export const FARM_HARVEST = 'harvest'

export const CHAIN_ID_DEV = 'iris'
export const CHAIN_ID_QA = 'irishub-qa'
export const CHAIN_ID_QA_COSMOS = 'bigbang'
export const CHAIN_ID_IBC_NODE = 'ibcnode'
export const CHAIN_ID_TESTNET = 'nyancat-9'
export const CHAIN_ID_IBC_TESTNET = 'irishub-ibc'
export const CHAIN_ID_IBC_TESTNET_COSMOS = 'stargate-final'
export const GRAVITY_BRIDEG_CHAIN = 'gravity-bridge-3'
export const MAX_NUMBER_LENGTH = 8

export const txType = {
    'irismod.coinswap.MsgSwapOrder': 'swap_order',
    'irismod.coinswap.MsgAddLiquidity': 'add_liquidity',
    'irismod.coinswap.MsgRemoveLiquidity': 'remove_liquidity',
    'irismod.farm.MsgStake': 'stake',
    'irismod.farm.MsgUnstake': 'unstake',
    'irismod.farm.MsgHarvest': 'harvest',
    'ibc.applications.transfer.v1.MsgTransfer': 'transfer',
}
import lang from '../assets/lang/en'
export const BROADCASTING = lang.broadCasting;
export const ORIGINAL_CHAIN_SUBSCRIPTION_TIMEOUT = 60000;
export const TARGET_CHAIN_SUBSCRIPTION_TIMEOUT = 180000;
export const insufficientFee ={
    img:lang.transactionText.failedImg,
    title:'Error',
    text:'Insufficient network fee'
}
export const MAX_STROAGE_LIST_LENGTH = 50;

export const mintscanRoute = {
    'irishub-1': 'iris',
    'cosmoshub-4': 'cosmos',
    'gravity-bridge-3': 'gravity-bridge',
    'bigbang': 'cosmos',
    'irishub-qa': 'iris',
    'ibcnode': 'iris',
    'irishub-ibc': 'iris',
    'stargate-final': 'cosmos',
    'nyancat-9': 'iris',
    'iris': 'iris',
    'iov-mainnet-ibc':'starname'
}
