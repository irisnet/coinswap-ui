<template>
    <div class="footer_container" v-if="$store.state.isHideHeaderAndFooter">
        <ul class="footer_content_list_wrap">
            <li class="footer_content_item_content"
                v-for="(item,index) in footerList"
                :key="index">
                <a class="footer_item_link"
                   :href="item.href"
                   target="_blank"
                   rel="noreferrer noopener">{{ item.label }}</a>
            </li>
        </ul>
        <div class="mobile_container">
            <div class="mobile_content_wrap">
                <div class="mobile_left_content">
                    <div class="address_detail_content">
                        <address-detail v-if="$store.state.addressCardIsClosed"></address-detail>
                    </div>
                </div>
                <div class="mobile_right_content">
                    <div class="mobile_iconfont_content" @click.stop="showLink">
                        <iconfont-component v-show="!isShowLink" icon-name="icon-qita"></iconfont-component>
                        <iconfont-component v-show="isShowLink" icon-name="icon-xuanzhong"></iconfont-component>
                    </div>
                    <ul class="link_list_content" v-show="isShowLink">
                        <li class="link_item_content"
                            v-for="(item,index) in linkList"
                            :key="index">
                            <a :href="item.href"
                               rel="noreferrer noopener"
                               target="_blank"
                               class="link_item"
                               @click="closeMenu">{{ item.label }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import IconfontComponent from "../components/IconfontComponent";
import AddressDetail from "../components/AddressDetail";

export default {
    name: "Footer",
    components: {AddressDetail, IconfontComponent},
    data () {
        return {
            isShowLink: false
        }
    },
    mounted () {
        document.onclick = () => {
            this.isShowLink = false
        }
    },
    methods: {
        showLink () {
            this.isShowLink = !this.isShowLink
        },
        closeMenu () {
            this.isShowLink = false
        }

    },
    computed: {
        footerList () {
            return this['_i18n'].messages[this['_i18n'].locale].footer
        },
        linkList () {
            return this['_i18n'].messages[this['_i18n'].locale].navigation.linkList
        }
    }
}
</script>

<style scoped lang="scss">
.footer_container {
    width: 100%;
    position: absolute;
    bottom: 0;
    background: var(--footerBgColor);

    .footer_content_list_wrap {
        max-width: 12rem;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        @media (max-width: 820px) {
            display: none;
        }

        .footer_content_item_content {
            padding: var(--boxPadding16) 0;
            margin-right: 0.4rem;

            .footer_item_link {
                color: var(--fontColorBlack65);

                &:hover {
                    color: var(--hoverColor)
                }
            }
        }

        .footer_content_item_content:last-child {
            margin-right: 0;
        }
    }

    .mobile_container {
        display: none;
        background: var(--bgWhiteColor);
        @media (max-width: 820px) {
            display: block;
        }

        .mobile_content_wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 0.6rem;

            .mobile_left_content {
                flex: 1;
                margin-left: 0.16rem;
                max-width: 2.4rem;

                .address_detail_content {
                    position: absolute;
                    left: 0.16rem;
                    bottom: 0.64rem;
                    @media (max-width: 375px) {
                        margin-right: 0.16rem;
                    }
                }
            }

            .mobile_right_content {
                position: relative;

                .mobile_iconfont_content {
                    width: 0.32rem;
                    height: 0.32rem;
                    margin-right: 0.16rem;
                }

                .link_list_content {
                    background: var(--bgWhiteColor);
                    position: absolute;
                    right: 0.16rem;
                    z-index: 0;
                    bottom: 0.6rem;
                    border-radius: var(--borderRadius8);
                    box-sizing: border-box;
                    padding: var(--boxPadding16);
                    width: 1.36rem;
                    box-shadow: 0 0 0.08rem 0 rgba(0, 0, 0, 0.1);

                    .link_item_content {
                        padding: 0.08rem;

                        .link_item {
                            font-size: var(--fontSize16);
                            line-height: var(--lineHeight20);
                            color: var(--fontColorBlack65);

                            &:active {
                                color: var(--btnColor);
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
