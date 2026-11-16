// Fleet Tracker server - no dependencies. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000, ADMIN=process.env.ADMIN_PASSWORD||'admin123', DRIVER=process.env.DRIVER_CODE||'driver123';
const FILE=path.join(__dirname,'data.json');
let db={units:{},history:{}};try{db=JSON.parse(fs.readFileSync(FILE))}catch(e){}
let dirty=false;setInterval(()=>{if(dirty){fs.writeFileSync(FILE,JSON.stringify(db));dirty=false}},5000);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const send=(r,c,o)=>{r.writeHead(c,{'Content-Type':'application/json'});r.end(JSON.stringify(o))};
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://x');
 if(u.pathname==='/api/location'&&req.method==='POST'){let b='';req.on('data',d=>{b+=d;if(b.length>1e5)req.destroy()});req.on('end',()=>{
  try{const p=JSON.parse(b);if(p.code!==DRIVER)return send(res,401,{error:'bad code'});
   const id=String(p.id||'').trim().slice(0,40);if(!id||typeof p.lat!=='number'||typeof p.lng!=='number')return send(res,400,{error:'bad data'});
   const ts=Date.now();db.units[id]={id,type:String(p.type||'Other').slice(0,20),driver:String(p.driver||'').slice(0,60),lat:p.lat,lng:p.lng,acc:p.acc||0,speed:p.speed||0,battery:p.battery||null,ts};
   const h=db.history[id]=db.history[id]||[];h.push([p.lat,p.lng,ts]);if(h.length>3000)h.shift();dirty=true;send(res,200,{ok:true,ts});
  }catch(e){send(res,400,{error:'bad json'})}});return}
 if(u.pathname.startsWith('/api/')){
  if(u.searchParams.get('key')!==ADMIN)return send(res,401,{error:'unauthorized'});
  if(u.pathname==='/api/units')return send(res,200,Object.values(db.units));
  if(u.pathname==='/api/history'){const id=u.searchParams.get('id'),since=+u.searchParams.get('since')||0;return send(res,200,(db.history[id]||[]).filter(p=>p[2]>=since))}
  return send(res,404,{})}
 let f=u.pathname==='/'?'/index.html':u.pathname;f=path.normalize(f).replace(/^(\.\.[\/\\])+/,'');
 const fp=path.join(__dirname,'public',f);
 fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream'});res.end(d)});
}).listen(PORT,()=>console.log('Fleet Tracker on http://localhost:'+PORT));
