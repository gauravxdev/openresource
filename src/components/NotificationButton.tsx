import * as React from "react"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"

interface NotificationButtonProps {
  count?: number;
}

const NotificationButton = ({ count = 0 }: NotificationButtonProps) => {
  return (
    <div className="mb-4 flex justify-center animate-in fade-in slide-in-from-bottom-3 duration-700">
      <Link
        href="/browse/latest"
        className="group relative flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-medium text-yellow-600 dark:text-yellow-400 transition-colors hover:bg-yellow-500/20 backdrop-blur-sm"
      >
        <Sparkles className="h-4 w-4" />
        <span>
          <strong className="font-semibold text-yellow-700 dark:text-yellow-300">{count}</strong> new tools added
        </span>
        <ArrowRight className="h-4 w-4 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

export default NotificationButton;