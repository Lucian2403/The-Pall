/** The Pall — LOCAL demo server. Bind to loopback only; not an MMO deployment. */
import {createServer as httpServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStore,StoreError} from './store.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const assets={
  '/': ['public/index.html','text/html; charset=utf-8'],
  '/app.js':['public/app.js','text/javascript; charset=utf-8'],
  '/styles.css':['public/styles.css','text/css; charset=utf-8'],
  '/compact.css':['public/compact.css','text/css; charset=utf-8'],
};
function answer(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
async function body(req){let chunks=[],n=0;for await(const part of req){n+=part.length;if(n>8192)throw new StoreError('Request too large',413);chunks.push(part);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new StoreError('Malformed JSON',400)}
}
export function createApp({dataDir=join(root,'.demo-data'),seedGenerator}={}){
  const store=createStore(dataDir,{seedGenerator});
  return httpServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    try{
      const base=`http://${req.headers.host||'127.0.0.1'}`;
      const url=new URL(req.url,base);
      if(req.method==='GET'&&Object.hasOwn(assets,url.pathname)){
        const [file,type]=assets[url.pathname];const content=await readFile(join(root,file));
        res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(content);return;
      }
      if(req.method==='GET'&&url.pathname==='/api/health'){
        answer(res,200,{ok:true,mode:'local-prototype',productionReady:false});return;
      }
      if(req.method==='POST'){
        if(req.headers.origin && req.headers.origin!==base)throw new StoreError('Cross-origin requests are not accepted',403);
        if(url.pathname==='/api/encounters'){
          const data=await body(req); const result=await store.create(data?.scene,data?.approach??'hold');
          answer(res,201,result);return;
        }
        const match=url.pathname.match(/^\/api\/encounters\/([a-f0-9-]+)\/actions$/i);
        if(match){const data=await body(req);const state=await store.act(match[1],req.headers['x-session-token'],data);answer(res,200,state);return;}
      }
      if(req.method==='GET'){
        const match=url.pathname.match(/^\/api\/encounters\/([a-f0-9-]+)$/i);
        if(match){const state=await store.get(match[1],req.headers['x-session-token']);answer(res,200,state);return;}
      }
      answer(res,404,{error:'Not found'});
    }catch(e){
      const status=e instanceof StoreError?e.status:500;
      if(status===500)console.error('Local demo server error:',e);
      answer(res,status,{error:status===500?'Internal server error':e.message});
    }
  });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const port=Number(process.env.PORT||8787);
  const app=createApp();
  app.listen(port,'127.0.0.1',()=>console.log(`The Pall local combat demo: http://127.0.0.1:${port}\nEncounter saves: ${join(root,'.demo-data')}`));
}
