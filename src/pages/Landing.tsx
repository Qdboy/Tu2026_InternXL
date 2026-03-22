import politiULogo from "@/assets/PolitiULogo.png";

export default function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-dark-char relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Decorative radial glows */}
        <div className="absolute -top-30 -left-30 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(232,86,10,0.18)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[320px] h-[320px] bg-[radial-gradient(circle,rgba(107,191,42,0.1)_0%,transparent_65%)] pointer-events-none" />

        {/* Speckle dots */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle 2px at 12% 22%, rgba(107,191,42,0.25) 100%, transparent),
              radial-gradient(circle 2px at 88% 16%, rgba(232,86,10,0.25) 100%, transparent),
              radial-gradient(circle 2px at 78% 78%, rgba(107,191,42,0.18) 100%, transparent),
              radial-gradient(circle 2px at 22% 82%, rgba(232,86,10,0.18) 100%, transparent)
            `,
          }}
        />

        {/* Logo */}
        <div className="w-[120px] h-[120px] rounded-[30px] bg-card flex items-center justify-center mb-7 shadow-[0_0_0_8px_rgba(232,86,10,0.18),0_24px_56px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
          <img src={politiULogo} alt="PolitiU" className="w-[90px] h-[90px] object-contain" />
        </div>

        <h1 className="font-display text-[54px] font-black text-on-dark text-center leading-none mb-2.5 relative z-10">
          Politi-<span className="text-orange-light">U</span>
        </h1>
        <p className="text-[13px] text-on-dark/40 text-center mb-14 tracking-[2.5px] uppercase relative z-10">
          Your Civic Companion
        </p>

        {/* Gradient rule */}
        <div className="w-14 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-13 relative z-10" />

        <button
          onClick={onGetStarted}
          className="w-full max-w-[360px] py-[18px] bg-gradient-to-br from-orange-light to-burnt text-on-dark font-body text-[15px] font-extrabold border-none rounded-[14px] cursor-pointer tracking-[1.2px] uppercase mb-3.5 shadow-[0_8px_28px_rgba(232,86,10,0.4)] relative z-10 hover:translate-y-[-1px] hover:shadow-[0_12px_32px_rgba(232,86,10,0.5)] transition-all"
        >
          Get Started
        </button>
        <button className="w-full max-w-[360px] py-[18px] bg-transparent text-mint font-body text-[15px] font-bold border-2 border-mint/30 rounded-[14px] cursor-pointer tracking-[0.5px] relative z-10 hover:border-mint/60 hover:bg-mint/5 transition-all">
          I Already Have An Account
        </button>

        <p className="mt-10 text-[11px] text-on-dark/20 text-center relative z-10">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
