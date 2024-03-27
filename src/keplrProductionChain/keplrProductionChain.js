import { GRAVITY_BRIDEG_CHAIN} from "../constant";
export async function  gravityBridgeChain(){
    if(window?.keplr?.experimentalSuggestChain){
        try {
            await window.keplr.experimentalSuggestChain({
                chainId:GRAVITY_BRIDEG_CHAIN,
                chainName:'Gravity Bridge',
                rpc: 'https://gravitychain.io:26657',
                rest:'https://gravitychain.io:1317',
                stakeCurrency:{
                    coinDenom:'GRAVITON',
                    coinMinimalDenom:'ugraviton',
                    coinDecimals:6
                },
                bip44:{
                    coinType: 118,
                },
                bech32Config:{
                    bech32PrefixAccAddr: "gravity",
                    bech32PrefixAccPub: "gravitypub",
                    bech32PrefixValAddr: "gravityvaloper",
                    bech32PrefixValPub: "gravityvaloperpub",
                    bech32PrefixConsAddr: "gravityvalcons",
                    bech32PrefixConsPub: "gravityvalconspub"
                },
                currencies:[
                    {
                        coinDenom: "GRAVITON",
                        coinMinimalDenom: "ugraviton",
                        coinDecimals:6
                    }
                ],
                feeCurrencies:[
                    {
                        coinDenom: "GRAVITON",
                        coinMinimalDenom: "ugraviton",
                        coinDecimals:6
                    }
                ],
                coinType: 118,
                gasPriceStep: {
                    low:1,
                    average: 2,
                    high: 3
                }
            })
        }catch (e) {
            alert("Failed to suggest the chain");
        }
    }else {
        alert("Please use the recent version of keplr extension");
    }
}