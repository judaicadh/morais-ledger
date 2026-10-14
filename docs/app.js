'use strict';
const $=s=>document.querySelector(s);
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase();
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function link(text,url){const a=el('a',text);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener'}return a}
Promise.resolve(window.MORAIS_DATA).then(data=>{
const itemSubjects=new Map();
for(const [index,subject]of data.index.entries())for(const id of new Set(subject.items.map(item=>item.id))){if(!itemSubjects.has(id))itemSubjects.set(id,[]);itemSubjects.get(id).push({term:subject.term,id:index+1})}

const years=[...new Set(data.records.map(r=>r.date.match(/\b\d{4}\b/)?.[0]).filter(Boolean))].sort();
const pubs=[...new Set(data.records.map(r=>window.MoraisPublicationFilter(r.publication)))].sort((a,b)=>a.replace(/^The /,'').localeCompare(b.replace(/^The /,'')));
for(const v of pubs){const o=el('option',v);o.value=v;$('#publication').append(o)}
const firstYear=Number(years[0]),lastYear=Number(years.at(-1));
const startYear=$('#year-start'),endYear=$('#year-end'),fromYear=$('#year-from'),toYear=$('#year-to');
for(const input of [startYear,endYear,fromYear,toYear]){input.min=String(firstYear);input.max=String(lastYear)}
startYear.value=startYear.defaultValue=String(firstYear);endYear.value=endYear.defaultValue=String(lastYear);
fromYear.value=fromYear.defaultValue=String(firstYear);toYear.value=toYear.defaultValue=String(lastYear);
function updateYearRange(changed){
 if(Number(startYear.value)>Number(endYear.value)){if(changed===startYear)startYear.value=endYear.value;else endYear.value=startYear.value}
 const start=Number(startYear.value),end=Number(endYear.value),all=start===firstYear&&end===lastYear;
 $('#year-range-label').textContent=all?`All years · ${start}–${end}`:start===end?String(start):`${start}–${end}`;
 fromYear.value=String(start);toYear.value=String(end);
 startYear.setAttribute('aria-valuetext',String(start));endYear.setAttribute('aria-valuetext',String(end));
 const slider=$('.year-slider');slider.style.setProperty('--range-start',`${100*(start-firstYear)/(lastYear-firstYear)}%`);slider.style.setProperty('--range-end',`${100*(end-firstYear)/(lastYear-firstYear)}%`);
 startYear.style.zIndex=start===lastYear?'3':'2';
}

function render(){const query=normalize($('#query').value).trim(),pub=$('#publication').value,start=Number(startYear.value),end=Number(endYear.value),allYears=start===firstYear&&end===lastYear;
const rows=data.records.filter(r=>(!pub||window.MoraisPublicationFilter(r.publication)===pub)&&(allYears||(()=>{const year=Number(r.date.match(/\b\d{4}\b/)?.[0]);return year>=start&&year<=end})())&&normalize(`${r.id} ${r.title} ${window.MoraisPublication(r.publication)} ${r.date} ${r.original_title} ${r.subtitle||''} ${r.description||''} ${r.added_text||''} ${r.references||''}`).includes(query));
$('#records').replaceChildren();$('#count').textContent=`${rows.length} of ${data.records.length} searchable descriptions · Full ledger: 831 items`;
for(const r of rows){
 const article=el('article',undefined,'record');article.id='item-'+r.id;const body=el('div'),scan=data.scans[r.id];
 const title=el('h3');title.append(link(r.title,`reader.html?page=${scan.original_sceti_position}`));body.append(title,el('p',`${window.MoraisPublication(r.publication)} · ${r.date}`,'meta'));
 const subjects=el('div',undefined,'record-subjects');subjects.setAttribute('aria-label','Associated names and subjects');subjects.append(el('span','Names & subjects','subjects-label'));
 const list=el('div',undefined,'record-subject-links');for(const subject of itemSubjects.get(r.id)||[])list.append(link(subject.term,`subject.html?id=${subject.id}`));
 subjects.append(list);if(list.children.length)body.append(subjects);article.append(el('div',r.id,'number'),body);$('#records').append(article)
}
if(!rows.length)$('#records').append(el('p','No matching descriptions. Try a different search or clear the filters.'));
}
let selectedLetter='All';
for(const letter of ['All',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']){
 const button=el('button',letter);button.type='button';button.setAttribute('aria-pressed',String(letter===selectedLetter));
 if(letter==='X'){button.disabled=true;button.title='No X section in the original index';button.setAttribute('aria-label','X: no section in the original index')}
 else button.addEventListener('click',()=>{selectedLetter=letter;for(const b of $('#alphabet').children)b.setAttribute('aria-pressed',String(b.textContent===letter));renderIndex()});
 $('#alphabet').append(button);
}
function renderIndex(){const q=normalize($('#indexquery').value).trim();
 const rows=data.index.filter(r=>(selectedLetter==='All'||r.letter===selectedLetter)&&normalize(r.term+' '+r.original_term).includes(q));
 $('#headings').replaceChildren();$('#indexcount').textContent=`${rows.length} of ${data.index.length} index entries · ${selectedLetter==='All'?'All letters':'Section '+selectedLetter}`;
 for(const r of rows){const article=el('article',undefined,'heading'+(r.indented?' indented':''));const body=el('div');const title=el('h3');title.append(link(r.term,`subject.html?id=${data.index.indexOf(r)+1}`));body.append(title);
 article.append(body);const refs=el('div',undefined,'refs');
 for(const item of r.items){const scan=data.scans[item.id];const a=link(item.id,`reader.html?page=${scan.original_sceti_position}`);a.setAttribute('aria-label',`Item ${item.id}, read ledger page ${scan.page_label}`);refs.append(a)}
 article.append(refs);$('#headings').append(article)}
 if(!rows.length)$('#headings').append(el('p','No matching index entries. Try All letters or another search.'));
}
function applyTypedYear(input,slider,commit){
 const value=input.valueAsNumber;
 if(!commit&&(!Number.isInteger(value)||value<firstYear||value>lastYear))return;
 if(Number.isFinite(value))slider.value=String(Math.min(lastYear,Math.max(firstYear,Math.round(value))));
 updateYearRange(slider);render();
}
for(const [input,slider]of [[fromYear,startYear],[toYear,endYear]]){
 input.addEventListener('input',()=>applyTypedYear(input,slider,false));
 input.addEventListener('change',()=>applyTypedYear(input,slider,true));
 input.addEventListener('blur',()=>applyTypedYear(input,slider,true));
}
$('#searchform').addEventListener('submit',e=>{e.preventDefault();render()});$('#query').addEventListener('input',render);$('#publication').addEventListener('change',render);for(const input of [startYear,endYear])input.addEventListener('input',()=>{updateYearRange(input);render()});$('#searchform').addEventListener('reset',()=>setTimeout(()=>{updateYearRange();render()},0));$('#indexquery').addEventListener('input',renderIndex);updateYearRange();render();renderIndex();
}).catch(()=>{$('#count').textContent='The ledger data could not be loaded. Please reload this page.'});
