(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WaterCore=api;})(globalThis,function(){'use strict';
const fields=[['bicarbonato','Bicarbonato (HCO₃⁻)'],['calcio','Cálcio (Ca²⁺)'],['magnesio','Magnésio (Mg²⁺)'],['sodio','Sódio (Na⁺)'],['cloreto','Cloreto (Cl⁻)'],['sulfato','Sulfato (SO₄²⁻)'],['potassio','Potássio (K⁺)'],['tds','TDS'],['residuo','Resíduo seco'],['ph','pH'],['cloro','Cloro residual'],['nitrato','Nitrato'],['fluoreto','Fluoreto'],['silica','Sílica'],['fosfato','Fosfato'],['bario','Bário'],['boro','Boro'],['manganes','Manganês'],['estroncio','Estrôncio']];
const profiles={equilibrado:{name:'Equilibrado / versátil',a:[30,50],h:[50,90]},floral:{name:'Floral / frutado',a:[15,35],h:[40,80]},chocolate:{name:'Chocolate / castanhas',a:[40,65],h:[50,100]},referencia:{name:'Referência ampla SCAE (2016)',a:[40,75],h:[50,175]},custom:{name:'Personalizado'}};
function num(v){if(v===null||v===undefined||String(v).trim()==='')return null;if(typeof v==='number')return Number.isFinite(v)&&v>=0?v:NaN;const s=String(v).trim();if(!/^\d+(?:[.,]\d+)?$/.test(s))return NaN;const n=Number(s.replace(',','.'));return Number.isFinite(n)&&n>=0?n:NaN;}
const known=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const fmt=(v,d=1)=>known(v)?v.toLocaleString('pt-BR',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
function composition(m){const b=m.bicarbonato,c=m.calcio,g=m.magnesio;const a=known(b)?b*0.8197:null,dc=known(c)?c*2.497:null,dm=known(g)?g*4.118:null,h=dc!==null&&dm!==null?dc+dm:null;return {a,dc,dm,h,mgPct:h>0?dm/h*100:null,ratio:a>0&&h!==null?h/a:null};}
function classify(v,range){return !known(v)?'Desconhecida':v<range[0]?'Abaixo do alvo':v>range[1]?'Acima do alvo':'Dentro do alvo';}
function mix(a,h,b,j,f,volume){return {a:a*f+b*(1-f),h:h*f+j*(1-f),va:volume*f,vb:volume*(1-f)};}
function solve(a,b,target){if(a===b)return target===a?0.5:null;const f=(target-b)/(a-b);return f>=0&&f<=1?f:null;}
function salts(a0,h0,a1,h1,v,mg){if(a1<a0||h1<h0)return null;const da=a1-a0,dh=h1-h0;return {bicarb:da*v*84.0066/50.043,mg:dh*mg*v*246.47/100.0869,ca:dh*(1-mg)*v*147.014/100.0869,na:da*22.9898/50.043,sulfate:dh*mg*96.06/100.0869,chloride:dh*(1-mg)*70.906/100.0869};}
const decimalText=v=>known(v)?v.toLocaleString('pt-BR',{useGrouping:false,maximumFractionDigits:20}):'';
const nonMinerals=new Set(['ph','tds','residuo']);
function sortedMinerals(m,order='concentracao'){return fields.filter(([id])=>!nonMinerals.has(id)&&known(m[id])).map(([id,label])=>({id,label,value:m[id]})).sort((a,b)=>(order==='alfabetica'?0:b.value-a.value)||a.label.localeCompare(b.label,'pt-BR'));}
const aliases={bicarbonato:'bicarbonatos?|hidrogenocarbonatos?|hco3-?',calcio:'calcio|ca(?:2\\+)?',magnesio:'magnesio|mg(?:2\\+)?',sodio:'sodio|na\\+?',cloreto:'cloretos?|cl-?',sulfato:'sulfatos?|so4(?:2-|-)?',potassio:'potassio|k\\+?',tds:'tds|solidos(?: totais)? dissolvidos(?: totais)?',residuo:'residuo (?:seco|de evaporacao)(?: a \\d+ ?(?:° ?c|c))?(?:,?\\s+calculado)?',ph:'ph(?:\\s+a\\s+\\d+(?:[.,]\\d+)?\\s*(?:°\\s*c|c))?',cloro:'cloro residual(?: livre| total)?',nitrato:'nitratos?|no3-?',fluoreto:'fluoretos?|f-',silica:'silica|sio2',fosfato:'fosfatos?|po4(?:3-|-)?',bario:'bario|ba(?:2\\+)?',boro:'boro|b',manganes:'manganes|mn(?:2\\+)?',estroncio:'estroncio|sr(?:2\\+)?'};
function normalize(s){return String(s).replace(/[₀₁₂₃₄₅₆₇₈₉]/g,c=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).replace(/[²³⁺⁻−]/g,c=>({'²':'2','³':'3','⁺':'+','⁻':'-','−':'-'}[c])).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\u00a0\u202f]/g,' ').replace(/μ/g,'µ');}
function parseLabel(text){
  const t=normalize(text),hits={},issues=[];
  const all=Object.entries(aliases).map(([k,a])=>`(?<${k}>${a})`).join('|');
  // Do not recognize the unit mg/L as the chemical symbol Mg.
  const labelRe=new RegExp(`(?:^|[^a-z0-9])(${all})(?![a-z0-9]|\\s*\\/)`,'g');
  const unitPattern='(mg|g|ug|µg)\\s*\\/\\s*l\\b';
  const headerRe=new RegExp('(?:composicao(?: quimica| mineral)?|concentracao(?: dos minerais)?|teor(?: mineral)?|valores|minerais)\\s*(?:em\\s+)?[:=]?\\s*\\(?'+unitPattern,'g');
  const headerUnits=[...new Set([...t.matchAll(headerRe)].map(m=>m[1]))];
  const header=headerUnits.length===1?headerUnits[0]:headerUnits.length===0?'mg':null;
  const ionParen=/\((?:hco3-?|ca2?\+?|mg2?\+?|na\+?|cl-?|so42?-?|k\+?|no3-?|f-?|sio2|po43?-?|ba2?\+?|b|mn2?\+?|sr2?\+?)\)/g;
  const lines=t.split(/\r?\n/).map(s=>s.replace(ionParen,''));
  const numberRe=new RegExp('^(\\d+(?:[.,]\\d+)?)(?!\\d|[.,]\\d)\\s*(?:'+unitPattern+')?');
  const prefixUnitRe=new RegExp('^\\(\\s*'+unitPattern+'\\s*\\)\\s*[:=]?\\s*');
  for(let li=0;li<lines.length;li++){
    const line=lines[li],matches=[...line.matchAll(labelRe)];
    for(let i=0;i<matches.length;i++){
      const m=matches[i],key=Object.keys(m.groups).find(k=>m.groups[k]!==undefined);
      const start=m.index+m[0].length,end=i+1<matches.length?matches[i+1].index:line.length;
      let tail=line.slice(start,end).trim().replace(/^[\s:;=.]+/,'');
      let prefixUnit=null;
      const pu=tail.match(prefixUnitRe);if(pu){prefixUnit=pu[1];tail=tail.slice(pu[0].length).trim();}
      // Skip any blank lines, but stop at the first non-empty line. Never jump over another label.
      if(!tail&&i===matches.length-1&&matches.length===1){let j=li+1;while(j<lines.length&&!lines[j].trim())j++;const next=lines[j]?.trim()||'';if(/^(?:[-–—]\s*)?[\d<>≤≥]/.test(next))tail=next;}
      // A spaced dash can be a printed list separator, not a decimal sign. Flag for confirmation.
      if(/^[-–—]\s+(?=\d)/.test(tail)){issues.push(`${key}: traço antes do valor; confirme se é um separador do rótulo.`);tail=tail.replace(/^[-–—]\s+/,'');}
      if(/^[-–—]\d/.test(tail)){issues.push(`${key}: valor negativo ou sinal ambíguo; preencher manualmente.`);continue;}
      if(/^[<>≤≥]/.test(tail)){issues.push(`${key}: limite de quantificação; preencher manualmente.`);continue;}
      const n=tail.match(numberRe);if(!n)continue;
      const rest=tail.slice(n[0].length).trim();
      if(/^(?:\d|[<>≤≥]|(?:mg|g|ug|µg)\s*\/|ppm\b|meq\b|mmol\b|%|µs\b|us\b)/.test(rest)||/^\d+[.,]\d{3}[.,]\d/.test(tail)){issues.push(`${key}: número ou unidade ambígua.`);continue;}
      if(prefixUnit&&n[2]&&prefixUnit!==n[2]){issues.push(`${key}: unidades divergentes; preencher manualmente.`);continue;}
      const unit=n[2]||prefixUnit||header;
      if(key==='ph'&&(n[2]||prefixUnit)){issues.push(`${key}: pH não deve ter unidade de concentração.`);continue;}
      if(key!=='ph'&&!unit){issues.push(`${key}: unidade geral ambígua; preencher manualmente.`);continue;}
      let v=num(n[1]);if(key!=='ph')v*=unit==='g'?1000:unit==='ug'||unit==='µg'?0.001:1;
      if(!known(v)||key==='ph'&&v>14){issues.push(`${key}: valor inválido (${n[1]}); conferir o original.`);continue;}
      if(!hits[key])hits[key]=[];hits[key].push(v);
      if(/^\d+\.\d{3}$/.test(n[1]))issues.push(`${key}: confirme se o ponto é decimal e não separador de milhar.`);
    }
  }
  const values={};for(const [key,vs] of Object.entries(hits)){if(new Set(vs).size===1)values[key]=vs[0];else issues.push(`${key}: valores divergentes; preencher manualmente.`);}return {values,issues};
}
function csv(rows){function cell(v){if(v===null||v===undefined)return '""';let s=typeof v==='number'?String(v).replace('.',','):String(v);if(typeof v!=='number'&&/^[\s\u0000-\u001f]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}return '\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n');}
return {fields,profiles,num,known,fmt,decimalText,sortedMinerals,composition,classify,mix,solve,salts,parseLabel,csv};});
