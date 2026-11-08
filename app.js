const $=s=>document.querySelector(s),app=$('#app');
let DB;try{DB=JSON.parse(localStorage.getItem('hg')||'null')}catch(e){}
if(!DB)DB={users:[],riders:[],rides:[]};
const save=()=>{try{localStorage.setItem('hg',JSON.stringify(DB))}catch(e){}};
let S={v:'home',me:null,step:1,f:{},tab:'overview'};
const uid=()=>Math.random().toString(36).slice(2,9);
const hash=async p=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('hg:'+p)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2800)};
const go=(v,x={})=>{S={...S,v,...x};render()};
const U=id=>DB.users.find(u=>u.id==id)||{},R=id=>DB.riders.find(r=>r.user_id==id)||{};
const tag=s=>`<span class="tag ${s.split(' ')[0]}">${esc(s)}</span>`;
const f=k=>esc(S.f[k]||'');
const inp=(k,l,t='text')=>`<label>${l}</label><input type="${t}" value="${f(k)}" oninput="S.f['${k}']=this.value">`;
const sample=()=>{if(DB.users.some(u=>u.sample))return;/* sample data seeded only on request */};

function render(){
 const v=S.v;
 if(v=='home')return app.innerHTML=`<div class="hero"><div class="wrap"><div class="nav"><div class="logo">HABAL<b>GO</b></div><div class="row"><button class="btn o s" onclick="go('login',{role:'admin'})">Admin</button><button class="btn o s" onclick="go('login',{role:'passenger'})">Passenger Login</button><button class="btn s" onclick="go('login',{role:'rider'})">Rider Login</button></div></div>
 <h1>Your Ride. Your Community. Your Journey.</h1><p style="max-width:560px;opacity:.85">HabalGo is a digital platform for registering and managing Habal-habal riders and connecting passengers with available, admin-approved transportation services.</p>
 <div class="row"><button class="btn" onclick="go('login',{role:'passenger'})">Get Started</button><button class="btn o" onclick="go('reg',{step:1,f:{}})">Register as a Rider</button></div>
 <div class="grid" style="margin-top:50px"><div class="glass"><h3>About</h3>A community-first platform that verifies riders before they can accept trips.</div><div class="glass"><h3>Features</h3>Multi-step registration, admin approval, ride requests, ride history, CSV reports.</div><div class="glass"><h3>Contact</h3>Lagawe, Ifugao · hello@habalgo.example (placeholder)</div></div></div></div>`;
 if(v=='login'){const r=S.role;return app.innerHTML=`<div class="main"><div class="fm card"><div class="logo">HABAL<b>GO</b></div><h2 style="margin-top:14px">${r[0].toUpperCase()+r.slice(1)} Login</h2>
 <label>Email</label><input id="em" type="email"><label>Password</label><input id="pw" type="password"><label><input type="checkbox" style="width:auto;margin:0 6px 0 0" onclick="pw.type=this.checked?'text':'password'">Show password</label><br><br>
 <button class="btn" style="width:100%" onclick="login()">Login</button><p class="row mu">${r=='rider'?`<a href="#" onclick="go('reg',{step:1,f:{}});return false">Register as a Rider</a>`:''}${r=='passenger'?`<a href="#" onclick="go('signup');return false">Create an account</a>`:''}${r=='admin'?`<a href="#" onclick="go('adminsetup');return false">First-time admin setup</a>`:''}<a href="#" onclick="toast('Password reset needs a real email backend (Supabase Auth).');return false">Forgot password?</a><a href="#" onclick="go('home');return false">← Home</a></p>
 <div class="note">Demo mode: data lives in this browser only.</div></div></div>`}
 if(v=='signup'||v=='adminsetup'){const a=v=='adminsetup';return app.innerHTML=`<div class="main"><div class="fm card"><h2>${a?'Create demo admin':'Create passenger account'}</h2>${inp('name','Full name')}${inp('email','Email','email')}${inp('phone','Contact number')}${inp('pw','Password (min 8)','password')}<button class="btn" onclick="signup('${a?'admin':'passenger'}')">Create</button> <button class="btn o" onclick="go('home')">Cancel</button>${a?'<div class="note">Production: create admins in Supabase and never ship credentials.</div>':''}</div></div>`}
 if(v=='reg')return regView();
 if(v=='rider')return riderView();
 if(v=='passenger')return passView();
 if(v=='admin')return adminView();
}
async function signup(role){const x=S.f;if(!x.name||!/^\S+@\S+\.\S+$/.test(x.email||'')||(x.pw||'').length<8)return toast('Fill all fields; password needs 8+ chars.');
 if(DB.users.some(u=>u.email==x.email.toLowerCase()))return toast('Email already registered.');
 DB.users.push({id:uid(),full_name:x.name,email:x.email.toLowerCase(),contact:x.phone||'',pw:await hash(x.pw),role,status:'Active',created:new Date().toISOString()});save();toast('Account created. Please login.');go('login',{role,f:{}})}
