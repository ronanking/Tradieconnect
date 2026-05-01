import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, AlertCircle, CreditCard, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BankAccount {
  id: number;
  tradieId: number;
  accountHolderName: string;
  bsb: string;
  accountNumber: string;
  bankName: string;
  accountType: string;
  isVerified: boolean;
  verificationDate: string | null;
  lastUpdated: string;
  createdAt: string;
}

export default function BankingSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bsb: "",
    accountNumber: "",
    bankName: "",
    accountType: "savings"
  });

  // Fetch current banking information
  const { data: bankAccount, isLoading } = useQuery<BankAccount>({
    queryKey: ["/api/banking/account"],
    retry: false
  });

  // Save banking details mutation
  const saveBankingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/banking/setup", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save banking details");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Banking Details Saved",
        description: "Your banking information has been securely saved and encrypted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/account"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Saving Banking Details",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify bank account mutation
  const verifyBankMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/banking/verify", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to verify bank account");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bank Account Verified",
        description: "Your bank account has been successfully verified for payments.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/banking/account"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate BSB format (6 digits, XXX-XXX)
    const bsbPattern = /^\d{3}-?\d{3}$/;
    if (!bsbPattern.test(formData.bsb)) {
      toast({
        title: "Invalid BSB",
        description: "BSB must be 6 digits in format XXX-XXX",
        variant: "destructive",
      });
      return;
    }

    // Validate account number (6-10 digits)
    const accountPattern = /^\d{6,10}$/;
    if (!accountPattern.test(formData.accountNumber)) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be 6-10 digits",
        variant: "destructive",
      });
      return;
    }

    saveBankingMutation.mutate(formData);
  };

  const handleVerify = () => {
    verifyBankMutation.mutate();
  };

  // Auto-populate form if bank account exists
  if (bankAccount && !formData.accountHolderName) {
    setFormData({
      accountHolderName: bankAccount?.accountHolderName,
      bsb: bankAccount?.bsb,
      accountNumber: bankAccount?.accountNumber.slice(-4), // Show only last 4 digits for security
      bankName: bankAccount?.bankName,
      accountType: bankAccount?.accountType
    });
  }

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Banking Setup</h1>
        <p className="text-gray-600">Set up your bank account to receive payments directly from customers</p>
      </div>

      {bankAccount && (
        <Alert className={bankAccount?.isVerified ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
          {bankAccount?.isVerified ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription>
            {bankAccount?.isVerified ? (
              <span className="text-green-800">
                Your bank account is verified and ready to receive payments.
              </span>
            ) : (
              <span className="text-yellow-800">
                Your bank account is saved but not yet verified. Click "Verify Account" to enable payments.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Banking Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
            <CardDescription>
              Your banking information is encrypted and stored securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Your full name as it appears on your bank account"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g. Commonwealth Bank, ANZ, Westpac"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bsb">BSB</Label>
                  <Input
                    id="bsb"
                    value={formData.bsb}
                    onChange={(e) => setFormData(prev => ({ ...prev, bsb: e.target.value }))}
                    placeholder="XXX-XXX"
                    maxLength={7}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="Account number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="cheque">Cheque Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={saveBankingMutation.isPending}
                  className="flex-1"
                >
                  {saveBankingMutation.isPending ? "Saving..." : "Save Banking Details"}
                </Button>
                
                {bankAccount && !bankAccount?.isVerified && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleVerify}
                    disabled={verifyBankMutation.isPending}
                  >
                    {verifyBankMutation.isPending ? "Verifying..." : "Verify Account"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Information
            </CardTitle>
            <CardDescription>
              How we protect your banking information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">🔒 Bank-Level Security</h3>
              <p className="text-sm text-gray-600">
                Your banking details are encrypted using AES-256 encryption, the same standard used by banks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💳 How Payments Work</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customers pay through our secure platform</li>
                <li>• No transaction fees - keep 100% of your earnings</li>
                <li>• Full payment amount transfers to your bank account</li>
                <li>• Payments typically arrive within 1-2 business days</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🛡️ Verification Process</h3>
              <p className="text-sm text-gray-600">
                We verify your bank account to ensure secure transfers and prevent fraud.
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your banking information is never shared with customers or third parties.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            View your payment history and transaction details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payments received yet</p>
            <p className="text-sm">Complete jobs to start receiving payments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}