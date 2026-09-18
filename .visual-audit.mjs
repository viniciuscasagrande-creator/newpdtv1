import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
const files=fs.readdirSync('src',{recursive:true}).filter(f=>f.endsWith('.css'));
const colors=new Map();
for(const f of files){if(f.includes('design-system')||f.includes('reference')||f.includes('sidebar'))continue;const ast=postcss.parse(fs.readFileSync(path.join('src',f),'utf8'));ast.walkDecls(d=>{if(/^(background(-color)?|color|border(-.*)?)$/.test(d.prop)){for(const c of d.value.match(/#[\da-f]{3,8}\b/gi)||[])colors.set(c.toLowerCase(),(colors.get(c.toLowerCase())||0)+1)}})}
console.log([...colors].sort((a,b)=>b[1]-a[1]).slice(0,65));
