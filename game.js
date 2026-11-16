const $=s=>document.querySelector(s),H=DATA.hours,TR=DATA.traits;
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const lst=a=>a.length<2?a.join(""):a.slice(0,-1).join(", ")+" et "+a[a.length-1];
function gen(seed){
 const r=rng(seed),pick=a=>a[Math.floor(r()*a.length)],sh=a=>a.map(x=>[r(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
 const th=pick(DATA.themes),N=5+Math.floor(r()*2),K=3+Math.floor(r()*2),T=Math.floor(r()*K);
 const rooms=sh(th.rooms.map((x,i)=>i)),R=rooms[0],mot=sh(DATA.motives),roles=sh(th.roles);
 const S=sh(DATA.people).slice(0,N).map((p,i)=>({n:p[0],f:p[0].split(" ")[0],role:roles[i][p[1]==="f"?1:0],mot:mot[i].replace("{n}",p[0].split(" ")[0]),st:pick(DATA.styles),loc:Array.from({length:K},()=>pick(rooms)),at:TR.map(t=>pick(t.vals)),lie:{},op:[],ops:[]}));
 const c=Math.floor(r()*N),oth=i=>S.map((s,j)=>j).filter(j=>j!==i);
 S.forEach((s,i)=>{if(i!==c)s.loc[T]=pick(rooms.slice(1))});S[c].loc[T]=R;
 const tg=S[c].at.slice();
 S.forEach((s,i)=>{if(i!==c&&s.at.every((v,k)=>v===tg[k]))s.at[1]=pick(TR[1].vals.filter(v=>v!==tg[1]))});
 const slots=sh([...Array(K).keys()].filter(t=>t!==T)),her=sh(oth(c)).slice(0,Math.min(1+Math.floor(r()*2),K-1)),liars=[{i:c,t:T}];
 her.forEach((h,n)=>{const t=slots[n];S[h].loc[t]=pick(rooms.filter(x=>!S.some((q,j)=>j!==h&&q.loc[t]===x)));liars.push({i:h,t})});
 liars.forEach(({i,t})=>{S[i].lie[t]=S[pick(oth(i))].loc[t]});
 S.forEach((s,i)=>{s.say=[];s.cell=[];for(let t=0;t<K;t++){
  const room=s.lie[t]??s.loc[t],o=S.filter((q,j)=>j!==i&&q.loc[t]===room).map(q=>q.f);
  s.cell.push(th.rooms[room][0]+(o.length?" ("+o.join(", ")+")":" (seul)"));
  s.say.push([pick(s.st.open),pick(DATA.cores).replace("{h}",H[t]).replace("{at}",th.rooms[room][1]),o.length?pick(DATA.withL).replace("{l}",lst(o)):pick(DATA.alone),pick(s.st.close)].join(" "));}
  oth(i).forEach(j=>{
   const ks=TR.map((x,k)=>k).filter(k=>i!==c||S[j].at[k]!==tg[k]),k=pick(ks),val=i===c?tg[k]:S[j].at[k],frag=TR[k].o.replace("{v}",val);
   s.op[j]=pick(DATA.opLines).replace("{f}",S[j].f).replace("{k}",frag);s.ops[j]=s.f+" : "+frag;s.fake=s.fake||[];s.fake[j]=i===c});
 });
 const v=pick(th.victims),X=S[c].lie[T];
 return{S,th,K,T,R,c,X,liars,tg,v,weapon:pick(th.weapons),traces:TR.map((t,k)=>t.trace.replace("{v}",tg[k])),intro:pick(th.intros).replace("{v}",v),scene:pick(DATA.sceneLines).replace("{v}",v).replace("{at}",th.rooms[R][1])};
}
let G,seed,st;
function start(s){
 seed=s||Math.floor(Math.random()*1e9);history.replaceState(null,"","#"+seed);
 G=gen(seed);st={sel:null,asked:{},obs:3,seen:{},last:"",fresh:false,scene:false,left:2,end:null,msg:""};draw();
}
const say=(t)=>{st.last=t;st.fresh=true;draw()};
const ask=(i,t)=>{st.asked[i+"-"+t]=1;say(G.S[i].say[t])};
const askM=i=>{st.asked[i+"-m"]=1;say("« "+G.S[i].mot+" »")};
const askO=(i,j)=>{st.asked[i+"-o"+j]=1;say(G.S[i].op[j])};
const observe=i=>{if(st.obs<1||st.seen[i])return;st.obs--;st.seen[i]=1;const s=G.S[i];say("Vous observez "+s.f+" : "+TR.map((t,k)=>t.o.replace("{v}",s.at[k])).join(", ")+".")};
const pickS=i=>{st.sel=i;st.last="";draw()};
function accuse(i){
 const{S,c,T,th,X,R,liars}=G;if(!confirm("Accuser "+S[i].n+" ?"))return;
 if(i===c){const h=liars.slice(1).map(l=>S[l.i].f);st.end={win:1,txt:S[c].n+" était le coupable. À "+H[T]+", "+S[c].f+" prétendait être "+th.rooms[X][1]+", mais c’était faux : "+S[c].f+" se trouvait "+th.rooms[R][1]+", seul."+(h.length?" "+lst(h)+(h.length>1?" mentaient":" mentait")+" aussi, mais sur d’autres heures.":"")}}
 else{st.left--;if(st.left<=0)st.end={win:0,txt:"Plus d’accusation possible. Le coupable était "+S[c].n+"."};else st.msg=S[i].n+" est innocent. Il vous reste "+st.left+" accusation."}
 draw();
}
const mono=n=>n.split(" ").map(x=>x[0]).join(""),hue=n=>[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
function type(el,t){
 if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=t;return}
 let i=0;(function f(){el.textContent=t.slice(0,++i);if(i<t.length)setTimeout(f,14)})();
}
function copy(){const u=location.href,f=()=>prompt("Copie ce lien pour rejouer cette affaire :",u);if(!navigator.clipboard)return f();navigator.clipboard.writeText(u).then(()=>{$("#cp").textContent="Lien copié"}).catch(f)}
function draw(){
 const{S,th,K,T,traces,intro,scene}=G;
 document.documentElement.style.setProperty("--a",th.accent);$("#id").textContent="Affaire n° "+seed;
 const prog=i=>Array.from({length:K+1},(_,k)=>`<i class="${st.asked[i+"-"+(k<K?k:"m")]?"f":""}"></i>`).join("");
 let a=`<section class="card"><p class="kick">${th.name}</p><p>${intro}</p>`;
 a+=st.scene?`<p class="scene">${scene} Arme : ${G.weapon}. Heure du décès : <b>${H[T]}</b>. Aucun suspect n’admet avoir mis les pieds dans cette pièce à ce moment-là.</p><p class="scene">${traces.join(" ")}</p><p class="muted">Seuls les menteurs trompent les enquêteurs. Les autres disent toujours vrai.</p>`:`<button onclick="st.scene=true;draw()">Examiner la scène du crime</button>`;
 a+=`</section><section class="card"><p class="kick">Suspects</p><div class="sus">`;
 S.forEach((s,i)=>a+=`<button class="${st.sel===i?"on":""}" onclick="pickS(${i})"><span class="mono" style="--h:${hue(s.n)}">${mono(s.n)}</span><span><b>${s.n}</b><small>${s.role}</small><span class="dots">${prog(i)}</span></span></button>`);
 a+=`</div></section>`;
 let b="";
 if(st.end)b=`<section class="card end ${st.end.win?"":"lose"}"><span class="stamp">${st.end.win?"Affaire résolue":"Affaire classée"}</span><p>${st.end.txt}</p><button onclick="start()">Nouvelle affaire</button></section>`;
 else if(st.sel===null)b=`<section class="card empty"><p>Choisissez un suspect pour l’interroger.</p></section>`;
 else{
  const i=st.sel,s=S[i];
  b=`<section class="card"><div class="who"><span class="mono big" style="--h:${hue(s.n)}">${mono(s.n)}</span><div><h2>${s.n}</h2><small>${s.role}</small></div></div><div class="q">`;
  for(let t=0;t<K;t++)b+=`<button class="${st.asked[i+"-"+t]?"done":""}" onclick="ask(${i},${t})">Où étiez-vous à ${H[t]} ?</button>`;
  b+=`<button class="${st.asked[i+"-m"]?"done":""}" onclick="askM(${i})">Quel lien avec la victime ?</button>`;
  b+=`<button ${st.obs<1||st.seen[i]?"disabled":""} class="${st.seen[i]?"done":""}" onclick="observe(${i})">Observer ${s.f} (${st.obs} restantes)</button></div>`;
  b+=`<p class="muted lbl">Que pensez-vous de…</p><div class="chips">`+S.map((q,j)=>j===i?"":`<button class="${st.asked[i+"-o"+j]?"done":""}" onclick="askO(${i},${j})">${q.f}</button>`).join("")+`</div>`;
  b+=st.last?`<p class="say"></p>`:`<p class="muted">Posez une question.</p>`;
  b+=`<button class="acc" onclick="accuse(${i})">Accuser ${s.f}</button>`;
  if(st.msg)b+=`<p class="err">${st.msg}</p>`;b+=`</section>`;
 }
 let c=`<section class="carnet"><h2>Carnet d’enquête</h2><table><tr><th>Suspect</th>${H.slice(0,K).map(x=>`<th>${x}</th>`).join("")}<th>Lien</th><th>Apparence</th><th>Avis reçus</th></tr>`;
 S.forEach((s,i)=>{c+=`<tr><td>${s.f}</td>`;for(let t=0;t<K;t++)c+=st.asked[i+"-"+t]?`<td>${s.cell[t]}</td>`:`<td class="e">···</td>`;
  c+=st.asked[i+"-m"]?`<td>${s.mot.replace(s.f+" ","")}</td>`:`<td class="e">···</td>`;
  c+=st.seen[i]?`<td>${s.at.join(", ")}</td>`:`<td class="e">···</td>`;
  const av=S.filter((q,k)=>k!==i&&st.asked[k+"-o"+i]).map(q=>q.ops[i]);c+=av.length?`<td>${av.join("<br>")}</td>`:`<td class="e">···</td>`;c+=`</tr>`});
 c+=`</table></section>`;
 $("#app").innerHTML=`<div class="cols"><div>${a}</div><div class="side">${b}</div></div>${c}`;
 const el=$(".say");if(el){if(st.fresh){st.fresh=false;type(el,st.last)}else el.textContent=st.last}
}
const hs=parseInt(location.hash.slice(1));start(isNaN(hs)?0:hs);
