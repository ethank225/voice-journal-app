"use client"

import { useState, useEffect } from "react"

export type JournalEntry = {
  id: string
  date: string
  prompt: string
  transcript: string
  sentiment: string
  topics: string[]
}

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    // Load journal entries from localStorage
    const storedEntries = localStorage.getItem("journalEntries")
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries))
    }
  }, [])

  const addEntry = (entry: Omit<JournalEntry, "id" | "date">) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    }

    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    localStorage.setItem("journalEntries", JSON.stringify(updatedEntries))

    return newEntry
  }

  const getFilteredEntries = (timeRange: "week" | "month" | "all") => {
    const now = new Date()

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      if (timeRange === "week") {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return entryDate >= weekAgo
      } else if (timeRange === "month") {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return entryDate >= monthAgo
      }
      return true // 'all' range
    })
  }

  return {
    entries,
    addEntry,
    getFilteredEntries,
  }
}
