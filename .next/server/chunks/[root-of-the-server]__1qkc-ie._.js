module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},88942,e=>{"use strict";var t=e.i(37709);e.s(["default",()=>t.Anthropic])},24990,e=>{"use strict";var t=e.i(47909),r=e.i(74017),s=e.i(96250),a=e.i(59756),n=e.i(61916),i=e.i(74677),o=e.i(69741),l=e.i(16795),u=e.i(87718),p=e.i(95169),d=e.i(47587),c=e.i(66012),x=e.i(70101),m=e.i(26937),h=e.i(10372),v=e.i(93695);e.i(52474);var g=e.i(5232),R=e.i(89171);e.i(36701);let f=new(e.i(88942)).default({apiKey:process.env.ANTHROPIC_API_KEY});async function w(e){try{let t=await e.json(),r=t.poids&&t.taille?(t.poids/(t.taille/100)**2).toFixed(1):"?",s={perte_poids:"Perdre du poids",muscle:"Prendre du muscle",energie:"Avoir plus d'énergie au quotidien",peau:"Améliorer sa peau",sommeil:"Mieux dormir",stress:"Réduire son stress"},a=(t.objectifs||[]).map(e=>s[e]||e).join(", ")||"non précisé",n=`Tu es un expert en transformation physique. G\xe9n\xe8re un Glow Up Score bas\xe9 sur ce profil.

PROFIL:
- Pr\xe9nom: ${t.prenom}
- Objectifs prioritaires: ${a}
- \xc2ge: ${t.age} ans
- IMC: ${r} (poids ${t.poids}kg, taille ${t.taille}cm)
- Sport: ${t.sport} fois/semaine
- Eau: ${t.eau} litres/jour
- Skincare: ${t.skincare}
- Stress: ${t.stress}

IMPORTANT: tout le texte g\xe9n\xe9r\xe9 (analyse, messages, plan, quick wins) doit \xeatre orient\xe9 en priorit\xe9 autour des objectifs prioritaires list\xe9s ci-dessus. Si la personne veut "perdre du poids", parle de poids/nutrition/sport. Si elle veut "mieux dormir", parle de sommeil. Ne g\xe9n\xe8re jamais un texte g\xe9n\xe9rique d\xe9connect\xe9 de ses vrais objectifs.

R\xc8GLES DE SCORING STRICTES:

training (sport):
- "0" → 1-2
- "1-2" → 4-5
- "3-4" → 7-8
- "5+" → 9-10

hydratation (eau):
- "<1" → 1-2
- "1-1.5" → 4-5
- "1.5-2" → 7-8
- "2+" → 9-10

skincare:
- "aucune" → 1-3
- "basique" → 5-6
- "complete" → 8-9
- "avancee" → 10

steps (stress invers\xe9 — moins de stress = meilleur score):
- "extreme" → 1-2
- "eleve" → 3-5
- "modere" → 6-7
- "faible" → 8-10

nutrition: estime entre 3-8 selon l'IMC et le sport (IMC 18-25 = meilleur score)
sommeil: estime entre 4-8 (valeur moyenne car non demand\xe9)

total: moyenne pond\xe9r\xe9e de tous les scores \xd7 10, arrondie \xe0 l'entier

G\xe9n\xe8re un JSON strict (rien d'autre, pas de markdown, pas de backticks):
{
  "total": <score 0-100 coh\xe9rent avec les sous-scores>,
  "training": <0-10 selon r\xe8gles ci-dessus>,
  "nutrition": <0-10 estim\xe9>,
  "hydratation": <0-10 selon r\xe8gles ci-dessus>,
  "sommeil": <0-10 estim\xe9>,
  "skincare": <0-10 selon r\xe8gles ci-dessus>,
  "steps": <0-10 stress invers\xe9 selon r\xe8gles ci-dessus>,
  "analyse": "<2 phrases percutantes personnalis\xe9es avec le pr\xe9nom, bas\xe9es sur les vrais points faibles>",
  "message_faible": "<si total < 45 — urgent et alarmant, 1 phrase SANS pr\xe9nom, commence directement par le constat, corps envoie des signaux d'alarme ignor\xe9s>",
  "message_moyen": "<si total 45-70 — frustration + FOMO, 1 phrase SANS pr\xe9nom, potentiel g\xe2ch\xe9, proximit\xe9 top 10%, jamais de compliment>",
  "message_eleve": "<si total > 70 — challenge, 1 phrase SANS pr\xe9nom, vrais r\xe9sultats commencent \xe0 85+ et pas encore atteint>",
  "point_faible": "<cl\xe9 exacte parmi: training, nutrition, hydratation, sommeil, skincare, steps>",
  "plan_semaine1": ["<action concr\xe8te 1>", "<action concr\xe8te 2>", "<action concr\xe8te 3>"],
  "quick_wins": ["<r\xe9sultat visible en 7 jours 1>", "<r\xe9sultat visible en 7 jours 2>"]
}`,i=await f.messages.create({model:"claude-sonnet-4-6",max_tokens:1e3,messages:[{role:"user",content:n}]}),o=("text"===i.content[0].type?i.content[0].text:"").replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),l=JSON.parse(o);return R.NextResponse.json({success:!0,score:l})}catch(e){return console.error(e),R.NextResponse.json({success:!1,error:"Erreur génération score"},{status:500})}}e.s(["POST",0,w],97586);var y=e.i(97586);let E=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/generate-score/route",pathname:"/api/generate-score",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/generate-score/route.ts",nextConfigOutput:"",userland:y,...{}}),{workAsyncStorage:_,workUnitAsyncStorage:b,serverHooks:C}=E;async function S(e,t,s){s.requestMeta&&(0,a.setRequestMeta)(e,s.requestMeta),E.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/generate-score/route";R=R.replace(/\/index$/,"")||"/";let f=await E.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!f)return t.statusCode=400,t.end("Bad Request"),null==s.waitUntil||s.waitUntil.call(s,Promise.resolve()),null;let{buildId:w,deploymentId:y,params:_,nextConfig:b,parsedUrl:C,isDraftMode:S,prerenderManifest:A,routerServerContext:k,isOnDemandRevalidate:j,revalidateOnlyGenerated:N,resolvedPathname:P,clientReferenceManifest:T,serverActionsManifest:O}=f,q=(0,o.normalizeAppPath)(R),I=!!(A.dynamicRoutes[q]||A.routes[P]),M=async()=>((null==k?void 0:k.render404)?await k.render404(e,t,C,!1):t.end("This page could not be found"),null);if(I&&!S){let e=!!A.routes[P],t=A.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(b.adapterPath)return await M();throw new v.NoFallbackError}}let $=null;!I||E.isDev||S||($="/index"===($=P)?"/":$);let H=!0===E.isDev||!I,U=I&&!H;O&&T&&(0,i.setManifestsSingleton)({page:R,clientReferenceManifest:T,serverActionsManifest:O});let D=e.method||"GET",F=(0,n.getTracer)(),K=F.getActiveScopeSpan(),G=!!(null==k?void 0:k.isWrappedByNextServer),L=!!(0,a.getRequestMeta)(e,"minimalMode"),B=(0,a.getRequestMeta)(e,"incrementalCache")||await E.getIncrementalCache(e,b,A,L);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let V={params:_,previewProps:A.preview,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:H,incrementalCache:B,cacheLifeProfiles:b.cacheLife,waitUntil:s.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,s,a)=>E.onRequestError(e,t,s,a,k)},sharedContext:{buildId:w,deploymentId:y}},W=new l.NodeNextRequest(e),X=new l.NodeNextResponse(t),J=u.NextRequestAdapter.fromNodeNextRequest(W,(0,u.signalFromNodeResponse)(t));try{let a,i=async e=>E.handle(J,V).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=r.get("next.route");if(s){let t=`${D} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",s),a.updateName(t))}else e.updateName(`${D} ${R}`)}),o=async a=>{var n,o;let l=async({previousCacheEntry:r})=>{try{if(!L&&j&&N&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(a);e.fetchMetrics=V.renderOpts.fetchMetrics;let o=V.renderOpts.pendingWaitUntil;o&&s.waitUntil&&(s.waitUntil(o),o=void 0);let l=V.renderOpts.collectedTags;if(!I)return await (0,c.sendResponse)(W,X,n,V.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[h.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&V.renderOpts.collectedRevalidate,s=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:V.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:s}}}}catch(t){throw(null==r?void 0:r.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:j})},!1,k),t}},u=await E.handleResponse({req:e,nextConfig:b,cacheKey:$,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:j,revalidateOnlyGenerated:N,responseGenerator:l,waitUntil:s.waitUntil,isMinimalMode:L});if(!I)return null;if((null==u||null==(n=u.value)?void 0:n.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(o=u.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});L||t.setHeader("x-nextjs-cache",j?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,x.fromNodeOutgoingHttpHeaders)(u.value.headers);return L&&I||p.delete(h.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,c.sendResponse)(W,X,new Response(u.value.body,{headers:p,status:u.value.status||200})),null};G&&K?await o(K):(a=F.getActiveScopeSpan(),await F.withPropagatedContext(e.headers,()=>F.trace(p.BaseServerSpan.handleRequest,{spanName:`${D} ${R}`,kind:n.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},o),void 0,!G))}catch(t){if(t instanceof v.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:j})},!1,k),I)throw t;return await (0,c.sendResponse)(W,X,new Response(null,{status:500})),null}}e.s(["handler",0,S,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:b})},"routeModule",0,E,"serverHooks",0,C,"workAsyncStorage",0,_,"workUnitAsyncStorage",0,b],24990)},6714,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_fs_1t1l-4-._.js"].map(t=>e.l(t))).then(()=>t(2157)))},11105,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_node_path_1pmhwj3._.js"].map(t=>e.l(t))).then(()=>t(50227)))},46735,e=>{e.v(t=>Promise.all(["server/chunks/[externals]__1j5vgk-._.js","server/chunks/[root-of-the-server]__1fbyaci._.js"].map(t=>e.l(t))).then(()=>t(83085)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1qkc-ie._.js.map