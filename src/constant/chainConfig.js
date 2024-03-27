export const chainConfig = [
    {
        node:'https://rpc.cosmoshub-4.rainbow.one/',
        network: Number(0),
        chainId: "cosmoshub-4",
        webSocketUrl: 'wss://rpc-cosmoshub.keplr.app/websocket',
        gas: '130000',
        fee:{
            denom:'uatom',
            amount:'12000'
        },
    },
    {
        node:'https://rpc.irishub-1.rainbow.one',
        network: Number(0),
        chainId: "irishub-1",
        webSocketUrl: 'wss://rpc-iris.keplr.app/websocket',
        gas: '300000',
        fee:{
            denom:'uiris',
            amount:'40000'
        },
    },
    {
        node:'https://rpc.gb.coinswap.market',
        network: Number(0),
        chainId: "gravity-bridge-3",
        webSocketUrl: 'wss://gravitychain.io:26657/websocket',
        gas: '200000',
        fee:{
            denom:'ugraviton',
            amount:'3600'
        },
    },
    {
        node:'https://rpc.iov.coinswap.market',
        network: Number(0),
        chainId: "iov-mainnet-ibc",
        webSocketUrl: 'wss://rpc-iov.keplr.app/websocket',
        gas: '200000',
        fee:{
            denom:'uiov',
            amount:'3600'
        },
    },
    {
        node:'https://rpc.nyancat.irisnet.org',
        network: Number(1),
        chainId: "irishub-ibc",
        webSocketUrl: 'wss://rpc.nyancat.irisnet.org/websocket',
        gas: '400000',
        fee:{
            denom:'uiris',
            amount:'80000'
        },
    },
    {
        node: 'https://rpc.nyancat.rainbow.one/',
        network: Number(0),
        chainId: "nyancat-9",
        webSocketUrl: 'wss://rpc.nyancat.rainbow.one/websocket',
        gas: '400000',
        fee: {
            denom: 'unyan',
            amount: '80000'
        },
    },
]
