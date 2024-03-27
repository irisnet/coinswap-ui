import store from '../vuex'
export const showBroadcasting = (data) => {
    const broadcasting = {
        img: data.img,
        title: data.title,
        text: data.text
    }
    store.commit('transactionResult', broadcasting)
}
export const popUpWindow = (vue, data) => {
    vue.$notify.closeAll();
    const h = vue.$createElement;
    vue.$notify({
        message: h('div', {class: 'notify_container'}, [
            h('div', {class: 'img_content'}, [
                h('img', {attrs: {src: `${data.img}`}})
            ]),
            h('div', {class: 'content_right'}, [
                h('p', {class: 'content_title'}, `${data.title}`),
                h('p', {class: 'content_link'}, [
                    h('span', {style: {display: `${data.text ? 'block' : 'none'}`}}, `${data.text}`),
                    h('a', {attrs: { href: `${data.link}`, target: '_blank',rel: 'noreferrer noopener'}, class: 'in_explorer', style: {display: `${data.link ? 'block' : 'none'}`}}, [
                        h('span', null, data.viewonExplorer),
                        h('i',{class: 'iconfont icon-tiaozhuan1'})
                    ]),
                    h('a', {attrs: {href: `${data.ibcLink}`, target: '_blank', rel: 'noreferrer no'}, class: 'in_ibc_explorer', style: {display: `${data.amount ? 'block' : 'none'}`}}, `${data.amount} ${data.denom} ${data.ibcText} ${data.type}`)
                ])
            ])
        ]),
        duration: 7000,
        offset: 30
    });
}