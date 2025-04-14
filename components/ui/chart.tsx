import type * as React from "react"

const Chart = () => {
  return null
}

type ChartTooltipItemProps = {
  name: string
  value: string | number
  color: string
}

const ChartTooltipItem = ({ name, value, color }: ChartTooltipItemProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}:</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-2 bg-white border rounded-md shadow-md">{children}</div>
}

const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export { Chart, ChartTooltip, ChartTooltipContent, ChartTooltipItem, ChartContainer }
