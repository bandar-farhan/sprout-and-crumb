import {pbkdf2Sync,randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
// Reads JSON from stdin to avoid exposing passwords in process arguments.
let input='';for await (const chunk of process.stdin) input+=chunk;
const {email,password}=JSON.parse(input);
if(typeof email!=='string'||!email.includes('@')||typeof password!=='string'||password.length<6)throw Error('Email and a password of at least 6 characters required');
const salt=randomBytes(16).toString('hex');const iterations=100000;
const hash=pbkdf2Sync(password,salt,iterations,32,'sha256').toString('hex');
const values={ADMIN_EMAIL:email.trim().toLowerCase(),ADMIN_PASSWORD_HASH:`${iterations}:${salt}:${hash}`,SESSION_SECRET:randomBytes(32).toString('hex')};
writeFileSync('.env',Object.entries(values).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
console.log('Local admin settings configured. Password stored as a salted PBKDF2 hash.');
