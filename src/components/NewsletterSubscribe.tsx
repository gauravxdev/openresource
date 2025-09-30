import * as React from "react"
import { Button } from "@/components/ui/button"

const NewsletterSubscribe = () => {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-3 mt-6">
      <form className="w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="flex w-full items-center gap-2 rounded-full border border-input bg-muted/50 px-1 shadow-sm transition focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 dark:border-muted/40 dark:bg-muted/10">
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <Button
            type="submit"
            size="lg"
            className="h-auto rounded-full px-3 py-3 text-sm font-semibold shadow-none transition-all hover:shadow-sm focus-visible:ring-primary/40 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
          >
            Join our community
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground">
        Get the latest tools sent directly to your inbox ✨
      </p>
    </div>
  )
}

export default NewsletterSubscribe