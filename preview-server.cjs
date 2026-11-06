// Dependency-free local preview for Study Buddy. Run: npm run preview
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const port = Number(process.env.PORT || 3000);
http.createServer((req,res)=>{
  let pathName;
  try { pathName = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch (_) { res.writeHead(400).end('Bad request'); return; }
  const requested = path.resolve(root,'.' + path.sep + pathName.replace(/^\/+/,''));
  const relative = path.relative(root,requested);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(seg=>seg.startsWith('.'))) {
    res.writeHead(403).end('Forbidden'); return;
  }
  const file = pathName === '/' ? path.join(root,'index.html') : requested;
  fs.stat(file,(err,stat)=>{
    if(err || !stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Study Buddy local preview: http://localhost:${port}`));
