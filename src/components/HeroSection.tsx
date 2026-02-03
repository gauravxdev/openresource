import NotificationButton from "./NotificationButton";
import NewsletterSubscribe from "./NewsletterSubscribe";
import { getDailyResourceCount } from "@/actions/resources";

const HeroSection = async () => {
  const { count } = await getDailyResourceCount();

  return (
    <section className="mt-20 flex flex-col items-center px-4 text-center">
      <NotificationButton count={count} />
      <div className="max-w-4xl space-y-4">
        <h1
          className="font-lexend text-balance text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif" }}
        >
          Open-source apps & resources at your fingertips
        </h1>
        <p
          className="font-lexend text-balance text-base leading-relaxed text-muted-foreground sm:text-xl"
          style={{ fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif" }}
        >
          Discover and explore open-source apps and resources tailored for your needs.
        </p>
      </div>
      <NewsletterSubscribe />
    </section>
  )
}

export default HeroSection;