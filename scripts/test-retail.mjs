import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function source(path){const js=ts.transpileModule(await readFile(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const {catalogAvailability,enoughStock}=await source('lib/availability.ts');
const rows=[{id:'felcor-pasta-modeladora',active:true,stock:5},{id:'felcor-toque-umido',active:true,stock:3},{id:'felcor-kit-duo',active:true,stock:999}];
assert.equal(catalogAvailability(rows)[2].stock,3);
assert(enoughStock(rows,[{id:'felcor-kit-duo',quantity:2},{id:'felcor-toque-umido',quantity:1}]));
assert.equal(enoughStock(rows,[{id:'felcor-kit-duo',quantity:3},{id:'felcor-toque-umido',quantity:1}]),false);
assert.equal(catalogAvailability(rows.map(p=>({...p,active:p.id!=='felcor-toque-umido'})))[2].stock,0);
const {handoffCart}=await source('lib/cart-handoff.ts');const calls=[];
const actions={clearStorage:()=>calls.push('storage'),clearCart:()=>calls.push('cart'),navigate:()=>calls.push('navigate')};
handoffCart('https://wa.me/5511939002074?text=pedido',actions);assert.deepEqual(calls,['storage','cart','navigate']);
calls.length=0;assert.throws(()=>handoffCart('https://other.example',actions));assert.deepEqual(calls,[]);
assert.throws(()=>handoffCart('https://wa.me/5511939002074',{...actions,clearStorage:()=>{throw Error('storage unavailable');}}));assert.deepEqual(calls,[]);
console.log('PASS: duo availability, combined stock, inactive components, cart clearing before navigation and preservation on invalid link/storage failure.');
