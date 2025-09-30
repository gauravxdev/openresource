import * as React from "react"
import { Button } from "@/components/ui/button"

const NotificationButton = () => {
  return (
    <Button 
      className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2"
      size="sm"
    >
      <svg
        className="w-4 h-4 mr-2 animate-pulse"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-4.5 0-3.29-4.038-4.5-12-4.5S0 13.29 0 16.5c0 3.29 4.038 4.5 12 4.5 2.178 0 4.068-.28 5.132-.683M9 9v1.5c0 .828-.672 1.5-1.5 1.5S6 11.328 6 10.5V9c0-.828.672-1.5 1.5-1.5S9 8.172 9 9zm6 0v1.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5V9c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5z"
        />
      </svg>
      5 new tools added
    </Button>
  )
}

export default NotificationButton;