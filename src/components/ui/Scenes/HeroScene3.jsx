import ScrollStack, { ScrollStackItem } from "../Visuals/ScrollStack";

const STEPS = [
  {
    id: 1,
    label: "Step 1",
    title: "Scan the QR & join in queue instantly",
    body: "Guests scan a QR code at your hotel or restaurant and enter a few simple details. No app download, no  confusion – just a clean digital queue.",
    highlight: "Scan & join the queue with one tap.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
  },
  {
    id: 2,
    label: "Step 2",
    title: "Smart queue for your staff",
    body: "Staff will sees a live dashboard of who's in line, their token numbers, and ETA. Waiting numbers are assigned automatically, so no more shouting names at the counter.",
    highlight: "The queue manages itself in the background.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  },
  {
    id: 3,
    label: "Step 3",
    title: "Play, roam, chill while you wait",
    body: "Instead of standing in one spot, guests can explore, eat, or play built-in mini-games and even win rewards – while their place in the queue is safely reserved.",
    highlight: "Waiting time becomes experience time.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
  },
  {
    id: 4,
    label: "Step 4",
    title: "It's your turn – we'll notify you",
    body: "When their number is up, guests get a WhatsApp or call notification from your staff. They return calmly to the counter – no crowding, no chaos.",
    highlight: "Smooth, personal communication every time.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80"
  },
];

export default function HeroScene3() {
  return (
    <section id="how-it-works" className="bg-[#f8eeda] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#6A4CAB] font-semibold mb-3 sm:mb-4">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2E2E2E] leading-tight mb-4 sm:mb-5">
            Four simple steps from{" "}
            <span className="text-[#6A4CAB]">standing in line</span> to{" "}
            <span className="text-[#6A4CAB]">enjoying your time</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#4B5563] leading-relaxed">
            Khaate Khelte quietly manages the queue in the background while your
            guests focus on the experience.
          </p>
        </div>

        {/* Scroll stack cards */}
        <div className="max-w-5xl mx-auto">
          <ScrollStack itemGap={24}>
            {STEPS.map((step) => (
              <ScrollStackItem
                key={step.id}
                itemClassName="
                  bg-white 
                  rounded-xl sm:rounded-2xl lg:rounded-3xl
                  shadow-xl
                  border border-[#6A4CAB]/10
                  overflow-hidden
                "
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] sm:min-h-[500px] lg:min-h-[450px]">
                  {/* Left: text content */}
                  <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 order-2 lg:order-1">
                    {/* Step badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#6A4CAB] to-[#8B5CF6] text-white text-base sm:text-lg font-bold shadow-lg">
                        {step.id}
                      </div>
                      <span className="text-xs uppercase tracking-[0.15em] text-[#9CA3AF] font-semibold">
                        {step.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1F2933] mb-3 sm:mb-4 leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed mb-4 sm:mb-5">
                      {step.body}
                    </p>

                    {/* Highlight */}
                    <div className="inline-flex items-start gap-2 bg-[#F5E7FF] px-4 py-3 rounded-lg">
                      <svg 
                        className="w-5 h-5 text-[#6A4CAB] flex-shrink-0 mt-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs sm:text-sm text-[#6A4CAB] font-semibold leading-snug">
                        {step.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Right: image */}
                  <div className="relative h-56 sm:h-64 lg:h-auto order-1 lg:order-2">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l from-transparent via-transparent to-[#6A4CAB]/5" />
                    
                    {/* Decorative element */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                      <span className="text-xs font-bold text-[#6A4CAB]">
                        Step {step.id}/4
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}