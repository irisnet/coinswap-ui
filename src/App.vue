<template>
  <div
    id="app"
    @click="closeAllTooltip()"
    :style="{
      backgroundImage: isDarkTheme ? `url(${darkImage})` : `url(${lightImage})`
    }"
  >
    <download-keplr-wallet
      v-show="$store.state.downloadKeplr"
    ></download-keplr-wallet>
    <deposit-withdraw-component
      v-show="$store.state.isShowDepositWithdrawTipBox"
    ></deposit-withdraw-component>
    <connect-types v-show="$store.state.walletListMask"></connect-types>
    <notice-component v-show="$store.state.isReadmeNotice"></notice-component>
    <error-tx-component
      v-show="$store.state.isBroadcastTxError"
    ></error-tx-component>
    <token-select-component
      v-show="$store.state.isSelectToken"
    ></token-select-component>
    <confirm-tx-component
      v-if="$store.state.isShowConfirmTxBox"
    ></confirm-tx-component>
    <swap-confirm-tx
      v-if="$store.state.isShowSwapConfirmTxBox"
    ></swap-confirm-tx>
    <add-liquidity-confirm-tx
      v-if="$store.state.isShowAddLiquidityConfirmTxBox"
    ></add-liquidity-confirm-tx>
    <waiting-tx-component
      v-if="$store.state.isWaitingConfirmBox"
    ></waiting-tx-component>
    <farm-stake-input
      v-show="
        $store.state.isShowStakeMask && $store.state.isShowStakeMask.isShow
      "
    ></farm-stake-input>
    <wating-harvest-component
      v-if="$store.state.isShowHarvestWaitingMask"
    ></wating-harvest-component>
    <navigation></navigation>
    <optimize-prompt-component
		:notice="notice"
      v-if="$store.state.isShowOptimizePrompt && notice"
    ></optimize-prompt-component>
 	 <router-view class="router_container" />
    <Footer></Footer>
    <mobile-side-menu-component></mobile-side-menu-component>
  </div>
</template>

<script>
import darkTheme from "./theme/darkTheme";
import lightTheme from "./theme/lightTheme";
import Navigation from "./navigation/Navigation";
import Footer from "./footer/Footer";
import TokenSelectComponent from "./components/TokenSelectComponent";
import ConfirmTxComponent from "./components/ConfirmTxComponent";
import AddLiquidityConfirmTx from "./components/AddLiquidityConfirmTx.vue";
import SwapConfirmTx from "./components/SwapConfirmTx";
import WaitingTxComponent from "./components/WatingTxComponent";
import updateBalance from "./util/updateBalance";
import ErrorTxComponent from "./components/ErrorTxComponent";
import FarmStakeInput from "./farm/component/FarmStakeMask";
import WatingHarvestComponent from "./components/WatingHarvestComponent";
import MobileSideMenuComponent from "./navigation/components/MobileSideMenuComponent";
import NoticeComponent from "./notice/NoticeComponent";
import { syncTx } from "./util/syncTx";
import ConnectTypes from "./components/ConnectTypes";
import DownloadKeplrWallet from "@/components/DownloadKeplr";
import { CHAIN_ID_DEV, CHAIN_ID_QA, CHAIN_ID_TESTNET } from "@/constant";
import DepositWithdrawComponent from "./components/DepositWithdrawComponent";
import { gravityBridgeChain } from "./keplrProductionChain/keplrProductionChain";
import { popUpWindow } from "./util/notifyPopUp";
import OptimizePromptComponent from "@/components/OptimizePromptComponent.vue";
import {getNotice} from "@/server/api";

