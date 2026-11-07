/**
 * Run locally with Node 20+: node scripts/setup-crm-password.mjs
 * Creates .local/auth-owner.sql. NEVER commit or share this file.
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const readHidden = prompt => new Promise((resolve,reject)=>{
  if(!process.stdin.isTTY) return reject(Error('Open in an interactive terminal.'));
  let input='';
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  const listener=chunk=>{
    for(const c of chunk.toString('utf8')){
      if(c==='\r'||c==='\n'){
        process.stdin.off('data',listener);
        process.stdin.setRawMode(false);process.stdin.pause();
        process.stdout.write('\n');resolve(input);return;
      }
      if(c==='\u0003'){
        process.stdin.setRawMode(false);process.stdin.pause();
        process.stdout.write('\n');reject(Error('Cancelled'));return;
      }
      if(c==='\u007f'||c==='\b')input=input.slice(0,-1);
      else if(input.length<256 && c>=' ')input+=c;
    }
  };
  process.stdin.on('data',listener);
});
try{
 const password=await readHidden('Create a strong admin password (12+ characters, hidden): ');
 const confirm=await readHidden('Repeat password: ');
 if(password!==confirm)throw Error('Passwords do not match');
 if(password.length<12||password.length>256)throw Error('Password must be 12–256 characters');
 const salt=randomBytes(24).toString('base64url');
 const verifier=pbkdf2Sync(password,Buffer.from(salt,'base64url'),310000,32,'sha256').toString('base64url');
 mkdirSync('.local',{recursive:true});
 const sql=`INSERT INTO crm_auth_users(username,salt,verifier,iterations)
 VALUES('owner','${salt}','${verifier}',310000)
 ON CONFLICT(username) DO UPDATE SET salt=excluded.salt,verifier=excluded.verifier,iterations=excluded.iterations;
 DELETE FROM crm_auth_sessions WHERE user_id='owner';`;
 const file=join('.local','auth-owner.sql');
 writeFileSync(file,sql,{mode:0o600,flag:'w'});
 console.log('Password verifier created at '+file+'. Password itself was NOT saved.');
 console.log('Apply this SQL using Cloudflare D1 Console for authentic-naturals-crm AFTER password-auth-schema.sql.');
 console.log('Password changes invalidate all existing owner sessions.');
}catch(e){console.error(e.message);process.exitCode=1;}
