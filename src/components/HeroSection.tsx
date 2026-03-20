import NotificationButton from "./NotificationButton";
import { LazyNewsletter } from "./_lazy/LazyNewsletter";
import { getDailyResourceCount } from "@/actions/resources";

const HeroSection = async () => {
  const { count } = await getDailyResourceCount();

  return (
    <section className="mt-12 flex flex-col items-center px-4 text-center md:mt-16">
      <NotificationButton count={count} />
      <div className="max-w-4xl space-y-4">
        <h1
          className="font-lexend text-3xl leading-tight font-extrabold text-balance sm:text-5xl md:text-6xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          Open-source apps & resources at your fingertips
        </h1>
        <p
          className="font-lexend text-muted-foreground text-base leading-relaxed text-balance sm:text-xl"
          style={{
            fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif",
          }}
        >
          Discover and explore open-source apps and resources tailored for your
          needs.
        </p>
      </div>
      <LazyNewsletter />
    </section>
  );
};

export default HeroSection;
