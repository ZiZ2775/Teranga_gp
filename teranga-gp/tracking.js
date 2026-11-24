/* Suivi de colis : consultation par code (public) et outils expéditeur / GP (comptes connectés).
   Les outils s'appuient sur window.TGP_TRACK, défini par la version Supabase du site.
   Sans lui, seule la consultation de démonstration (code TGP-DEMO) fonctionne. */
(function(){
  var $=function(id){return document.getElementById(id)};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  if(!$('trk-form')) return;

  var STEPS=[['cree','Colis enregistré'],['remis','Remis au GP'],['voyage','En voyage'],['arrive','Arrivé à destination'],['livre','Livré']];
  var DEMO={label:'Valise de vêtements',from_city:'Paris',to_city:'Dakar',status:'voyage',events:[
    {status:'cree',ts:'2026-12-10T09:00:00Z',note:''},
    {status:'remis',ts:'2026-12-11T17:30:00Z',note:'Remis à Château Rouge'},
    {status:'voyage',ts:'2026-12-12T20:10:00Z',note:'Vol Paris - Dakar'}]};

  function stepIndex(s){ for(var i=0;i<STEPS.length;i++){ if(STEPS[i][0]===s) return i; } return 0; }
  function stepLabel(s){ return STEPS[stepIndex(s)][1]; }
  function fmt(ts){ try{ return new Date(ts).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }

  function timeline(c){
    var evs={}; (c.events||[]).forEach(function(e){ if(e&&e.status) evs[e.status]=e; });
    var idx=stepIndex(c.status);
    return '<ol class="tl">'+STEPS.map(function(s,i){
      var e=evs[s[0]], cls=i<idx?'done':(i===idx?'now':'');
      return '<li class="'+cls+'"><b>'+s[1]+'</b>'
        +(e&&e.ts?'<span class="date">'+esc(fmt(e.ts))+'</span>':'')
        +(e&&e.note?'<span class="note">'+esc(e.note)+'</span>':'')+'</li>';
    }).join('')+'</ol>';
  }

  function showResult(c){
    var box=$('trk-res'); box.hidden=false;
    box.innerHTML='<div class="trk-head"><b>'+esc(c.label)+'</b><span class="date">'+esc(c.from_city)+' → '+esc(c.to_city)+'</span></div>'+timeline(c);
  }

  /* ---- Consultation par code ---- */
  var T=window.TGP_TRACK||null;
  $('trk-demo').hidden=!!T;
  $('trk-form').addEventListener('submit',async function(e){
    e.preventDefault();
    var m=$('trk-msg'), code=$('trk-code').value.trim().toUpperCase();
    m.className='msg'; m.textContent='';
    if(!code){ m.className='msg err'; m.textContent='Entrez le code de suivi.'; return; }
    try{
      var c=null;
      if(T) c=await T.voir(code); else if(code==='TGP-DEMO') c=DEMO;
      if(!c){ $('trk-res').hidden=true; m.className='msg err'; m.textContent='Code introuvable. Vérifiez-le auprès de l\'expéditeur ou du GP.'; return; }
      showResult(c);
    }catch(err){ m.className='msg err'; m.textContent='Impossible de vérifier ce code pour le moment.'; }
  });

  if(!T||!window.TGP_AUTH) return;

  /* ---- Outils connectés ---- */
  function tmsg(t,cls){ var m=$('trk-tmsg'); m.textContent=t; m.className='msg '+(cls||''); }
  function digits(p){ return String(p||'').replace(/\D/g,''); }
  function cleanPhone(p){ return String(p||'').replace(/[\s().-]/g,''); }
  function wa(phone,txt,label){
    var d=digits(phone); if(!d) return '';
    return '<a class="btn ghost small" target="_blank" rel="noopener" href="https://wa.me/'+d+'?text='+encodeURIComponent(txt)+'">'+label+'</a>';
  }

  function card(c){
    var gp=c.role==='gp', idx=stepIndex(c.status), next=STEPS[idx+1];
    var id=esc(c.code);
    var txt='Colis '+c.code+' ('+c.label+') : '+stepLabel(c.status)+'. Suivi avec le code '+c.code+' sur '+location.origin+location.pathname+'#suivi';
    var h='<article class="card"><div class="top"><span class="badge '+(gp?'':'colis')+'">'+(gp?'Je suis le GP':'Je suis l\'expéditeur')+'</span><span class="date">Code : <b>'+id+'</b></span></div>'
      +'<div class="r"><span>'+esc(c.from_city)+'</span><span class="to">→ '+esc(c.to_city)+'</span></div>'
      +'<p class="note">'+esc(c.label)+'</p>'+timeline(c);
    if(gp&&next){
      h+='<form class="inl" data-code="'+id+'" data-next="'+next[0]+'">'
        +'<label for="up-n-'+id+'">Note (facultatif)<input id="up-n-'+id+'" name="note" maxlength="140" placeholder="Ex. Arrivé à Dakar, remise demain"></label>'
        +(next[0]==='livre'?'<label for="up-p-'+id+'">Code de remise donné par le destinataire<input id="up-p-'+id+'" name="pin" inputmode="numeric" maxlength="4" autocomplete="off" required></label>':'')
        +'<div class="row"><button class="btn primary small" type="submit">Marquer : '+esc(next[1])+'</button></div></form>';
    }
    var links=(gp?wa(c.sender_phone,txt,'Prévenir l\'expéditeur'):'')+wa(c.recipient_phone,txt,'Prévenir le destinataire');
    if(links) h+='<div class="actions">'+links+'</div>';
    return h+'</article>';
  }

  async function refresh(){
    try{
      var list=await T.mes();
      $('trk-list').innerHTML=list.length?list.map(card).join(''):'<div class="empty">Aucun colis pour le moment.</div>';
    }catch(e){ tmsg('Impossible de charger vos colis.','err'); }
  }

  window.TGP_AUTH.ready.then(function(){
    if(!window.TGP_AUTH.session()){ $('trk-login').hidden=false; return; }
    $('trk-tools').hidden=false; refresh();
  });

  $('trk-new').addEventListener('submit',async function(e){
    e.preventDefault();
    if(this.disabled) return;  // Prevent double submission
    this.disabled = true;
    
    var v=function(id){return $(id).value.trim()};
    var label=v('trk-label'), from=v('trk-from'), to=v('trk-to'), sp=cleanPhone(v('trk-sphone')), rp=cleanPhone(v('trk-rphone'));
    if(!label||!from||!to){ tmsg('Renseignez le contenu, le départ et l\'arrivée.','err'); this.disabled = false; return; }
    // Improved phone validation: support common African + European country codes
    var validPhoneRegex=/^\+(?:221|33|39|34|41|49|44|32|31|30|45|46|47|358)\d{6,13}$/;
    if((sp&&!validPhoneRegex.test(sp))||(rp&&!validPhoneRegex.test(rp))){ 
      tmsg('Format de numéro invalide. Utilisez +221 (SN), +33 (FR), +39 (IT), +34 (ES) etc.','err'); 
      this.disabled = false;
      return; 
    }
    try{
      var r=await T.creer(label,from,to,sp,rp);
      $('trk-new').reset();
      var box=$('trk-created'); box.hidden=false;
      box.innerHTML='<h3 style="font-size:1.1rem">Colis enregistré</h3>'
        +'<p style="margin-top:8px">Code de suivi : <b>'+esc(r.code)+'</b></p>'
        +'<p>Code de remise : <b>'+esc(r.pin)+'</b></p>'
        +'<p class="note" style="margin-top:8px">Notez le code de remise maintenant : il ne sera plus affiché. Donnez le code de suivi au GP. Donnez le code de remise au destinataire seulement : le GP le demandera à la livraison pour confirmer la remise.</p>';
      tmsg('Colis enregistré.','ok'); refresh();
    }catch(err){ tmsg('Enregistrement impossible pour le moment.','err'); }
    this.disabled = false;
  });

  $('trk-take').addEventListener('submit',async function(e){
    e.preventDefault();
    if(this.disabled) return;  // Prevent double submission
    this.disabled = true;
    
    var code=$('trk-takecode').value.trim().toUpperCase();
    if(!code){ tmsg('Entrez le code de suivi du colis.','err'); this.disabled = false; return; }
    if(!/^TGP-[A-Z0-9]{6}$/.test(code)){ tmsg('Format de code invalide.','err'); this.disabled = false; return; }
    try{ 
      await T.prendre(code); 
      $('trk-take').reset(); 
      tmsg('Colis pris en charge. Vous pouvez maintenant mettre à jour son suivi.','ok'); 
      refresh(); 
    }
    catch(err){ tmsg('Code introuvable, ou colis déjà pris en charge.','err'); }
    this.disabled = false;
  });

  $('trk-list').addEventListener('submit',async function(e){
    e.preventDefault();
    var f=e.target, code=f.getAttribute('data-code'), next=f.getAttribute('data-next');
    var note=f.elements.note?f.elements.note.value.trim():'', pin=f.elements.pin?f.elements.pin.value.trim():null;
    try{
      var res=await T.maj(code,next,note,pin);
      if(res==='pin'){ tmsg('Code de remise incorrect.','err'); return; }
      if(res==='verrou'){ tmsg('Trop d\'essais. Contactez l\'expéditeur.','err'); return; }
      tmsg('Étape enregistrée.','ok'); refresh();
    }catch(err){ tmsg('Mise à jour impossible pour le moment.','err'); }
  });
})();
