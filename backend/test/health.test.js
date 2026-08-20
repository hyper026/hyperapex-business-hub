const assert=require('node:assert/strict');
const http=require('node:http');
const app=require('../src/app');
function request(path){return new Promise((resolve,reject)=>{const server=app.listen(0,()=>{const port=server.address().port;http.get({hostname:'127.0.0.1',port,path},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>{server.close();resolve({status:res.statusCode,body});});}).on('error',e=>{server.close();reject(e);});});});}
(async()=>{const r=await request('/api/health');assert.ok([200,503].includes(r.status));const body=JSON.parse(r.body);assert.equal(body.service,'hyperapex-business-hub-api');assert.ok(['ok','degraded'].includes(body.status));console.log('health smoke test passed');})().catch(e=>{console.error(e);process.exit(1);});
