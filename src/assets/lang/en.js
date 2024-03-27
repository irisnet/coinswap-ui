export default {
    pageTitle:'Coinswap Market',
    testnetPageTitle:'Testnet - Coinswap Market',
    navigation: {
        leftList: [
            {
                name: 'Coins',
                path: '/home',
                isActive: true,
            },
            {
                name: 'Swap',
                path: '/coinswap',
                isActive: false,
            },
            {
                name: 'Pools',
                path: '/pool',
                isActive: false,
            },
            {
                name: 'Farms',
                path: '/farm',
                isActive: false,
            }
        ],
        externalLink: [
            {
                name:'Stake',
                href: 'https://wallet.keplr.app/#/irishub/stake',
                iconName: 'icon-tiaozhuan',
                isExternalLink:true,
            },
            {
                name:'Vote',
                href: 'https://wallet.keplr.app/#/irishub/governance',
                iconName: 'icon-tiaozhuan',
                isExternalLink:true,
            },
            {
                name: 'Stats',
                href: '/overview',
                iconName: 'icon-tiaozhuan'
            }
        ],
        walletConnect: 'Connect wallet',
        copyQRCode: 'Copy the QR Code',
        copySuccess: 'Copied!',
        linkList: [
            
            {
                label: 'Code',
                href: 'https://github.com/irisnet/irismod/tree/main/modules/coinswap'
            }
        ]
    },
    notice: {
        title: 'Disclaimer',
        content1: 'Coinswap is a decentralized peer-to-peer protocol that people can use to create liquidity and trade Cosmos-SDK based tokens. The Coinswap protocol is made up of free, public, and open-source software. Your use of Coinswap protocol involves various risks, including, but not limited, to losses while digital assets are being supplied to Coinswap protocol pools and losses due to the fluctuation of prices of tokens in a trading pair or liquidity pool, including Impermanence Loss. Before using any pool on the Coinswap protocol, you should review the relevant documentation to make sure you understand how Coinswap protocol works, and the pool you use on Coinswap protocol works. Additionally, just as you can access email protocols, such as SMTP, through multiple email clients, you can access pools on Coinswap protocol through several web or mobile interfaces. You are responsible for doing your own diligence on those interfaces to understand the fees and risks they present.',
        content2: 'AS DESCRIBED IN THE COINSWAP PROTOCOL LICENSES, THE COINSWAP PROTOCOL IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. Coinswap protocol development teams do not provide, own, or control the Coinswap protocol, which is run by a decentralized validator set. Upgrades and modifications to the protocol are managed in a community-driven way by holders of the IRIS governance token. No developer or entity involved in creating the Coinswap protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Coinswap protocol, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.',
        content3: 'And the Coinswap protocol is not being offered in China or to Chinese persons. The Coinswap protocol is not available to people or companies who are residents of, located, incorporated or have a registered agent in China. People or companies in restricted jurisdictions or embargoed by China are also prohibited from using the Coinswap protocol. Use of a virtual private network to circumvent the restrictions is also prohibited.',
        checkBoxContent: 'By checking this box, I acknowledge that I have read, and do hereby accept the terms and conditions contained in this disclaimer.',
        declineBtnLabel:'Decline',
        agreeBtnLabel:'Agree'
    },
    home: {
        balance: {
            title: 'Your Total Balance',
            locked: 'Locked'
        },
        tvl: {
            title: 'Total Value Locked(TVL)',
            footer: 'Across all LPs and Pools'
        }
    },
    swapPoolNavigation: [
        {
            label: 'Swap',
            path: '/coinswap'
        },
        {
            label: 'Pool',
            path: '/pool'
        }
    ],
    footer: [
        {
            label: 'Twitter',
            href: 'https://twitter.com/irisnetwork',
            iconName: 'icon-tuite'
        },
        {
            label: 'Telegram',
            href: 'https://t.me/irisnetwork',
            iconName: 'icon-Telegram'
        },
        {
            label: 'Discord',
            href: 'https://discord.gg/zmUYJnevvZ',
            iconName: 'icon-Discord'
        },
        {
            label: 'Medium',
            href: 'https://medium.com/irisnet-blog',
            iconName: 'icon-Medium'
        },
    ],
    pool: {
        textTop: "Add liquidity to receive LP token",
        addLiquidity: "Add Liquidity",
        yourLiquidity: "Your Liquidity",
        yourLiquidityTip: "When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below.",
        unconnectedText: "Connect to a wallet to view your liquidity.",
        connectedFarmLinkText: "Check your staked LP tokens in ",
        connectedFarmLinkLabel: 'Farms.',
        connectedText: "No liquidity found.",
        yourPoolTokens: "Your pool tokens",
        yourPoolShare: "Your pool share",
        removeButton: "Remove",
        add: {
            title: 'Add Liquidity',
            addLiquiditytip: "When you add liquidity, you are given pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.",
            priceAndPoolShare: 'Price and pool share',
            per: 'per',
            shareOfPool: "Share of Pool",
            yourPosition: "Your Position",
            supply: "Supply",
            errortip1: "Insufficient IRIS balance",
            errortip2: "Invalid pair",
            earn: 'Earn'
        },
        remove: {
            title: "Remove Liquidity",
            removeLiquiditytip: "Removing pool tokens converts your position back into underlying tokens at the current rate, proportional to your share of the pool. Accrued fees are included in the amounts you receive.",
            amount: "Amount",
            price: "Price",
            confirm: {
                title: 'You will receive',
                textTooltip: 'Output is estimated. If the price changes by more than n% your transaction will revert.'
            }
        },
        addLiquidityConfirm: {
            button: "Confirm Supply",
            poolTokens: "Pool Tokens",
            copywriting: "Output is estimated. If the price changes by more than n% your transaction will revert.",
            deposited: "Deposited",
            rates: "Rates",
            shareOfPool: "Share of Pool"
        }
    },
    swapButton: 'Coinswap IRIS',
    defaultSelectedToken: 'Select a token',
    swapInputFrom: {
        title: 'From',
        estimated: '(estimated)',
        balance: 'Balance'
    },
    swapInputTo: {
        title: 'To',
        estimated: '(estimated)',
        balance: 'Balance'
    },
    swap: 'Coinswap',
    txTooltip: {
        minReceived: 'Minimum Received',
        minReceivedTip: 'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
        maxSold: 'Maximum Sold',
        maxSoldTip: 'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
        priceImpact: 'Price Impact',
        priceImpactTip: 'The difference between the market price and your price due to trade size.',
        liquidityProviderFee: 'Liquidity Provider Fee',
        liquidityProviderFeeTip: 'A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.',
        swapRoute: 'Route',
        swapRouteTip: 'Routing through these tokens resulted in the best price for your trade.'
    },
    transactionSlippageSetting: {
        title: 'Transaction Settings',
        settingTip: 'Your transaction will revert if the price changes unfavorably by more than this percentage.',
        slippageTolerance: 'Slippage Tolerance',
        warningTxFailed: 'Your transaction may fail',
        warningTxFrontrun: 'Your transaction may be frontrun',
        warningTxPercentage: 'Enter a valid slippage percentage'
    },
    price: {
        title: 'Price',
        per: 'per'
    },
    poolToInput: {
        title: 'Input',
        balance: 'Balance'
    },
    poolFromInput: {
        title: 'Input',
        balance: 'Balance'
    },
    addLiquidityConfirm: {
        title: 'You will receive',
    },
    addressDetailCard: {
        title: 'Account',
        connectWallet: 'Connected with WalletConnect',
        disConnect: "Disconnect",
        viewExplorer: 'View on Explorer',
        transactionTitleTip: "Your transactions will appear here…",
        recentTransaction: 'Recent Transactions',
        clearAll: 'Clear all'
    },
    transactionErrorTipBox: {
        title: 'Waiting For Confirmation',
        text: 'Confirm this transaction in your wallet',
    },
    walletConnectQRCodeBox: {
        title: 'WalletConnect',
        description: "Scan the QR code with Rainbow wallet",
        supportedWallet: 'Supported wallet '
    },
    swapConfirmTxBox: {
        title: 'Confirm Coinswap',
        priceUpdate: 'Price Updated',
        accept: 'Accept'
    },
    TokenListBox: {
        title: 'Select a token',
        tip: 'When you add liquidity, you are given pool tokens that represent your share. If you don\'t see a pool you joined in this list, try importing a pool below.',
        tokenName: 'Token Name',
    },
    harvestWaitingTxBox: {
        title: 'Waiting For Confirmation',
        text: 'Confirm this transaction in your wallet'
    },
    waitingTxBox: {
        title: 'Waiting For Confirmation',
        text: 'Confirm this transaction in your wallet'
    },
    farm: {
        baseDetail: {
            farmTip: 'The multiplier represents the amount of IRIS rewards each farm gets.For example, if a 1x farm was getting 1 IRIS per block, a 3x farm would be getting 3 IRIS per block.',
            apyTip: 'APY stands for annual percentage yield, which is compounded daily and calculated according to current on-chain data. On-chain data is in flux and therefore the provided rates are estimated for reference only, which don\'t represent a guaranteed return.',

        },
        harvestCard: {
            title: 'Earned'
        },
        navigation: {
            title: 'Farms',
            subTitle: 'Stake Liquidity Pool (LP) tokens to earn.'
        },
        stakedCard: {
            lpTokenTitle: 'LPT Staked',
            lpBalanceLabel: 'LPT Available',
            stake: 'Stake',
            unstake: 'Unstake'
        },
        maskBox: {
            stake: 'Stake',
            unstake: 'Unstake',
            lpTokens: 'LP Tokens',
            available: 'Available',
            lp: 'LP',
            confirm: 'Confirm'
        }
    },
    errorPage:{
        403:{
            content:'FORBIDDEN',
            tip:'Request forbidden by administrative rules.'
        },
        404:{
            content:'PAGE NOT FOUND!',
            tip:'We‘re not able to find what you were looking for.'
        }
    },
    downloadKeplr:{
        title:'Please Install & Turn on the Keplr browser extension to start using Keplr.',
        installLabel:'Install for Chrome',
        closeLabel:'Let me look around',
        please:'Please',
        refresh:'refresh',
        refreshText:'the page after confirming the Keplr status.'
    },
    broadCasting: {
        title: 'Transaction Broadcasting',
        text: 'Waiting for transaction to be included in the block',
        img: require('../../../public/icon/broadcasting.png'),
    },
    transactionText: {
        successful: 'Transaction Successful',
        successfulImg: require('../../../public/icon/successful_normal.png'),
        failed: 'Transaction Failed',
        failedImg: require('../../../public/icon/failed_normal.png'),
        viewonExplorer: 'View Explorer'
    },
    IBCTrasactionText: {
        successful: 'IBC Transfer Successful',
        successfulImg: require('../../../public/icon/successful_ibc.png'),
        failed: 'IBC Transfer Failed',
        failedImg: require('../../../public/icon/failed_ibc.png'),
        viewonExplorer: 'View Explorer',
        ibcText: 'has been successfully',
        ibcType: {
            deposit: 'deposited',
            withdraw: 'withdrawn'
        }
    }
}
