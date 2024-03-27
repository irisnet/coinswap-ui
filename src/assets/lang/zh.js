export default {
	pageTitle:'Coinswap Market',
	testnetPageTitle:'Testnet - Coinswap Market',
	navigation: {
		leftList: [
			{
				name: 'Home',
				path: '/home',
				isActive: true,
			},
			{
				name: 'Coinswap',
				path: '/coinswap',
				isActive: false,
			},
			{
				name: 'Pool',
				path: '/pool',
				isActive: false,
			},
			{
				name: 'Farm',
				path: '/farm',
				isActive: false,
			}
		],
		walletConnect: 'Connect to a wallet',
		copyQRCode:'Copy the QR Code',
		linkList: [
			{
				label: 'Code',
				href: 'https://github.com/irisnet/irismod/tree/main/modules/coinswap'
			}
		]
	},
	home: {
		balance: {
			title: 'Your IRIS Balance',
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
		connectedText: "No liquidity found",
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
	swap:'Coinswap',
	txTooltip: {
		minReceived: 'Minimum Received',
		minReceivedTip: 'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
		maxSold: 'Maximum Sold',
		maxSoldTip: 'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
		priceImpact: 'Price Impact',
		priceImpactTip: 'The difference between the market price and your price due to trade size.',
		liquidityProviderFee: 'Liquidity Provider Fee',
		liquidityProviderFeeTip: 'A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.'
	},
	transactionSlippageSetting:{
		title:'Transaction Settings',
		settingTip:'Your transaction will revert if the price changes unfavorably by more than this percentage.',
		slippageTolerance:'Slippage Tolerance',
		warningTxFailed: 'Your transaction may fail',
		warningTxFrontrun:'Your transaction may be frontrun',
		warningTxPercentage:'Enter a valid slippage percentage'
	},
	price:{
		title:'Price',
		per:'per'
	},
	poolToInput:{
		title:'Input',
		balance:'Balance'
	},
	poolFromInput:{
		title:'Input',
		balance:'Balance'
	},
	addLiquidityConfirm:{
		title:'You will receive',
	},
	addressDetailCard:{
		title:'Account',
		connectWallet:'Connected with WalletConnect',
		disConnect:"Disconnect",
		viewExplorer:'View on Explorer',
		transactionTitleTip:"Your transactions will appear here…",
		recentTransaction:'Recent Transactions',
		clearAll:'Clear all'
	},
	transactionErrorTipBox:{
		title:'Waiting For Confirmation',
		text:'Confirm this transaction in your wallet',
	},
	walletConnectQRCodeBox:{
		title:'WalletConnect',
		description:"Scan the QR code with Rainbow wallet",
		supportedWallet:'Supported wallet '
	},
	swapConfirmTxBox:{
		title:'Confirm Coinswap',
		priceUpdate:'Price Updated',
		accept:'Accept'
	},
	TokenListBox:{
		title:'Select a token',
		tip:'When you add liquidity, you are given pool tokens that represent your share. If you don\'t see a pool you joined in this list, try importing a pool below.',
		tokenName:'Token Name',
	},
	harvestWaitingTxBox:{
		title:'Waiting For Confirmation',
		text:'Confirm this transaction in your wallet'
	},
	waitingTxBox:{
		title:'Waiting For Confirmation',
		text:'Confirm this transaction in your wallet'
	},
	farm:{
		baseDetail:{
			farmTip:'The multiplier represents the amount of IRIS rewards each farm gets.For example, if a 1x farm was getting 1 IRIS per block, a 3x farm would be getting 3 IRIS per block.',
			apyTip:'Annual percentage yield of this farming pool.',
		},
		harvestCard:{
			title:'IRIS Earned'
		},
		navigation:{
			title:'Farms',
			subTitle:'Stake Liquidity Pool (LP) tokens to earn.'
		},
		stakedCard:{
			lpTokenTitle:'LPT Staked',
			lpBalanceLabel:'LPT Available',
			stake:'Stake',
			unstake:'Unstake'
		},
		maskBox:{
			stake:'Stake',
			unstake:'Unstake',
			lpTokens:'LP Tokens',
			available:'Available',
			lp:'LP',
			confirm:'Confirm'
		}
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