async function login(){const u=DB.users.find(u=>u.email==em.value.trim().toLowerCase()&&u.role==S.role);
 if(!u||u.pw!=await hash(pw.value))return toast('Invalid credentials.');if(u.status=='Suspended')return toast('Account suspended.');
 S.me=u.id;go(S.role,{tab:'overview'})}
const logout=()=>{S.me=null;go('home')};

function regView(){const s=S.step,x=S.f;let b='';
 if(s==1)b=inp('last','Last name')+inp('first','First name')+inp('mi','Middle initial')+inp('dob','Date of birth','date')+`<label>Gender</label><select onchange="S.f.gender=this.value"><option>${f('gender')||'Male'}</option><option>Female</option><option>Other</option></select>`+inp('addr','Complete address')+inp('phone','Contact number')+inp('email','Email','email')+inp('pw','Password (min 8)','password')+inp('pw2','Confirm password','password')+`<label>Face photo (JPG/PNG)</label><input type="file" accept=".jpg,.jpeg,.png" onchange="S.f.photo=this.files[0]?.name">`;
 if(s==2)b=inp('brand','Motorcycle brand')+inp('model','Model')+inp('plate','Plate number')+inp('color','Color')+inp('regno','Vehicle registration info');
 if(s==3)b=['OR','CR',"Driver's License"].map(d=>`<label>${d} (PDF/JPG/PNG)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" onchange="S.f['d_${d}']=this.files[0]?.name">`).join('')+`<div class="note">Demo stores file names only. Real uploads need Supabase Storage.</div>`;
 if(s==4)b=`<table>${Object.entries(x).filter(([k])=>!k.startsWith('pw')).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table><br><label><input type="checkbox" id="ok" style="width:auto;margin-right:6px">I confirm the information and documents are accurate.</label>`;
 return app.innerHTML=`<div class="main"><div class="fm card" style="max-width:560px"><h2>Rider Registration · Step ${s}/4</h2><div class="bar"><i style="width:${s*25}%"></i></div>${b}<div class="row"><button class="btn o" onclick="${s>1?`S.step--;render()`:`go('home')`}">Back</button><button class="btn" onclick="next()">${s==4?'Submit Registration':'Next'}</button></div></div></div>`}
async function next(){const x=S.f,s=S.step;
 if(s==1){if(!x.last||!x.first||!x.dob||!x.phone||!/^\S+@\S+\.\S+$/.test(x.email||''))return toast('Complete all personal fields.');if((x.pw||'').length<8||x.pw!=x.pw2)return toast('Passwords must match (8+ chars).');if(DB.users.some(u=>u.email==x.email.toLowerCase()))return toast('Email already registered.')}
 if(s==2&&(!x.brand||!x.model||!x.plate))return toast('Brand, model and plate are required.');
 if(s==3&&!(x.d_OR&&x.d_CR&&x["d_Driver's License"]))return toast('Upload all three documents.');
 if(s<4){S.step++;return render()}
 if(!$('#ok').checked)return toast('Please confirm accuracy.');
 const id=uid();DB.users.push({id,full_name:`${x.first} ${x.mi||''} ${x.last}`.replace(/ +/g,' '),email:x.email.toLowerCase(),contact:x.phone,pw:await hash(x.pw),role:'rider',status:'Active',created:new Date().toISOString()});
 DB.riders.push({user_id:id,dob:x.dob,addr:x.addr,gender:x.gender,photo:x.photo,brand:x.brand,model:x.model,plate:x.plate,color:x.color,regno:x.regno,docs:['OR','CR',"Driver's License"].map(d=>({type:d,file:x['d_'+d]})),reg:'Pending',avail:'Unavailable'});save();
 app.innerHTML=`<div class="main"><div class="fm card"><h2>Registration Submitted!</h2>${tag('Pending Approval')}<p>An administrator must review your application. Login to check your status.</p><button class="btn" onclick="go('login',{role:'rider'})">Rider Login</button></div></div>`}

const shell=(t,b,tabs)=>app.innerHTML=`<div class="top"><div class="logo">HABAL<b>GO</b> <span class="mu">· ${t}</span></div><div class="row">${tabs.map(([k,l])=>`<button class="btn s ${S.tab==k?'':'o'}" onclick="S.tab='${k}';render()">${l}</button>`).join('')}<button class="btn s r" onclick="logout()">Logout</button></div></div><div class="main">${b}</div>`;
function guard(role){const u=U(S.me);if(!u.id||u.role!=role){go('home');return null}return u}

