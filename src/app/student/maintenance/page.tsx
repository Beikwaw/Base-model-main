"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wrench, Trash, AlertTriangle, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createMaintenanceRequest, getMyMaintenanceRequests } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { PolicySection } from '@/components/PolicySection'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MaintenanceRequest {
  id: string
  category: string
  roomNumber: string
  description: string
  timeSlot: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed" | "rejected"
  createdAt: Date
  adminResponse?: string
}

const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    return format(dateObj, 'PPP')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export default function MaintenanceRequestPage() {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent')
  const [formData, setFormData] = useState({
    category: 'kitchen',
    description: '',
    roomNumber: userData?.room_number || '',
    tenantCode: userData?.tenant_code || '',
    priority: 'medium',
    timeSlot: 'morning'
  })

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00'
  ];

  const categories = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'furniture', label: 'Furniture' }
  ];

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to submit a request")
      return
    }
    
    setLoading(true)

    try {
      await createMaintenanceRequest({
        userId: user.uid,
        category: formData.category,
        description: formData.description,
        roomNumber: formData.roomNumber,
        tenantCode: formData.tenantCode,
        priority: formData.priority as 'low' | 'medium' | 'high',
        timeSlot: formData.timeSlot,
        status: 'pending',
        createdAt: new Date()
      })
      toast.success("Maintenance request submitted successfully")
      setFormData({
        category: 'kitchen',
        description: '',
        roomNumber: userData?.room_number || '',
        tenantCode: userData?.tenant_code || '',
        priority: 'medium',
        timeSlot: 'morning'
      })
      fetchRequests()
    } catch (error) {
      console.error("Error submitting request:", error)
      toast.error("Failed to submit maintenance request")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter(request => request.id !== id))
    toast.success("Maintenance request deleted successfully")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const fetchRequests = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userRequests = await getMyMaintenanceRequests(user.uid)
      setRequests(userRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to fetch maintenance requests")
    } finally {
      setLoading(false)
    }
  }

  const recentRequests = requests.filter(request => 
    request.status === 'pending' || request.status === 'in_progress'
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const historyRequests = requests.filter(request => 
    request.status === 'completed' || request.status === 'rejected'
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Request and track maintenance services</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>New Request</CardTitle>
              <CardDescription>Submit a new maintenance request</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FormData['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="bathroom">Bathroom</SelectItem>
                    <SelectItem value="bedroom">Bedroom</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSlot">Preferred Time Slot</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => setFormData({ ...formData, timeSlot: value as FormData['timeSlot'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                    <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantCode">Tenant Code</Label>
                <Input
                  id="tenantCode"
                  value={formData.tenantCode}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <PolicySection
                title="Maintenance Policy"
                items={[
                  'Maintenance requests are processed within 24-48 hours',
                  'Emergency requests are prioritized',
                  'You will be notified when maintenance staff is scheduled to visit',
                  'Please ensure someone is present during the scheduled time slot'
                ]}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Your Requests</CardTitle>
              <CardDescription>Track the status of your maintenance requests</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading requests...</p>
                ) : recentRequests.length === 0 ? (
                  <div className="text-center py-6">
                    <Wrench className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No active maintenance requests</p>
                  </div>
                ) : (
                  recentRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium capitalize">{request.category}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(request.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Preferred Time: {request.timeSlot}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading requests...</p>
                ) : historyRequests.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No maintenance request history</p>
                  </div>
                ) : (
                  historyRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium capitalize">{request.category}</h3>
                            <Badge className={getStatusColor(request.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(request.status)}
                                {request.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(request.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Preferred Time: {request.timeSlot}</span>
                          </div>
                          {request.adminResponse && (
                            <div className="bg-blue-50 p-3 rounded-md mt-2">
                              <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                              <p className="text-sm text-blue-600 mt-1">{request.adminResponse}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 