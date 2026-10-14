'use strict';
const data=window.MORAIS_DATA,params=new URLSearchParams(location.search),raw=params.get('id');
const number=Number(raw),subject=raw!==null&&Number.isInteger(number)&&number>=1?data.index[number-1]:null;
const $=s=>document.querySelector(s);
function text(tag,value){const node=document.createElement(tag);node.textContent=value;return node}
if(!subject){$('#subject-title').textContent='Subject entry not found';$('#subject-count').textContent='Choose a heading from the name and subject index.';$('#subject-source').hidden=true}
else{
 document.title=`${subject.term} · Morais Ledger`;$('#subject-title').textContent=subject.term;
 $('#subject-source').href=subject.source;
 const items=[...new Map(subject.items.map(item=>[item.id,item])).values()];
 $('#subject-count').textContent=`${items.length} ledger item${items.length===1?'':'s'} · ${new Set(items.map(item=>item.page_position)).size} scan${new Set(items.map(item=>item.page_position)).size===1?'':'s'}`;
 const records=new Map(data.records.map(record=>[record.id,record]));
 for(const item of items){const scan=data.scans[item.id],record=records.get(item.id),article=document.createElement('article');article.className='subject-item';article.append(text('div',item.id));const body=document.createElement('div');body.append(text('h2',record?record.title:`Ledger item ${item.id}`));
 if(record)body.append(text('p',`${window.MoraisPublication(record.publication)} · ${record.date}`));else body.append(text('p','Item description not yet available.'));
 const link=text('a',`Read ledger page ${scan.page_label} →`);link.href=`reader.html?page=${scan.original_sceti_position}`;body.append(link);article.append(body);$('#subject-items').append(article)}
}