function riderView(){const u=guard('rider');if(!u)return;const r=R(u.id);const reqs=DB.rides.filter(x=>x.rider_id==u.id||(x.rider_id==null&&0));
 let b=`<div class="card"><h2>${esc(u.full_name)}</h2>${tag(r.reg)} ${r.reg=='Approved'?`<br><br><label>Availability</label><select onchange="setAv(this.value)">${['Available','Unavailable','On a Ride'].map(a=>`<option ${a==r.avail?'selected':''}>${a}</option>`).join('')}</select>`:'<p class="mu">You can accept rides once an admin approves your application.</p>'}
 <p class="mu">${esc(u.email)} · ${esc(u.contact)}<br>${esc(r.brand)} ${esc(r.model)} · ${esc(r.plate)} · ${esc(r.color)}<br>Docs: ${(r.docs||[]).map(d=>esc(d.type+': '+d.file)).join(', ')}</p></div>`;
 if(S.tab=='profile')b=`<div class="card"><h2>Account</h2><label>Contact number</label><input id="ph" value="${esc(u.contact)}"><button class="btn s" onclick="U('${u.id}').contact=ph.value;save();toast('Updated');render()">Update</button><br><br><label>New password</label><input id="np" type="password"><button class="btn s" onclick="chpw('${u.id}')">Change password</button></div>`;
 else b+=`<div class="card"><h2>Ride requests</h2>${rideTable(reqs,'rider')}</div>`;
 shell('Rider',b,[['overview','Dashboard'],['profile','Account']])}
const setAv=v=>{R(S.me).avail=v;save();toast('Availability: '+v)};
async function chpw(id){if(np.value.length<8)return toast('8+ chars');U(id).pw=await hash(np.value);save();toast('Password changed')}
function rideTable(rs,role){if(!rs.length)return '<p class="mu">Nothing here yet.</p>';
 return `<table><tr><th>Passenger</th><th>Rider</th><th>Route</th><th>Status</th><th></th></tr>${rs.map(x=>{let a='';
 if(role=='rider'&&x.status=='Requested'&&R(S.me).reg=='Approved')a=`<button class="btn s" onclick="rs('${x.id}','Accepted')">Accept</button> <button class="btn s r" onclick="rs('${x.id}','Rejected')">Reject</button>`;
 if(role=='rider'&&x.status=='Accepted')a=`<button class="btn s" onclick="rs('${x.id}','Completed')">Complete</button>`;
 if(role=='passenger'&&['Requested','Accepted'].includes(x.status))a=`<button class="btn s r" onclick="if(confirm('Cancel this ride?'))rs('${x.id}','Cancelled')">Cancel</button>`;
 return `<tr><td>${esc(U(x.passenger_id).full_name)}</td><td>${esc(U(x.rider_id).full_name)}</td><td>${esc(x.pickup)} → ${esc(x.dest)}</td><td>${tag(x.status)}</td><td>${a}</td></tr>`}).join('')}</table>`}
function rs(id,st){const x=DB.rides.find(r=>r.id==id);x.status=st;save();toast('Ride '+st);render()}

function passView(){const u=guard('passenger');if(!u)return;
 const rd=DB.riders.filter(r=>r.reg=='Approved'&&r.avail=='Available'&&U(r.user_id).status=='Active');
 let b;
 if(S.tab=='profile')b=`<div class="card"><h2>Profile</h2><label>Name</label><input id="nm" value="${esc(u.full_name)}"><label>Contact</label><input id="ph" value="${esc(u.contact)}"><button class="btn s" onclick="U('${u.id}').full_name=nm.value;U('${u.id}').contact=ph.value;save();toast('Saved')">Save</button></div>`;
 else b=`<div class="card"><h2>Book a Ride</h2><label>Pickup location</label><input id="pu"><label>Destination</label><input id="ds"><div class="note">Map/GPS not included: needs a maps API key (e.g. Google Maps or Leaflet+OSM).</div><h3>Available riders</h3>${rd.length?`<table>${rd.map(r=>`<tr><td>${esc(U(r.user_id).full_name)}<br><span class="mu">${esc(r.brand)} ${esc(r.model)} · ${esc(r.plate)}</span></td><td><button class="btn s" onclick="book('${r.user_id}')">Request</button></td></tr>`).join('')}</table>`:'<p class="mu">No approved riders are available right now.</p>'}</div><div class="card"><h2>My rides</h2>${rideTable(DB.rides.filter(x=>x.passenger_id==u.id),'passenger')}</div>`;
 shell('Passenger',b,[['overview','Book / History'],['profile','Profile']])}