const {  VUE_APP_CHAINID } = process.env;
export default {
  name: "App",
  components: {
    OptimizePromptComponent,
    DepositWithdrawComponent,
    DownloadKeplrWallet,
    ConnectTypes,
    NoticeComponent,
    MobileSideMenuComponent,
    WatingHarvestComponent,
    FarmStakeInput,
    ErrorTxComponent,
    WaitingTxComponent,
    SwapConfirmTx,
    ConfirmTxComponent,
    TokenSelectComponent,
    Footer,
    Navigation,
    AddLiquidityConfirmTx
  },
  data() {
    return {
      isDarkTheme: false,
      rootDom: document.documentElement,
      darkImage: require("./assets/img/BG_Dark.png"),
      lightImage: require("./assets/img/coinswap_background.png"),
	  notice:''
    };
  },
  async mounted() {
    localStorage.removeItem("transaction");
    localStorage.removeItem("hubList");
    this.changTheme();
	this.getNotices()
    let isHaveKeplrWallet = await this.getKeplr();
    if (isHaveKeplrWallet) {
      switch (VUE_APP_CHAINID) {
        case CHAIN_ID_TESTNET:
          this.setTestPageTitle();
          break;
        case VUE_APP_CHAINID:
          gravityBridgeChain();
          this.setDocumentTitle();
      }
    }
  },
  watch: {
    "$store.state.address"() {
      updateBalance();
      syncTx();
    },
    $route: {
      handler() {
        const defaultSelectToken = this.$store.state.tokenList.filter(
          item => item.isBaseToken
        );
        this.$store.commit("selectedFromToken", defaultSelectToken[0]);
        this.$store.state.tokenList.map(item => {
          item.isTo = false;
          item.isFrom = false;
          if (item.isBaseToken) item.isFrom = true;
          return item;
        });
      },
      deep: true
    },
    "$store.state.transactionResult": {
      handler(newResult) {
        popUpWindow(this, newResult);
      },
      deep: true
    }
  },
  methods: {
    setDocumentTitle() {
      document.title = this.$t("pageTitle");
      const headerFavicon = require("../public/favicon.png");
      const linkTag = document.createElement("link");
      linkTag.href = headerFavicon;
      linkTag.rel = "icon";
      document.head.appendChild(linkTag);
    },
    setTestPageTitle() {
      document.title = this.$t("testnetPageTitle");
      const headerFavicon = require("../public/coinswap_tag_stage.png");
      const linkTag = document.createElement("link");
      linkTag.href = headerFavicon;
      linkTag.rel = "icon";
      document.head.appendChild(linkTag);
    },
    closeAllTooltip() {
      this.$store.commit("isShowLinkContent", false);
      this.$store.commit("closedAddressCard", false);
      this.$store.commit("isShowSetting", false);
    },
	  async getNotices() {
		const notice = await getNotice()
		  if(notice?.notice){
			  this.notice = notice?.notice
			  const isShowOptimizePrompt =  sessionStorage.getItem('isShowOptimizePrompt') ? JSON.parse(sessionStorage.getItem('isShowOptimizePrompt')) : true
			  this.$store.commit('isShowOptimizePrompt',isShowOptimizePrompt)
		  }
	  },
    changTheme() {
      if (this.isDarkTheme) {
        for (const darkThemeKey in darkTheme) {
          this.rootDom.style.setProperty(darkThemeKey, darkTheme[darkThemeKey]);
        }
      } else {
        for (const lightThemeKey in lightTheme) {
          this.rootDom.style.setProperty(
            lightThemeKey,
            lightTheme[lightThemeKey]
          );
        }
      }
    },
    async getKeplr() {
      if (window.keplr) {
        return window.keplr;
      }

      if (document.readyState === "complete") {
        return window.keplr;
      }

      return new Promise(resolve => {
        const documentStateChange = event => {
          if (event.target && event.target.readyState === "complete") {
            resolve(window.keplr);
            document.removeEventListener(
              "readystatechange",
              documentStateChange
            );
          }
        };

        document.addEventListener("readystatechange", documentStateChange);
      });
    }
  }
};
</script>

<style lang="scss">
@import "./resetCss/reset.scss";

#app {
  width: 100%;
  height: 100%;
  font-family: Arial, "Microsoft YaHei", "PingFang SC", "sans-serif";
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-position: center center;
  background-size: cover;
  position: relative;
  /*user-select: none;*/
  overflow: auto;

  .router_container {
    flex: 1;
    height: 100%;
    overflow-y: auto;
  }
}

html {
  width: 100%;
  height: 100%;
  font-size: 625% !important;
}

body {
  width: 100%;
  height: 100%;
  font-size: 16px !important;

  .el-notification {
    padding: 0.16rem 0.16rem 0.16rem 0.18rem !important;
    width: 3.6rem !important;
    overflow: visible;

    .el-notification__group {
      margin-left: 0;
      margin-right: 0;

      .el-notification__content {
        margin: 0;

        .notify_container {
          display: flex;
          align-items: center;

          .img_content {
            width: 0.58rem;
            height: 0.62rem;
            margin-right: 0.16rem;

            img {
              height: 100%;
            }
          }

          .content_right {
            .content_title {
              font-size: 20px;
              color: #0c0f20;
              line-height: 20px;
            }

            .content_link {
              display: flex;
              align-items: center;
              margin-top: 0.08rem;
              font-size: 16px;
              color: rgba(12, 15, 32, 0.65);
              line-height: 24px;
              text-align: left;

              .in_explorer {
                display: flex;
                align-items: center;
                color: rgba(12, 15, 32, 0.65);

                &:hover {
                  color: #7194ff;
                }

                .iconfont {
                  margin-left: 0.04rem;
                  font-size: 10px;
                  color: #7194ff;
                }
              }

              .in_ibc_explorer {
                color: rgba(12, 15, 32, 0.65);

                &:hover {
                  color: #7194ff;
                }
              }
            }
          }
        }
      }

      .el-notification__closeBtn {
        box-sizing: border-box;
        padding: 5px;
        top: -5px;
        left: -5px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        background: #fff;
        border: 1px solid rgba(112, 147, 255, 0.21);
        border-radius: 50%;

        &::before {
          color: #7194ff;
          font-size: 10px;
        }
      }
    }
  }
}

.el-message {
  min-width: 240px !important;
  border-radius: var(--borderRadius8) !important;
}

.el-message--error {
  background: var(--bgWhiteColor) !important;
  border-color: var(--bgWhiteColor) !important;
}

.el-message--error .el-message__content {
  color: var(--fontColorBlack) !important;
}

.el-tabs {
  z-index: 0;

  .el-tabs__header {
    .el-tabs__nav-wrap {
      &::after {
        background-color: rgba(255, 255, 255, 1) !important;
      }
    }
  }
}

.el-table .descending .sort-caret.descending {
  border-top-color: var(--btnColor) !important;
}

.el-table .ascending .sort-caret.ascending {
  border-bottom-color: var(--btnColor) !important;
}

.el-table__body-wrapper {
  overflow: visible !important;
}

.__rail-is-horizontal {
  z-index: 0 !important;
}

.el-table::before {
  z-index: 0 !important;
}

.el-table .sort-caret.ascending {
  border-bottom-color: var(--tooltipBoxBorderColor) !important;
}

.el-table .sort-caret.descending {
  border-top-color: var(--tooltipBoxBorderColor) !important;
}

.el-table td {
  padding: 0.17rem 0 !important;
}

.el-table td,
.el-table th.is-leaf {
  border-bottom: 0.01rem solid rgba(112, 147, 255, 0.2) !important;
}
</style>