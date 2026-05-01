import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Send, Eye, DollarSign, Calendar, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@shared/schema";

const invoiceFormSchema = z.object({
  jobId: z.number(),
  quoteId: z.number().optional(),
  subtotal: z.string().min(1),
  description: z.string().min(1),
  paymentTerms: z.enum(["Net 7", "Net 14", "Net 30", "Due on receipt"]),
  paymentMethods: z.array(z.string()),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number()
  })).optional(),
  bankDetails: z.object({
    bsb: z.string(),
    accountNumber: z.string(),
    accountName: z.string(),
    reference: z.string().optional()
  }).optional()
});

export default function Invoices() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invoices for tradie
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoices/tradie'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invoices/tradie");
      return response.json();
    }
  });

  // Fetch jobs for invoice creation
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/jobs");
      return response.json();
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Created",
        description: "Your invoice has been created successfully."
      });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/tradie'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive"
      });
    }
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/send`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Sent",
        description: "Invoice has been sent to the customer."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/tradie'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive"
      });
    }
  });

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/mark-paid`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice Marked as Paid",
        description: "Invoice has been marked as paid."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/tradie'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark invoice as paid",
        variant: "destructive"
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      subtotal: "",
      description: "",
      paymentTerms: "Net 30" as const,
      paymentMethods: ["bank_transfer"],
      notes: "",
      lineItems: [],
      bankDetails: {
        bsb: "",
        accountNumber: "",
        accountName: "",
        reference: ""
      }
    }
  });

  const onSubmit = (data: any) => {
    const invoiceData = {
      ...data,
      jobId: parseInt(data.jobId),
      quoteId: data.quoteId ? parseInt(data.quoteId) : undefined,
      subtotal: parseFloat(data.subtotal),
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default 30 days
    };
    createInvoiceMutation.mutate(invoiceData);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      viewed: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800"
    } as const;
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter((invoice: Invoice) => 
    filterStatus === "all" || invoice.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and get paid privately</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a professional invoice for your completed work. Customers will pay you directly.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="jobId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Array.isArray(jobs) ? jobs : []).map((job: any) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the work completed..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal (AUD)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                            <SelectItem value="Net 7">Net 7 days</SelectItem>
                            <SelectItem value="Net 14">Net 14 days</SelectItem>
                            <SelectItem value="Net 30">Net 30 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional notes for the customer..."
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bank Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">Bank Details (for customer payment)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bankDetails.bsb"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BSB</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123-456" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123456789" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bankDetails.accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your Business Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankDetails.reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Reference (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Invoice reference for customer" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createInvoiceMutation.isPending}
                  >
                    {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "draft", "sent", "viewed", "paid"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === "all" 
                  ? "You haven't created any invoices yet." 
                  : `No ${filterStatus} invoices found.`
                }
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice: Invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {invoice.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        ${parseFloat(invoice.totalAmount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        incl. GST
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created: {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                    {invoice.dueDate && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {invoice.status === "draft" && (
                      <Button 
                        size="sm"
                        onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                        disabled={sendInvoiceMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    {(invoice.status === "sent" || invoice.status === "viewed") && (
                      <Button 
                        size="sm"
                        onClick={() => markPaidMutation.mutate(invoice.id)}
                        disabled={markPaidMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
              <DialogDescription>
                Preview of invoice {selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-6 bg-white">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-gray-600">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${parseFloat(selectedInvoice.totalAmount).toFixed(2)}
                    </div>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Invoice Details</h3>
                    <p><strong>Created:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                    {selectedInvoice.dueDate && (
                      <p><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    )}
                    <p><strong>Payment Terms:</strong> {selectedInvoice.paymentTerms}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Amount Breakdown</h3>
                    <p><strong>Subtotal:</strong> ${parseFloat(selectedInvoice.subtotal).toFixed(2)}</p>
                    <p><strong>GST (10%):</strong> ${parseFloat(selectedInvoice.gstAmount || "0").toFixed(2)}</p>
                    <p className="text-lg"><strong>Total:</strong> ${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedInvoice.description}</p>
                </div>

                {/* Bank Details */}
                {selectedInvoice.bankDetails && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Instructions</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>BSB:</strong> {(selectedInvoice.bankDetails as any).bsb}</p>
                      <p><strong>Account Number:</strong> {(selectedInvoice.bankDetails as any).accountNumber}</p>
                      <p><strong>Account Name:</strong> {(selectedInvoice.bankDetails as any).accountName}</p>
                      {(selectedInvoice.bankDetails as any).reference && (
                        <p><strong>Reference:</strong> {(selectedInvoice.bankDetails as any).reference}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}