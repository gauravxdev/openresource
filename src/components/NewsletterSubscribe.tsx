import * as React from "react"
import { Button } from "@/components/ui/button"

const NewsletterSubscribe = () => {
  return (
    <div className="mt-12 flex w-full max-w-2xl flex-col items-center gap-4">
      <form className="w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="flex w-full items-center gap-2 rounded-full border border-input bg-background px-2 py-1 shadow-[0_12px_35px_-25px_RGBA(0,0,0,0.7)] transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            type="submit"
            size="lg"
            className="h-auto rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-none transition-all hover:bg-primary/90 focus-visible:ring-primary/40"
          >
            Join our community
          </Button>
        </div>
      </form>
      <p className="mb-12 text-sm text-neutral-500">
        Get the latest tools sent directly to your inbox ✨
      </p>
    </div>
  )
}

export default NewsletterSubscribe