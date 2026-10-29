export default function ProductPhoto({id,src,alt}:{id:string;src:string;alt:string}) {
 const image = id==='felcor-kit-duo' && (src==='/assets/duo-reference.png' || src==='/assets/felcor-duo-studio.png' || src==='/assets/felcor-duo-editorial-v2.png') ? '/assets/felcor-duo-white-approved.png' : src;
 return <img className={id==='felcor-kit-duo'?'kit-packshot':undefined} src={image} alt={alt} loading="lazy"/>;
}
