
const Contact = () => {
  return (
    <section className="py-20 bg-white" id="contact">
      <div className="container">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center text-white shadow-2xl">
          
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              Craving Pizza? <br /> 
              <span className="text-primary">Don't wait for the weekend!</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Call us now and get your pizza delivered hot & fresh in under 30 minutes. We are open 24/7.
            </p>
            
            <div className="flex flex-col items-center gap-6">
              <a 
                href="tel:+2012121212" 
                className="text-4xl md:text-6xl font-black text-white hover:text-primary transition-colors tracking-tight"
              >
                +20 121 212 121
              </a>
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/40 hover:bg-orange-600 transition-all">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;