import fs from 'node:fs';
const files=fs.readdirSync('src',{recursive:true}).filter(f=>/\.(tsx|ts)$/.test(f));
const groups=new Map();
const colorMap={
 'bg-surface':['#fff','#ffffff','#0f172a','#111827','#1e293b','#0b1222','#0b1120','#131d36','#18233a','#162032','#1f2937','#0b0f19'],
 'bg-muted':['#f8fafc','#f1f5f9','#f9fafb','#f3f4f6','#fafafa','#f4f4f5'],
 'text-primary':['#0f172a','#111827','#172033','#1e293b','#18181b'],
 'text-secondary':['#334155','#475569','#374151','#4b5563'],
 'text-muted':['#64748b','#718096','#667085','#94a3b8','#6b7280'],
 'border-default':['#e2e8f0','#cbd5e1','#d1d5db','#e5e7eb','#334155','#1e293b','#1f2937','#28395f']
};
function add(cls,prop,token){const key=`${prop}: var(--disk-${token}) !important;`;if(!groups.has(key))groups.set(key,new Set());groups.get(key).add(cls);}
for(const f of files){const src=fs.readFileSync('src/'+f,'utf8');for(const m of src.matchAll(/\b(bg|text|border)-\[(#[\da-fA-F]{3,8})\](?!\/)/g)){const [,kind,c]=m;const token=Object.entries(colorMap).find(([key,values])=>key.startsWith(kind==='text'?'text':kind==='bg'?'bg':'border')&&values.includes(c.toLowerCase()))?.[0];if(token)add(m[0],kind==='bg'?'background-color':kind==='text'?'color':'border-color',token);}}
for(const family of ['slate','gray','zinc','neutral']){
 for(const shade of [50,100,200,700,800,900,950])add(`bg-${family}-${shade}`,'background-color',shade<=100?'bg-muted':'bg-surface');
 for(const shade of [500,600,700,800,900,950])add(`text-${family}-${shade}`,'color',shade>=800?'text-primary':shade>=600?'text-secondary':'text-muted');
 for(const shade of [100,200,300,700,800])add(`border-${family}-${shade}`,'border-color','border-default');
}
const lines=['/* Compatibilidade de utilitários neutros legados no tema grafite. Cores semânticas não são remapeadas. */'];
for(const [decl,classes] of groups){lines.push(`html.dark :is(\n  ${[...classes].flatMap(c=>[c,'dark:'+c]).sort().map(c=>`[class~="${c}"]`).join(',\n  ')}\n) { ${decl} }`);}
fs.writeFileSync('src/styles/disk-reference-utilities.css',lines.join('\n')+'\n');
console.log([...groups.values()].reduce((n,v)=>n+v.size,0),'utilitários neutros');

