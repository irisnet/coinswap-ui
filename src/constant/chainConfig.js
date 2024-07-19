export const chainConfig = [
    {
        node:'https://cosmos-rpc.polkachu.com',
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
        node:'https://rpc-iris.keplr.app',
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
        node:'https://gravity-rpc.polkachu.com',
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
        node:'https://rpc.nyancat.irisnet.org',
        network: Number(0),
        chainId: "nyancat-9",
        webSocketUrl: 'wss://rpc.nyancat.irisnet.org/websocket',
        gas: '400000',
        fee:{
            denom:'unyan',
            amount:'80000'
        },
    }
]
