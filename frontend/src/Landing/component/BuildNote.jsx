export default function BuildNote() {
    return (
        <section className="mx-auto grid min-h-[370px] w-[min(1160px,calc(100%-64px))] grid-cols-[.55fr_1.2fr_.7fr] items-center gap-[35px] py-20 max-md:w-[calc(100%-40px)] max-md:grid-cols-[1fr_auto] max-md:gap-[18px] max-md:py-[67px]">
            {/* Logo */}
            <div className="max-md:col-span-2">
                <img src="/logo.png" alt="Dot" className="h-10 w-auto md:h-12" />
            </div>

            {/* Note */}
            <div>
                <span className="text-[9px] font-bold uppercase tracking-[1.6px] text-slate">A note from the maker</span>
                <h2 className="my-4 font-serif text-[43px] leading-[1.08] tracking-[-1.8px] max-md:text-[38px]">
                    Made with care, for
                    <br />
                    <em className="text-slate">the everyday moments.</em>
                </h2>
                <p className="max-w-[440px] text-xs leading-[1.8] text-muted max-md:text-[11px]">
                    Dot is being built to make everyday routines a little more meaningful and bring people closer through the
                    things they do.
                </p>
                <span className="mt-5 block text-[10px] text-muted">
          Designed and built by <b className="font-semibold text-navy">Mohit Godara.</b>
        </span>
            </div>

            {/* Stamp */}
            <div className="relative flex h-[150px] w-[150px] -rotate-12 items-center justify-center justify-self-end rounded-full border border-dusty font-serif text-sm italic text-slate before:absolute before:inset-[9px] before:rounded-full before:border before:border-dusty/45 after:absolute after:-inset-[9px] after:rounded-full after:border after:border-dusty/45 max-md:row-start-2 max-md:h-[90px] max-md:w-[90px] max-md:text-[10px]">
                growing <i className="mx-1 text-[25px] not-italic text-dusty max-md:text-[17px]">·</i> together
            </div>
        </section>
    )
}