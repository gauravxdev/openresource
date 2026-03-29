import NotificationButton from "./NotificationButton";
import { HeroSearchInput } from "./HeroSearchInput";
import { getDailyResourceCount } from "@/actions/resources";

const HeroSection = async () => {
  const { count } = await getDailyResourceCount();

  return (
    <section className="flex flex-col items-center overflow-hidden px-4 pt-12 text-center md:pt-16">
      <NotificationButton count={count} />
      <div className="mb-8 max-w-4xl space-y-4">
        <h1
          className="font-lexend text-3xl leading-tight font-extrabold text-balance sm:text-5xl md:text-6xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          Find tools you didn&apos;t know you needed
        </h1>
        <p
          className="font-lexend text-muted-foreground text-base leading-relaxed text-balance sm:text-xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          The internet&apos;s better tools, in one place
        </p>
      </div>
      <HeroSearchInput />
    </section>
  );
};

export default HeroSection;
