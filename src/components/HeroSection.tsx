import NotificationButton from "./NotificationButton";
import NewsletterSubscribe from "./NewsletterSubscribe";

const HeroSection = () => {
  return (
    <section className="mt-20 flex flex-col items-center px-4 text-center">
      <NotificationButton />
      <div className="max-w-4xl space-y-4">
        <h1
          className="font-lexend text-balance text-5xl font-extrabold leading-tight sm:text-6xl"
          style={{ fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif" }}
        >
          Open-source apps & resources at your fingertips
        </h1>
        <p
          className="font-lexend text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl"
          style={{ fontFamily: "Lexend, var(--font-lexend), system-ui, sans-serif" }}
        >
          Discover and explore open-source apps and resources tailored for your needs.
        </p>
      </div>
      <NewsletterSubscribe/>
    </section>
  )
}

export default HeroSection;