import H4A from "../../../assets/img/h4a.png";
import H4B from "../../../assets/img/h4b.png";
import H4C from "../../../assets/img/h4c.png";
import H4D from "../../../assets/img/h4d.png";
import H4E from "../../../assets/img/h4e.png";
import H4F from "../../../assets/img/h4f.png";
import AutomatedSlide from "../Visuals/AutomatedSlide";

const SCREENSHOTS = [
  {
    img: H4A,
    title: "Guest Landing Screen",
    desc: "After scanning the QR code, guests land on this clean welcome screen. No downloads, no confusion — just a clear entry into your digital queue.",
  },
  {
    img: H4B,
    title: "Quick Guest Registration",
    desc: "A simple registration form captures the essentials needed to manage each guest in the queue, keeping your front-desk organized without slowing them down.",
  },
  {
    img: H4C,
    title: "Live Waiting Number & Status",
    desc: "Guests see their waiting number and current status at a glance. They always know where they stand, which removes the anxiety of wondering what’s happening next.",
  },
  {
    img: H4D,
    title: "Play Area & Rewards While Waiting",
    desc: "Built-in mini-games let guests pass the time in a fun way. They can earn rewards while they wait, turning idle minutes into a small delight.",
  },
  {
    img: H4E,
    title: "Hotel Admin Dashboard",
    desc: "From this admin view, hotel management gets a complete overview of queue trends, visitor flow, and performance — all the data behind smoother weekends.",
  },
  {
    img: H4F,
    title: "Dedicated Staff Queue Console",
    desc: "Front-desk teams use this dedicated queue console to assign waiting numbers, call the next guest, and log actions via WhatsApp or calls with just a few taps.",
  },
];

export default function HeroScene4() {
  return (
    <section
      id="behind-the-screens"
      className="bg-[#FFF9ED] py-20 sm:py-24 lg:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional small label above slider */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#6A4CAB] font-medium">
            Behind the Screens
          </p>
        </div>

        <AutomatedSlide
          items={SCREENSHOTS}
          autoplay={true}
        />
      </div>
    </section>
  );
}
