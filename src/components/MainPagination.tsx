"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Pagination } from "@/components/ui/pagination-wrapper"

interface MainPaginationProps {
  currentPage: number
  totalCount: number
  itemsPerPage: number
}

export function MainPagination({ currentPage, totalCount, itemsPerPage }: MainPaginationProps) {
  const router = useRouter()
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page.toString())
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  if (totalCount <= itemsPerPage) return null

  return (
    <div className="mt-8">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
