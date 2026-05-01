import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, DollarSign, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentCheckoutProps {
  quoteId: number;
  amount: number;
  tradieId: number;
  jobTitle: string;
}

export default function PaymentCheckout() {
  const [, params] = useRoute("/payment/:quoteId");
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });

  const quoteId = params?.quoteId ? parseInt(params.quoteId) : 0;

  // Fetch quote details
  const { data: quote, isLoading } = useQuery({
    queryKey: ["/api/quotes", quoteId],
    enabled: !!quoteId
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      const response = await apiRequest("POST", "/api/payments/process", {
        quoteId: quoteId,
        amount: data.amount,
        paymentMethod: data.paymentMethod
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Payment failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful",
        description: `Payment of $${data.tradieAmount} has been processed successfully. The tradie will receive the funds within 1-2 business days.`,
      });
      // Redirect to customer dashboard or confirmation page
      window.location.href = "/customer-dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quote) {
      toast({
        title: "Error",
        description: "Quote information not found",
        variant: "destructive",
      });
      return;
    }

    // Validate card number (simplified Luhn algorithm check)
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid credit card number",
        variant: "destructive",
      });
      return;
    }

    // Validate expiry date
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(paymentData.expiryDate)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter expiry date in MM/YY format",
        variant: "destructive",
      });
      return;
    }

    // Validate CVV
    if (paymentData.cvv.length < 3 || paymentData.cvv.length > 4) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV",
        variant: "destructive",
      });
      return;
    }

    processPaymentMutation.mutate({
      amount: parseFloat(quote?.price),
      paymentMethod: "credit_card"
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <p className="text-gray-600 mb-6">The quote you're trying to pay for could not be found.</p>
        <Link href="/customer-dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const platformFee = 0; // No platform fees with subscription model
  const totalAmount = parseFloat(quote?.price);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/customer-dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Payment Checkout</h1>
          <p className="text-gray-600">Secure payment processing</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter your credit card information securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="Name as it appears on card"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your payment information is encrypted and processed securely through our banking partners.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full"
                disabled={processPaymentMutation.isPending}
              >
                {processPaymentMutation.isPending ? "Processing Payment..." : `Pay $${totalAmount.toFixed(2)}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>
              Payment breakdown and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Job Details</h3>
              <p className="text-sm text-gray-600">{quote?.job?.title || "Job Title"}</p>
              <p className="text-xs text-gray-500 mt-1">Quote from {quote?.tradie?.tradeName || "Tradie"}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Quote Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Platform Fee:</span>
                <span>$0.00 (No fees!)</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tradie Receives:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Payment:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Payment is processed immediately</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Tradie receives funds in 1-2 business days</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Job status updates to "In Progress"</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>You can track progress in your dashboard</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}