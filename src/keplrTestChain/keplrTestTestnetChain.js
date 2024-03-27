import {CHAIN_ID_TESTNET} from "@/constant";
const {VUE_APP_NODE} = process.env
export async function  testTestnetChain(){
    if(window?.keplr?.experimentalSuggestChain){
        try {
            await window.keplr.experimentalSuggestChain({
                chainId:CHAIN_ID_TESTNET,
                chainName:'nyancat',
                rpc:VUE_APP_NODE,
                rest:'https://lcd.nyancat.irisnet.org/',
                stakeCurrency:{
                    coinDenom:'NYAN',
                    coinMinimalDenom:'unyan',
                    coinDecimals:6
                },
                bip44:{
                    coinType: 118,
                },
                bech32Config:{
                    bech32PrefixAccAddr: "iaa",
                    bech32PrefixAccPub: "iaapub",
                    bech32PrefixValAddr: "iaavaloper",
                    bech32PrefixValPub: "iaavaloperpub",
                    bech32PrefixConsAddr: "iaavalcons",
                    bech32PrefixConsPub: "iaavalconspub"
                },
                currencies:[
                    {
                        coinDenom: "NYAN",
                        coinMinimalDenom: "unyan",
                        coinDecimals:6
                    }
                ],
                feeCurrencies:[
                    {
                        coinDenom: "NYAN",
                        coinMinimalDenom: "unyan",
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