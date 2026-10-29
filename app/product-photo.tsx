export default function ProductPhoto({id,src,alt}:{id:string;src:string;alt:string}) {
 return id==='felcor-kit-duo' && src==='/assets/duo-reference.png' ? <div className="duo-photo"><img src={src} alt={alt}/></div> : <img src={src} alt={alt} loading="lazy"/>;
}
