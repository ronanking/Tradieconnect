import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Calendar, CreditCard, DollarSign, Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentSchedule {
  id: number;
  quoteId: number;
  customerId: number;
  tradieId: number;
  totalAmount: string;
  numberOfPayments: number;
  frequency: "weekly" | "bi-weekly" | "monthly";
  startDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  payments: ScheduledPayment[];
  job: {
    title: string;
    description: string;
  };
  tradie: {
    tradeName: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ScheduledPayment {
  id: number;
  scheduleId: number;
  amount: string;
  dueDate: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  paidAt: string | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

export default function PaymentSchedule() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split('?')[1]);
  const quoteId = queryParams.get('quoteId');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [scheduleForm, setScheduleForm] = useState({
    numberOfPayments: 3,
    frequency: "monthly" as const,
    startDate: new Date().toISOString().split('T')[0],
    description: ""
  });

  // Fetch quote details
  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ['/api/quotes', quoteId],
    enabled: !!quoteId
  });

  // Fetch existing payment schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery<PaymentSchedule[]>({
    queryKey: ['/api/payment-schedules'],
    retry: false
  });

  // Create payment schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiRequest("POST", "/api/payment-schedules/create", scheduleData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Schedule Created",
        description: "Your payment schedule has been set up successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
      // Reset form
      setScheduleForm({
        numberOfPayments: 3,
        frequency: "monthly",
        startDate: new Date().toISOString().split('T')[0],
        description: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment schedule",
        variant: "destructive"
      });
    }
  });

  // Cancel payment schedule mutation
  const cancelScheduleMutation = useMutation({
    mutationFn: async (scheduleId: number) => {
      const response = await apiRequest("POST", `/api/payment-schedules/${scheduleId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule Cancelled",
        description: "Payment schedule has been cancelled."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel payment schedule",
        variant: "destructive"
      });
    }
  });

  // Process individual payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: { scheduleId: number; paymentId: number; paymentMethod: string }) => {
      const response = await apiRequest("POST", "/api/payment-schedules/process-payment", paymentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Processed",
        description: "Your payment has been processed successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-schedules'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive"
      });
    }
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteId || !quote) {
      toast({
        title: "Error",
        description: "Quote information is required to create a payment schedule",
        variant: "destructive"
      });
      return;
    }

    createScheduleMutation.mutate({
      quoteId: parseInt(quoteId),
      ...scheduleForm
    });
  };

  const calculatePaymentAmount = () => {
    if (!quote) return 0;
    const totalAmount = parseFloat(quote?.price);
    return (totalAmount / scheduleForm.numberOfPayments).toFixed(2);
  };

  const generatePaymentDates = () => {
    const dates = [];
    const startDate = new Date(scheduleForm.startDate);
    
    for (let i = 0; i < scheduleForm.numberOfPayments; i++) {
      const paymentDate = new Date(startDate);
      
      switch (scheduleForm.frequency) {
        case 'weekly':
          paymentDate.setDate(startDate.getDate() + (i * 7));
          break;
        case 'bi-weekly':
          paymentDate.setDate(startDate.getDate() + (i * 14));
          break;
        case 'monthly':
          paymentDate.setMonth(startDate.getMonth() + i);
          break;
      }
      
      dates.push(paymentDate.toLocaleDateString());
    }
    
    return dates;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      paid: "default",
      completed: "default",
      failed: "destructive",
      cancelled: "secondary"
    } as const;

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (quoteLoading || schedulesLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/customer-dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Payment Scheduling</h1>
          <p className="text-gray-600">Set up flexible payment plans for your projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Payment Schedule */}
        {quoteId && quote && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Create Payment Schedule
              </CardTitle>
              <CardDescription>
                Set up a payment plan for "{quote?.job?.title || 'Project'}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input value={`$${quote?.price}`} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Per Payment</Label>
                    <Input value={`$${calculatePaymentAmount()}`} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfPayments">Number of Payments</Label>
                  <Select 
                    value={scheduleForm.numberOfPayments.toString()} 
                    onValueChange={(value) => setScheduleForm(prev => ({ ...prev, numberOfPayments: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 payments</SelectItem>
                      <SelectItem value="3">3 payments</SelectItem>
                      <SelectItem value="4">4 payments</SelectItem>
                      <SelectItem value="6">6 payments</SelectItem>
                      <SelectItem value="12">12 payments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Payment Frequency</Label>
                  <Select 
                    value={scheduleForm.frequency} 
                    onValueChange={(value: "weekly" | "bi-weekly" | "monthly") => setScheduleForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">First Payment Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={scheduleForm.startDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notes (Optional)</Label>
                  <Textarea
                    id="description"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any notes about this payment schedule..."
                    rows={3}
                  />
                </div>

                {/* Payment Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Schedule Preview</h4>
                  <div className="space-y-1 text-sm">
                    {generatePaymentDates().map((date, index) => (
                      <div key={index} className="flex justify-between">
                        <span>Payment {index + 1}:</span>
                        <span>${calculatePaymentAmount()} on {date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    No additional fees - payments are processed securely through our platform. You can modify or cancel this schedule anytime before the first payment.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createScheduleMutation.isPending}
                >
                  {createScheduleMutation.isPending ? "Creating Schedule..." : "Create Payment Schedule"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Payment Schedules */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Your Payment Schedules
              </CardTitle>
              <CardDescription>
                Manage your active and upcoming payment plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedules && ((Array.isArray(schedules) ? schedules : []).length) > 0 ? (
                <div className="space-y-4">
                  {(Array.isArray(schedules) ? schedules : []).map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{schedule.job.title}</h4>
                          <p className="text-sm text-gray-600">{schedule.tradie?.tradeName}</p>
                        </div>
                        {getStatusBadge(schedule.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="ml-2 font-medium">${schedule.totalAmount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Payments:</span>
                          <span className="ml-2 font-medium">{schedule.numberOfPayments} {schedule.frequency}</span>
                        </div>
                      </div>

                      {/* Individual Payments */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Payment Schedule:</h5>
                        {schedule.payments.map((payment, index) => (
                          <div key={payment.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <div className="text-sm">
                              <span>Payment {index + 1}: </span>
                              <span className="font-medium">${payment.amount}</span>
                              <span className="text-gray-600 ml-2">due {new Date(payment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(payment.status)}
                              {payment.status === 'pending' && new Date(payment.dueDate) <= new Date() && (
                                <Button
                                  size="sm"
                                  onClick={() => processPaymentMutation.mutate({
                                    scheduleId: schedule.id,
                                    paymentId: payment.id,
                                    paymentMethod: 'credit_card'
                                  })}
                                  disabled={processPaymentMutation.isPending}
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {schedule.status === 'pending' && (
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelScheduleMutation.mutate(schedule.id)}
                            disabled={cancelScheduleMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Cancel Schedule
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-600 mb-2">No Payment Schedules</h3>
                  <p className="text-sm text-gray-500">
                    Create a payment schedule to split large payments into manageable installments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}