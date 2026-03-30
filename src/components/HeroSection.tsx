import { HeroSearchInput } from "./HeroSearchInput";
import NotificationButton from "./NotificationButton";

const HeroSection = async () => {

  return (
    <section className="flex flex-col items-center overflow-hidden px-4 pt-10 text-center md:pt-16">
      <NotificationButton />
      <div className="mb-14 max-w-6xl space-y-6">
        <h1
          className="font-lexend text-3xl leading-tight font-extrabold sm:text-5xl md:text-6xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          The fastest way to replace any
          <br className="hidden sm:block" /> tool with open-source
        </h1>
        <p
          className="font-lexend text-muted-foreground text-base leading-relaxed text-balance sm:text-xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          Ask AI. Discover powerful open-source alternatives in seconds.
        </p>
      </div>
      <HeroSearchInput />
    </section>
  );
};

export default HeroSection;
