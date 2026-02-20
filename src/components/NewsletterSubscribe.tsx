"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { joinNewsletter } from "@/actions/newsletter"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const NewsletterSubscribe = () => {
  const [email, setEmail] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    startTransition(async () => {
      const response = await joinNewsletter(email)
      if (response.success) {
        toast.success(response.message)
        setEmail("")
      } else {
        toast.error(response.message)
      }
    })
  }

  return (
    <div className="mt-12 flex w-full max-w-2xl flex-col items-center gap-4">
      <form onSubmit={handleSubmit} className="w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="flex w-full items-center gap-2 rounded-full border border-input bg-background px-2 py-1 shadow-[0_12px_35px_-25px_RGBA(0,0,0,0.7)] transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="flex-1 min-w-0 rounded-full bg-transparent px-3 py-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            size="lg"
            disabled={isPending || !email.trim()}
            className="h-auto shrink-0 rounded-full bg-primary px-4 py-2 text-xs sm:px-5 sm:py-3 sm:text-sm font-semibold text-primary-foreground shadow-none transition-all hover:bg-primary/90 focus-visible:ring-primary/40 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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