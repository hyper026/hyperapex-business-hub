const rateLimit=require('express-rate-limit');
const authLimiter=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many login attempts. Please try again later.'}});
const apiLimiter=rateLimit({windowMs:15*60*1000,max:300,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many requests. Please try again later.'}});
function validateEnv(){const required=['JWT_SECRET','DB_HOST','DB_USER','DB_NAME'];const missing=required.filter(k=>!process.env[k]);if(missing.length)throw new Error(`Missing required environment variables: ${missing.join(', ')}`);if(String(process.env.JWT_SECRET).length<32)throw new Error('JWT_SECRET must be at least 32 characters.');}
function errorHandler(err,_req,res,_next){console.error(err);if(res.headersSent)return;res.status(err.status||500).json({error:err.expose?err.message:'Internal server error.'});}
module.exports={authLimiter,apiLimiter,validateEnv,errorHandler};
