'use strict';
const book=window.MORAIS_PAGES, $=selector=>document.querySelector(selector);
const select=$('#page'), scan=$('#scan'), stage=$('#stage');
let current=0;
for(const [i,page] of book.pages.entries()){const option=document.createElement('option');option.value=i;option.textContent=page.label;select.append(option)}
$('#collection').href=book.collection;$('#manifest').href=book.manifest;$('#metadata-source').href=book.collection;
function textElement(tag,text){const element=document.createElement(tag);element.textContent=text;return element}
function updateMetadata(page,index){
 const subjects=$('#page-subjects'),note=$('#page-subjects-note');subjects.replaceChildren();note.replaceChildren();
 for(const id of page.subjects){const subject=book.subjects[id-1],link=textElement('a',subject.term);link.href=`subject.html?id=${id}`;subjects.append(link)}
 if(page.subjects.length)note.textContent='From the original archived index. Select a subject to see its entry and all related pages.';
 else{note.textContent='No subjects are assigned to this scan in the original archived index.';const next=book.pages.findIndex((candidate,i)=>i>index&&candidate.subjects.length);if(next!==-1){note.append(document.createTextNode(' '));const link=textElement('a',`Next page with indexed subjects: ${book.pages[next].label} →`);link.href=`reader.html?page=${next+1}`;note.append(link)}}
 const metadata=$('#page-metadata');metadata.replaceChildren();
 const fields=[['Ledger page',page.label],['Title',book.metadata.Title.join('; ')],['Creator',book.metadata.Name.join('; ')],['Repository / shelfmark',book.metadata['Physical Location'].join('; ')],['Provenance',book.metadata.Provenance.join('; ')]];
 if(page.catalogue_items.length)fields.push(['Ledger item'+(page.catalogue_items.length>1?'s':''),page.catalogue_items.join(', ')]);
 for(const [label,value]of fields)metadata.append(textElement('dt',label),textElement('dd',value));
 const records=$('#page-records');records.replaceChildren();
 for(const record of page.records){const article=document.createElement('article');article.append(textElement('p',record.title));if(record.subtitle)article.append(textElement('p',record.subtitle));const publication=[window.MoraisPublication(record.publication),record.date].filter(Boolean).join(' · ');if(publication)article.append(textElement('p',publication));const details=document.createElement('dl');details.className='clipping-notes';for(const [label,key]of [['Description','description'],['Annotation','added_text'],['References','references'],['Bibliographic reference','bibliography']])if(record[key])details.append(textElement('dt',label),textElement('dd',record[key]));if(details.children.length)article.append(details);records.append(article)}
 const unchecked=page.catalogue_items.filter(id=>!page.records.some(record=>record.id===id));
 if(unchecked.length)records.append(textElement('p',`Descriptions for item${unchecked.length>1?'s':''} ${unchecked.join(', ')} are not yet available.`));
 $('#citation').textContent=`Morais, Sabato. Sabato Morais Scrapbook (Morais Ledger), ledger page ${page.label}. ARC MS8, Library at the Katz Center, University of Pennsylvania Libraries. ${book.collection}. Page reference: ${page.canvas}.`;
 $('#citation-page').href=page.canvas;
}
function requestedPage(){const value=Number(new URLSearchParams(location.search).get('page'));return Number.isInteger(value)&&value>=1&&value<=book.pages.length?value-1:0}
function show(index,push=true){if(index<0||index>=book.pages.length)return;current=index;zoomLevel=1;const page=book.pages[index];updateMetadata(page,index);select.value=String(index);$('#previous').disabled=index===0;$('#next').disabled=index===book.pages.length-1;document.title=`Ledger page ${page.label} · Morais Ledger`;$('#image-status').textContent='Loading page image…';scan.hidden=true;scan.alt=`Sabato Morais Ledger, page ${page.label}`;scan.src=page.image;$('#image-link').href=page.image;stage.scrollTo(0,0);if(push){const url=new URL(location.href);url.searchParams.set('page',String(index+1));url.searchParams.delete('item');history.pushState(null,'',url)}}
scan.addEventListener('load',()=>{scan.hidden=false;layoutZoom(zoomLevel);$('#image-status').textContent=''});
scan.addEventListener('error',()=>{$('#image-status').textContent='The image could not load. Try opening the full image or visit Penn’s digital collection.'});
$('#previous').addEventListener('click',()=>show(current-1));$('#next').addEventListener('click',()=>show(current+1));select.addEventListener('change',()=>show(Number(select.value)));
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||event.target.closest('input,select,textarea,button,a')||event.target.isContentEditable)return;if(event.key==='ArrowLeft'){event.preventDefault();show(current-1)}if(event.key==='ArrowRight'){event.preventDefault();show(current+1)}});
let zoomLevel=1, drag=null;
const surface=$('#scan-surface');
function layoutZoom(level,clientX,clientY){
 if(!scan.naturalWidth||scan.hidden)return;
 const bounds=stage.getBoundingClientRect(),vw=stage.clientWidth,vh=stage.clientHeight;
 const x=clientX===undefined?vw/2:clientX-bounds.left-stage.clientLeft;
 const y=clientY===undefined?vh/2:clientY-bounds.top-stage.clientTop;
 const oldWidth=scan.offsetWidth||1,oldHeight=scan.offsetHeight||1;
 const imageX=(stage.scrollLeft+x-scan.offsetLeft)/oldWidth,imageY=(stage.scrollTop+y-scan.offsetTop)/oldHeight;
 zoomLevel=Math.max(1,Math.min(8,level));
 const fit=Math.min(vw/scan.naturalWidth,vh/scan.naturalHeight);
 const width=scan.naturalWidth*fit*zoomLevel,height=scan.naturalHeight*fit*zoomLevel;
 const left=Math.max(0,(vw-width)/2),top=Math.max(0,(vh-height)/2);
 surface.style.width=`${Math.max(vw,width)}px`;surface.style.height=`${Math.max(vh,height)}px`;
 Object.assign(scan.style,{width:`${width}px`,height:`${height}px`,left:`${left}px`,top:`${top}px`});
 stage.scrollLeft=left+imageX*width-x;stage.scrollTop=top+imageY*height-y;
 $('#zoom-out').disabled=zoomLevel<=1;$('#zoom-in').disabled=zoomLevel>=8;
 $('#zoom-level').textContent=`${Math.round(zoomLevel*100)}%`;
 stage.classList.toggle('zoomed',zoomLevel>1);
}
function resetZoom(){layoutZoom(1);stage.scrollTo(0,0)}
$('#zoom-in').addEventListener('click',()=>layoutZoom(zoomLevel*1.25));
$('#zoom-out').addEventListener('click',()=>layoutZoom(zoomLevel/1.25));
$('#zoom-reset').addEventListener('click',resetZoom);
stage.addEventListener('wheel',event=>{if(scan.hidden)return;event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1);layoutZoom(zoomLevel*Math.exp(-Math.max(-100,Math.min(100,delta))*.004),event.clientX,event.clientY)},{passive:false});
stage.addEventListener('pointerdown',event=>{if(event.button!==0||zoomLevel<=1)return;drag={x:event.clientX,y:event.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(event.pointerId);stage.classList.add('dragging');event.preventDefault()});
stage.addEventListener('pointermove',event=>{if(!drag)return;stage.scrollLeft=drag.left+drag.x-event.clientX;stage.scrollTop=drag.top+drag.y-event.clientY});
function endDrag(){drag=null;stage.classList.remove('dragging')}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
stage.addEventListener('keydown',event=>{if(['+','=','-','0'].includes(event.key)){event.preventDefault();if(event.key==='0')resetZoom();else layoutZoom(zoomLevel*(event.key==='-'?1/1.25:1.25))}});
new ResizeObserver(()=>layoutZoom(zoomLevel)).observe(stage);

window.addEventListener('popstate',()=>show(requestedPage(),false));show(requestedPage(),false);

// Download the current page from the existing IIIF Image API service.
$('#download-image').addEventListener('click',async()=>{
 const page=book.pages[current],button=$('#download-image'),status=$('#download-status');
 const imageUrl=page.image.replace('/full/1600,/','/full/max/');
 button.disabled=true;status.hidden=false;status.textContent='Preparing page image…';
 try{
  const response=await fetch(imageUrl);if(!response.ok)throw new Error('Image download failed');
  const blob=await response.blob();if(!blob.type.startsWith('image/'))throw new Error('Image unavailable');
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`morais-ledger-page-${page.label.replace(/[^a-z0-9-]/gi,'-')}.jpg`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  status.textContent='';status.hidden=true;
 }catch(error){status.replaceChildren(document.createTextNode('Download unavailable. '));const link=textElement('a','Open the page image to save it');link.href=imageUrl;link.target='_blank';link.rel='noopener';status.append(link)}
 finally{button.disabled=false}
});
