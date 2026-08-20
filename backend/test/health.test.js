const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const file of ['src/server.js','src/routes/finance.js','src/routes/requests.js','src/routes/reports.js']){
 const full=path.join(__dirname,'..',file);assert.ok(fs.existsSync(full),`${file} is missing`);
}
console.log('backend file smoke check passed');
