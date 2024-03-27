FROM node:16.15-alpine3.15 as builder
WORKDIR /app
COPY . .
ARG ENVIRONMENT=null
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && apk add make git \
    && yarn install --registry http://registry.npmmirror.com  \
    && yarn run build:$ENVIRONMENT \
    &&  yarn cache clean
FROM nginx:1.20-alpine
COPY --from=builder /app/dist/ /usr/share/nginx/html/
RUN echo -e 'server {\n\
    location / {\n\
        root   /usr/share/nginx/html;\n\
        index  index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~ ^/api/(.*)$ {\n\
    resolver kube-dns.kube-system valid=5s;\n\
    proxy_pass http://dapp-server.coinswap.svc.cluster.local:8080/$1$is_args$args;\n\
    }\n\
}' >/etc/nginx/conf.d/default.conf
