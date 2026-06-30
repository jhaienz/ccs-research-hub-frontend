"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { clientAction } from "@/lib/client-api"

export function ResearchActions({
  researchId,
  citation,
}: {
  researchId: string
  isPrivate: boolean
  citation: string
}) {
  const trackedView = useRef(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (trackedView.current) return
    trackedView.current = true
    void clientAction<{ message: string }>(`/research/${researchId}/view`, "POST").catch(() => {})
  }, [researchId])

  function addToCollection() {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      try {
        const response = await clientAction<{ message: string }>("/collections", "POST", { researchId })
        setMessage(response.message)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add to collection")
      }
    })
  }

  function cite() {
    setError(null)
    setMessage(null)
    startTransition(async () => {
      try {
        void clientAction<{ message: string }>(`/research/${researchId}/cite`, "POST").catch(() => {})
        await navigator.clipboard.writeText(citation)
        setMessage("Citation copied")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to cite research")
      }
    })
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/research/${researchId}/request-pdf`}>Request PDF</Link>
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={cite}>
          Cite
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={addToCollection}>
          Add to Collection
        </Button>
      </div>
      {message ? <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </>
  )
}
