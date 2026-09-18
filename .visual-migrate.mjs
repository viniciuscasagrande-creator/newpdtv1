import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';

// Migrate presentation values only. Navigation, chart palettes and print styles are excluded.
const apply = process.argv.includes('--apply');
const neutral = {
  white: new Set(['white','#fff','#ffffff']),
  pale: new Set(['#f8fafc','#f1f5f9','#f9fafb','#f3f4f6','#fafafa','#f4f4f5','#f4f6fa','#f4f6f9','#f7f9fc','#f7fafc','#f8f9fa','#f7fbff','#f5f7fa','#eef2f7','#edf0f4','#f6f8fb','#f8fafb']),
  border: new Set(['#e2e8f0','#cbd5e1','#d1d5db','#e5e7eb','#e4e4e7','#d4d4d8','#dfe4ec','#dbe3ee','#dbe4ee','#dce3ea','#d7dee8','#e6eaf0','#edf2f7','#e8edf4','#e5eaf1','#d9e0e9']),
  dark: new Set(['#0f172a','#111827','#1e293b','#172033','#0e1726','#111a2e','#0b1120','#0b1222','#18233a','#202938','#1f2937','#0b0f19','#0f1729','#101828','#18181b','#27272a']),
  secondary: new Set(['#334155','#475569','#374151','#4b5563','#3f3f46','#52525b']),
  muted: new Set(['#64748b','#718096','#667085','#6b7280','#71717a','#94a3b8','#9ca3af','#a1a1aa'])
};
const token = x => `var(--disk-${x})`;
const semantic = {
 success: { bg: ['#ecfdf5','#f0fdf4','#dcfce7','#d1fae5'], border: ['#bbf7d0','#a7f3d0','#a7f3d0'], text: ['#065f46','#047857','#166534','#15803d'] },
 warning: { bg: ['#fffbeb','#fef3c7'], border: ['#fde68a','#fcd34d'], text: ['#92400e','#b45309','#78350f'] },
 danger: { bg: ['#fef2f2','#fee2e2','#fff1f2','#ffe4e6'], border: ['#fecaca','#fda4af'], text: ['#991b1b','#b91c1c','#9f1239'] },
 info: { bg: ['#eff6ff','#dbeafe','#f0f9ff','#e0f2fe','#eef5ff','#eaf4ff','#eaf3ff'], border: ['#bfdbfe','#bae6fd'], text: ['#1e40af','#1d4ed8','#075985','#0369a1'] },
 purple: { bg: ['#f5f3ff','#ede9fe','#faf5ff','#f3e8ff'], border: ['#ddd6fe','#c4b5fd'], text: ['#6d28d9','#5b21b6','#6b21a8'] }
};
for (const c of ['#f7f8fb','#f6f7fb','#f6f8fc','#f8fbff','#f5f7fb','#f8faff','#fbfdff','#fcfdff','#f4f7fb']) neutral.pale.add(c);
function mapColor(prop, value) {
 const c=value.toLowerCase();
 for (const [name, values] of Object.entries(semantic)) {
  if (/^background/.test(prop) && values.bg.includes(c)) return token(`color-${name}-subtle`);
  if (/^border/.test(prop) && values.border.includes(c)) return token(`color-${name}-border`);
  if (prop === 'color' && values.text.includes(c)) return token(`color-${name}-text`);
 }
 if (/^background/.test(prop)) {
  if(neutral.white.has(c)) return token('bg-surface');
  if(neutral.pale.has(c)) return token('bg-muted');
  if(neutral.border.has(c)) return token('bg-active');
  if(neutral.dark.has(c)) return `var(--disk-legacy-dark-surface, ${value})`;
 }
 if(prop==='color') {
  if(neutral.dark.has(c)) return token('text-primary');
  if(neutral.secondary.has(c)) return token('text-secondary');
  if(neutral.muted.has(c)) return token('text-muted');
 }
 if(/^border/.test(prop) && (neutral.border.has(c)||neutral.pale.has(c)||neutral.secondary.has(c)||neutral.dark.has(c))) return token('border-default');
 return value;
}
function transform(prop,value) {
 // Keep existing variables, semantic gradients, images, shadows and transparency intact.
 if(value.includes('var(')||value.includes('url('))return value;
 if(value.includes('gradient(')) {
  const colors=value.match(/#[\da-f]{3,8}\b/gi)||[];
  if(!colors.length||colors.some(c=>!Object.values(neutral).some(s=>s.has(c.toLowerCase()))))return value;
 }
 return value.replace(/#[\da-f]{3,8}\b|\bwhite\b/gi,c=>mapColor(prop,c));
}
const report=[];
for(const rel of fs.readdirSync('src',{recursive:true})) {
 const file=path.join('src',rel);
 if(!/\.(css|tsx)$/.test(rel)||/Sidebar|App\.tsx|navigation|layout[\\/]App|design-system[\\/]tokens|disk-reference|sidebar|responsive|limitless-disk|disk-master|disk-limitless/i.test(rel))continue;
 const source=fs.readFileSync(file,'utf8');let output=source;let count=0;
 if(rel.endsWith('.css')) {
  const ast=postcss.parse(source);
  ast.walkDecls(d=>{
   let p=d.parent;let excluded=false;
   while(p){if(p.type==='atrule'&&(/keyframes/.test(p.name)||p.params?.includes('print')||p.name==='theme'))excluded=true;if(p.type==='rule'&&/sidebar|module-nav|event-back|collapsible|topbar|global-brand|navbar|mobile-nav|cover|avatar|login|brand|logo/i.test(p.selector))excluded=true;p=p.parent;}
   if(excluded||! /^(color|background(-color)?|border(-[a-z-]+)?)$/.test(d.prop))return;
   const next=transform(d.prop,d.value);if(next!==d.value){d.value=next;count++;}
  });
  output=ast.toString();
 } else {
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const changes=[];
  function visit(node){
   if(ts.isJsxAttribute(node)&&node.name.getText(ast)==='style'&&node.initializer){
    function styleVisit(n){
     if(ts.isPropertyAssignment(n)&&['color','background','backgroundColor','border','borderColor','borderBottom','borderTop','borderLeft','borderRight'].includes(n.name.getText(ast))&&ts.isStringLiteral(n.initializer)){
      const prop=n.name.getText(ast).replace(/[A-Z]/g,c=>'-'+c.toLowerCase());const next=transform(prop,n.initializer.text);
      if(next!==n.initializer.text){changes.push({start:n.initializer.getStart(ast),end:n.initializer.end,text:JSON.stringify(next)});count++;}
     }ts.forEachChild(n,styleVisit);
    }styleVisit(node.initializer);
   }else ts.forEachChild(node,visit);
  }visit(ast);
  for(const c of changes.sort((a,b)=>b.start-a.start))output=output.slice(0,c.start)+c.text+output.slice(c.end);
 }
 if(count){report.push({file,count});if(apply)fs.writeFileSync(file,output);}
}
console.log(JSON.stringify({apply,files:report.length,declarations:report.reduce((a,x)=>a+x.count,0),report},null,2));
