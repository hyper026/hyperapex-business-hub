const fs=require('fs/promises');const path=require('path');const crypto=require('crypto');
const root=path.resolve(process.env.FILE_STORAGE_DIR||path.join(process.cwd(),'private-storage'));
async function ensureRoot(){await fs.mkdir(root,{recursive:true});}
function safeName(name){return String(name||'document').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,180)||'document';}
async function saveBuffer(buffer,originalName,requestId){if(!Buffer.isBuffer(buffer)||!buffer.length)throw new Error('EMPTY_FILE');const dir=path.join(root,String(requestId));await fs.mkdir(dir,{recursive:true});const key=`${requestId}/${crypto.randomUUID()}-${safeName(originalName)}`;const target=path.join(root,key);await fs.writeFile(target,buffer,{flag:'wx'});return key;}
async function openFile(storageKey){const target=path.resolve(root,storageKey);if(target!==root&&!target.startsWith(root+path.sep))throw new Error('INVALID_STORAGE_KEY');return fs.readFile(target);}
async function removeFile(storageKey){const target=path.resolve(root,storageKey);if(target!==root&&!target.startsWith(root+path.sep))throw new Error('INVALID_STORAGE_KEY');await fs.rm(target,{force:true});}
module.exports={root,ensureRoot,saveBuffer,openFile,removeFile,safeName};
