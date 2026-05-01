import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Eye, Calendar, DollarSign, FileText } from "lucide-react";
import type { Invoice } from "@shared/schema";

export default function CustomerInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices for customer
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoices/customer'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/invoices/customer");
      return response.json();
    }
  });

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
      <div>
        <h1 className="text-3xl font-bold">Your Invoices</h1>
        <p className="text-gray-600">View and pay invoices from your tradies</p>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {((Array.isArray(invoices) ? invoices : []).length) === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
              <p className="text-gray-600">
                Your invoices will appear here when tradies send them to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          (Array.isArray(invoices) ? invoices : []).map((invoice: Invoice) => (
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
                      Received: {new Date(invoice.createdAt).toLocaleDateString()}
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
                      View Invoice
                    </Button>
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
              <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Invoice from your tradie for completed work
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
                    <p><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
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
                  <h3 className="font-semibold mb-2">Work Description</h3>
                  <p className="text-gray-700">{selectedInvoice.description}</p>
                </div>

                {/* Payment Instructions */}
                {selectedInvoice.bankDetails && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-3 text-blue-800">Payment Instructions</h3>
                    <div className="text-sm space-y-2">
                      <p><strong>Bank Transfer Details:</strong></p>
                      <div className="ml-4 space-y-1">
                        <p><strong>BSB:</strong> {(selectedInvoice.bankDetails as any).bsb}</p>
                        <p><strong>Account Number:</strong> {(selectedInvoice.bankDetails as any).accountNumber}</p>
                        <p><strong>Account Name:</strong> {(selectedInvoice.bankDetails as any).accountName}</p>
                        {(selectedInvoice.bankDetails as any).reference && (
                          <p><strong>Reference:</strong> {(selectedInvoice.bankDetails as any).reference}</p>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-blue-100 rounded-md">
                        <p className="text-blue-800 font-medium">
                          💡 Please include the invoice number ({selectedInvoice.invoiceNumber}) in your payment reference
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Thank you for your business! Please contact your tradie if you have any questions about this invoice.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}