export default function Brand({ light = false }) {
  return <a className={`inline-flex items-center gap-[3px] text-2xl font-bold tracking-[-1.5px] ${light ? 'text-white' : 'text-navy'}`} href="#home" aria-label="Dot home"><span className={`grid h-[26px] w-[26px] place-items-center rounded-full pb-[10px] font-serif text-[32px] leading-none tracking-normal ${light ? 'bg-ivory text-navy' : 'bg-slate text-white'}`}>·</span><span>dot</span></a>
}
