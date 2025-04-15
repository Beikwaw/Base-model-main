"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "lucide-react"
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getAnalyticsData } from "@/lib/firestore"

interface AnalyticsData {
  date: string
  complaints: number
  maintenance: number
  sleepover: number
  guests: number
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState<"days" | "weeks" | "months">("days")
  const [graphType, setGraphType] = useState<"bar" | "line">("bar")
  const [data, setData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const analyticsData = await getAnalyticsData(timeRange)
      setData(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderChart = () => {
    if (loading) {
      return <div className="h-[400px] flex items-center justify-center">Loading...</div>
    }

    if (data.length === 0) {
      return <div className="h-[400px] flex items-center justify-center">No data available</div>
    }

    const ChartComponent = graphType === "bar" ? RechartsBarChart : RechartsLineChart
    const DataComponent = graphType === "bar" ? Bar : Line

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent type="monotone" dataKey="complaints" name="Complaints" fill="#8884d8" />
          <DataComponent type="monotone" dataKey="maintenance" name="Maintenance" fill="#82ca9d" />
          <DataComponent type="monotone" dataKey="sleepover" name="Sleepover" fill="#ffc658" />
          <DataComponent type="monotone" dataKey="guests" name="Guests" fill="#ff7300" />
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Analytics Dashboard</CardTitle>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: "days" | "weeks" | "months") => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Last 14 Days</SelectItem>
              <SelectItem value="weeks">Last 6 Weeks</SelectItem>
              <SelectItem value="months">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Tabs value={graphType} onValueChange={(value: "bar" | "line") => setGraphType(value)}>
            <TabsList>
              <TabsTrigger value="bar">
                <BarChart className="h-4 w-4 mr-2" />
                Bar
              </TabsTrigger>
              <TabsTrigger value="line">
                <LineChart className="h-4 w-4 mr-2" />
                Line
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
} 