function book(rid){if(!pu.value.trim()||!ds.value.trim())return toast('Enter pickup and destination.');
 DB.rides.push({id:uid(),passenger_id:S.me,rider_id:rid,pickup:pu.value,dest:ds.value,status:'Requested',created:new Date().toISOString()});save();toast('Request sent');render()}

function adminView(){const u=guard('admin');if(!u)return;const rd=DB.riders,c=s=>rd.filter(r=>r.reg==s).length,pa=DB.users.filter(x=>x.role=='passenger');let b;
 const q=(S.q||'').toLowerCase(),fl=S.fl||'';
 if(S.tab=='overview'){const m={};rd.forEach(r=>{const k=(U(r.user_id).created||'').slice(0,7);m[k]=(m[k]||0)+1});const mx=Math.max(1,...Object.values(m));
 b=`<div class="grid">${[['Riders',rd.length],['Passengers',pa.length],['Pending',c('Pending')],['Approved',c('Approved')],['Rejected',c('Rejected')],['Completed rides',DB.rides.filter(r=>r.status=='Completed').length],['Active rides',DB.rides.filter(r=>r.status=='Accepted').length]].map(([l,n])=>`<div class="card stat"><b>${n}</b>${l}</div>`).join('')}</div><div class="card"><h3>Rider registrations by month</h3>${Object.entries(m).map(([k,n])=>`<div class="mu">${k} (${n})</div><div class="bar"><i style="width:${n/mx*100}%"></i></div>`).join('')||'<p class="mu">No data yet. All figures are live from the database.</p>'}</div>`}
 if(S.tab=='riders'){const l=rd.filter(r=>(!fl||r.reg==fl)&&(U(r.user_id).full_name+r.plate).toLowerCase().includes(q));
 b=`<div class="card"><div class="row"><input placeholder="Search name/plate" value="${esc(S.q||'')}" onchange="S.q=this.value;render()" style="max-width:240px"><select onchange="S.fl=this.value;render()" style="max-width:220px">${['','Pending','Approved','Rejected','Requires Additional Documents'].map(o=>`<option value="${o}" ${o==fl?'selected':''}>${o||'All statuses'}</option>`).join('')}</select></div>${l.length?`<table>${l.map(r=>`<tr><td><b>${esc(U(r.user_id).full_name)}</b><br><span class="mu">${esc(U(r.user_id).email)}<br>${esc(r.brand)} ${esc(r.model)} ${esc(r.plate)}<br>${(r.docs||[]).map(d=>esc(d.type+': '+d.file)).join(' · ')}</span></td><td>${tag(r.reg)} ${tag(U(r.user_id).status)}</td><td class="row">${[['Approve','Approved'],['Reject','Rejected'],['Need docs','Requires Additional Documents']].map(([a,s])=>`<button class="btn s ${s=='Rejected'?'r':''}" onclick="setReg('${r.user_id}','${s}')">${a}</button>`).join('')}<button class="btn s o" onclick="susp('${r.user_id}')">Suspend/Restore</button></td></tr>`).join('')}</table>`:'<p class="mu">No riders match.</p>'}</div>`}
 if(S.tab=='users')b=`<div class="card"><h2>Passengers</h2>${pa.length?`<table>${pa.map(p=>`<tr><td>${esc(p.full_name)}<br><span class="mu">${esc(p.email)} · ${esc(p.contact)}</span></td><td>${tag(p.status)}</td><td><button class="btn s o" onclick="susp('${p.id}')">Suspend/Restore</button></td></tr>`).join('')}</table>`:'<p class="mu">No passengers yet.</p>'}</div>`;
 if(S.tab=='rides')b=`<div class="card"><h2>All rides</h2>${rideTable(DB.rides,'admin')}<br><button class="btn s" onclick="csv()">Export CSV</button></div>`;
 shell('Admin',b,[['overview','Overview'],['riders','Riders'],['users','Users'],['rides','Rides']])}
function setReg(id,s){R(id).reg=s;save();toast('Status: '+s);render()}
function susp(id){const x=U(id);x.status=x.status=='Suspended'?'Active':'Suspended';save();render()}
function csv(){const rows=[['passenger','rider','pickup','destination','status','created']].concat(DB.rides.map(x=>[U(x.passenger_id).full_name,U(x.rider_id).full_name,x.pickup,x.dest,x.status,x.created]));
 const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n'));a.download='rides.csv';a.click()}
render();
