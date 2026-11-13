# RealDev on the VDS: build the Worker bundle, then run it under Node behind the shared Caddy proxy.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
# Grade a reference solution through the same .wasm import path the server uses, so a broken runner fails the build.
RUN node --import ./deploy/vds/register.mjs --input-type=module -e "const r=await import('./sandbox/runtime.mjs');const m=await import('./dist/server/quickjs.wasm');r.setQuickJSWasmModule(async()=>m.default);const x=await r.execute('function solve(numbers){return numbers.filter(n=>n>0).reduce((s,n)=>s+n,0)}','sum-positive');if(!x.total||x.passed!==x.total){console.error(x);process.exit(1)}console.log('quickjs ok',x.passed+'/'+x.total)"

FROM node:24-alpine
ENV NODE_ENV=production PORT=8080 REALDEV_DB_FILE=/data/realdev.sqlite
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts/local-db.mjs ./scripts/local-db.mjs
COPY --from=build /app/deploy/vds/server.mjs /app/deploy/vds/register.mjs /app/deploy/vds/wasm-loader.mjs ./deploy/vds/
RUN echo '{"type":"module"}' > package.json && mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node","--import","./deploy/vds/register.mjs","deploy/vds/server.mjs"]
