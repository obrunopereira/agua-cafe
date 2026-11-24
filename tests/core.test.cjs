const test=require('node:test'),assert=require('node:assert/strict'),C=require('../public/core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('conversões e campos desconhecidos',()=>{const d=C.composition({bicarbonato:48.8,calcio:20,magnesio:6});near(d.a,40.00136);near(d.h,74.648);assert.equal(C.composition({calcio:10}).h,null);assert.equal(C.composition({calcio:0,magnesio:0}).h,0);});
test('validação decimal brasileira',()=>{assert.equal(C.num('2,5'),2.5);assert.equal(C.num(''),null);for(const x of ['-1','1e3','12abc','Infinity','1.234,56'])assert.ok(Number.isNaN(C.num(x)));});
test('OCR: nomes, símbolos, tabela em uma linha',()=>{assert.deepEqual(C.parseLabel('Composição (mg/L)\nCálcio (Ca²⁺) 20,00\nMagnésio (Mg²⁺) 6,0\nHCO₃⁻ 48.8\nSódio 8,4 Cloreto 3,5').values,{calcio:20,magnesio:6,bicarbonato:48.8,sodio:8.4,cloreto:3.5});});
test('OCR: g/L, limites, divergências e distinções',()=>{const d=C.parseLabel('Composição química (g/L)\nCa 0,02\nMg <0,001\nBicarbonatos 0,04\nBicarbonatos 0,05\nCloreto 0,004\nResíduo seco 0,2\nTDS 0,21');assert.equal(d.values.calcio,20);assert.equal(d.values.magnesio,undefined);assert.equal(d.values.bicarbonato,undefined);assert.equal(d.values.cloreto,4);assert.equal(d.values.cloro,undefined);assert.equal(d.values.residuo,200);assert.equal(d.values.tds,210);assert.ok(d.issues.length>=2);});
test('mistura e solução',()=>{assert.deepEqual(C.mix(80,120,0,0,.5,1000),{a:40,h:60,va:500,vb:500});near(C.solve(80,20,35),.25);assert.equal(C.solve(20,30,40),null);});
test('sais hidratados',()=>{const r=C.salts(0,0,40,70,1,.5);near(r.bicarb,40*84.0066/50.043);near(r.mg,35*246.47/100.0869);near(r.ca,35*147.014/100.0869);assert.equal(C.salts(50,70,40,70,1,.5),null);});
test('CSV brasileiro e proteção de fórmulas',()=>{assert.equal(C.csv([['A',2.5,'=1+1','x"y',null]]),'\ufeff"A";"2,5";"\'=1+1";"x""y";""');});
test('texto corrido e unidades individuais',()=>{assert.deepEqual(C.parseLabel('Composição mineral em mg/L: bicarbonatos 48,8 mg/L, cálcio 0,02 g/L; magnésio 6 mg/L; pH 7,2.').values,{bicarbonato:48.8,calcio:20,magnesio:6,ph:7.2});});
test('texto de rótulo com marcadores, linhas quebradas e unidades antes do valor',()=>{assert.deepEqual(C.parseLabel('• Bicarbonato – 48,8\n• Cálcio (mg/L): 20\n• Magnésio:\n6,0\nSO₄²⁻ 4,8\nFluoreto 120 µg/L').values,{bicarbonato:48.8,calcio:20,magnesio:6,sulfato:4.8,fluoreto:.12});});
test('unidades explícitas e limites ambíguos',()=>{const d=C.parseLabel('Cálcio: 12 mg/100 mL\nMg: < 1\nSódio (g/L): 3 mg/L\npH 7 mg/L\nBicarbonato 1.234,56');assert.deepEqual(d.values,{});assert.ok(d.issues.length>=4);});
test('rótulo real enviado: linhas em branco, traço e parâmetros físico-químicos',()=>{
 const r=C.parseLabel(`Bicarbonato
109,41
Fluoreto

0,93
Sódio
35,662
Fosfato
0,73
Cálcio
3,719
Bário

0,134
Potássio
2,885
Nitrato

0,05
Sulfato
1,82
Boro

0,050
Magnésio
1,301
Manganês

0,042
Cloreto
0,97
Estrôncio

- 0,039

Características Físico-Químicas



pH a 25 °C

742•

Temperatura da água na fonte

22,9 °C

Condutividade a 25 °C

177,4 pS/cm

Residuo de evaporação a 180 °C, calculado

144,66 mg/L`);
 assert.deepEqual(r.values,{bicarbonato:109.41,fluoreto:.93,sodio:35.662,fosfato:.73,calcio:3.719,bario:.134,potassio:2.885,nitrato:.05,sulfato:1.82,boro:.05,magnesio:1.301,manganes:.042,cloreto:.97,estroncio:.039,residuo:144.66});
 assert.ok(r.issues.some(s=>s.includes('ph:')&&s.includes('742')));assert.ok(r.issues.some(s=>s.includes('estroncio:')));
});
test('linhas vazias sem saltar outro mineral; pH com temperatura',()=>{assert.deepEqual(C.parseLabel('Bicarbonato\n\nCálcio\n\n3.719\nMagnésio\n1,301\npH a 25 °C\n\n7.42').values,{calcio:3.719,magnesio:1.301,ph:7.42});});
test('decimal equivalente e sem truncamento significativo',()=>{assert.equal(C.num('3.719'),C.num('3,719'));assert.equal(C.decimalText(3.719),'3,719');assert.equal(C.decimalText(.039),'0,039');assert.equal(C.decimalText(109.41),'109,41');assert.equal(C.decimalText(0),'0');});
test('ordenação numérica e alfabética exclui indicadores agregados',()=>{const m={bicarbonato:109.41,calcio:3.719,magnesio:1.301,fluoreto:0,sodio:35.662,ph:7.42,residuo:144.66,tds:140};assert.deepEqual(C.sortedMinerals(m).map(r=>r.id),['bicarbonato','sodio','calcio','magnesio','fluoreto']);assert.deepEqual(C.sortedMinerals(m,'alfabetica').map(r=>r.id),['bicarbonato','calcio','fluoreto','magnesio','sodio']);});
test('preenchimento programático do OCR e texto usa vírgula em inputs de texto',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require('node:path').join(__dirname,'../public/app.js'),'utf8');
 // Exercita as funções reais da interface com um DOM mínimo, sem emular o Safari inteiro.
 const elements={};
 function field(id){return elements[id]??=( {tagName:'INPUT',type:'number',value:'',attrs:{inputmode:'decimal'},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;},classList:{add(){}},parentElement:{},hidden:true} );}
 const ctx=vm.createContext({WaterCore:C,document:{getElementById:field},analyze:()=>{}});
 const base=source.slice(source.indexOf('const C=WaterCore'),source.indexOf('let db,'));
 const helpers=source.slice(source.indexOf('function isDecimalInput('),source.indexOf('document.addEventListener(\'input\''));
 const apply=source.slice(source.indexOf('function applyOCR(){'),source.indexOf("$('parseText').onclick"));
 vm.runInContext(base+helpers+apply,ctx);
 field('ocrText').value='Bicarbonato\n109,41\nCálcio\n3.719\nMagnésio\n1,301\nEstrôncio\n0.039';
 vm.runInContext('applyOCR()',ctx);
 for(const [id,display,value] of [['bicarbonato','109,41',109.41],['calcio','3,719',3.719],['magnesio','1,301',1.301],['estroncio','0,039',.039]]){
  assert.equal(field(id).type,'text');assert.equal(field(id).value,display);assert.equal(C.num(field(id).value),value);
 }
 vm.runInContext("set('calcio','4.125'); set('magnesio',0);",ctx);
 assert.equal(field('calcio').value,'4,125');assert.equal(field('magnesio').value,'0');
 field('calcio').value='3.719';field('calcio').selectionStart=5;field('calcio').setSelectionRange=()=>{};
 vm.runInContext("normalizeDecimalInput($('calcio'))",ctx);assert.equal(field('calcio').value,'3,719');
});
