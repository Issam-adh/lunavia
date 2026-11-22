// Static entry points let direct links and refreshes work on ordinary static hosts.
import { mkdirSync, copyFileSync } from 'node:fs';
const routes=['omra','destinations','contact','agence','voyage/tozeur-sahara','voyage/istanbul','voyage/cappadoce','voyage/sidi-bou-said'];
for(const route of routes){mkdirSync(`dist/${route}`,{recursive:true});copyFileSync('dist/index.html',`dist/${route}/index.html`);}
console.log(`Created ${routes.length} static route entry points.`);
