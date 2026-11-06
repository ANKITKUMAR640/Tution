import { useEffect,useState } from 'react';
import { readStore } from '../../utils/storage';
export default function ManagedContent({section}){
 const key=`content_${section}`;
 const [items,setItems]=useState(()=>readStore(key,[]).filter(x=>x.published!==false));
 useEffect(()=>{const refresh=()=>setItems(readStore(key,[]).filter(x=>x.published!==false));window.addEventListener('storage',refresh);return()=>window.removeEventListener('storage',refresh)},[key]);
 if(!items.length)return null;
 return <section className="section container managed-content"><div className="managed-content-grid">{items.map(item=><article className="managed-content-card" key={item.id}>{item.image&&<img src={item.image} alt={item.title||''}/>}<div><h3>{item.title}</h3><p>{item.description}</p>{item.attachment&&<a href={item.attachment} target="_blank" rel="noreferrer">View attachment</a>}</div></article>)}</div></section>;
}
