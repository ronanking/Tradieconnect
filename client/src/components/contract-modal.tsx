import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText, Calendar, User, CheckCircle, AlertCircle, Pen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Contract {
  id: number;
  jobId: number;
  quoteId: number;
  customerId: number;
  tradieId: number;
  contractType: "customer" | "tradie";
  contractTemplate: string;
  contractTerms: string;
  signedBy: number | null;
  signedAt: string | null;
  signatureData: string | null;
  status: "pending" | "signed" | "expired";
  expiresAt: string;
  createdAt: string;
  job: {
    title: string;
    description: string;
    category: string;
    location: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  tradie: {
    tradeName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  currentUserId: number;
}

export default function ContractModal({ isOpen, onClose, contract, currentUserId }: ContractModalProps) {
  const [signature, setSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signContractMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      return apiRequest("POST", `/api/contracts/${contract!.id}/sign`, {
        signatureData,
        ipAddress: "127.0.0.1" // In real app, get from request
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Signed",
        description: "Your digital signature has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Signing Failed",
        description: error.message || "Failed to sign contract. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save signature as base64
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const handleSignContract = () => {
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please provide your digital signature before proceeding.",
        variant: "destructive",
      });
      return;
    }

    signContractMutation.mutate(signature);
  };

  if (!contract) return null;

  const isCustomerContract = contract.contractType === "customer";
  const canSign = contract.status === "pending" && 
                  ((isCustomerContract && currentUserId === contract.customerId) || 
                   (!isCustomerContract && currentUserId === contract.tradieId));
  const isSigned = contract.status === "signed";
  const isExpired = contract.status === "expired" || new Date(contract.expiresAt) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isCustomerContract ? "Customer Service Agreement" : "Trade Service Contract"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Contract Details */}
          <div className="md:col-span-2">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {isSigned && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {contract.status === "pending" && <AlertCircle className="h-5 w-5 text-orange-600" />}
                  {isExpired && <AlertCircle className="h-5 w-5 text-red-600" />}
                  <Badge 
                    variant={isSigned ? "default" : isExpired ? "destructive" : "secondary"}
                    className={isSigned ? "bg-green-600" : ""}
                  >
                    {isSigned ? "Signed" : isExpired ? "Expired" : "Pending Signature"}
                  </Badge>
                </div>

                {/* Contract Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isCustomerContract ? "Customer Service Agreement" : "Trade Service Contract"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Job Title:</label>
                        <p className="text-gray-900">{contract.job.title}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Category:</label>
                        <p className="text-gray-900">{contract.job.category}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Location:</label>
                        <p className="text-gray-900">{contract.job.location}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Contract Date:</label>
                        <p className="text-gray-900">{new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contract Parties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Customer:</label>
                        <p className="text-gray-900">
                          {contract.customer.firstName} {contract.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{contract.customer.email}</p>
                      </div>
                      <div>
                        <label className="font-medium text-sm">Service Provider:</label>
                        <p className="text-gray-900">{contract.tradie?.tradeName}</p>
                        <p className="text-sm text-gray-600">
                          {contract.tradie?.user.firstName} {contract.tradie?.user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{contract.tradie?.user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: contract.contractTerms }}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* Signature Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pen className="h-5 w-5" />
                  Digital Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSigned ? (
                  <div className="space-y-4">
                    <div className="text-center text-green-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">Contract Signed</p>
                      <p className="text-sm text-gray-600">
                        Signed on {new Date(contract.signedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    {contract.signatureData && (
                      <div>
                        <label className="font-medium text-sm">Signature:</label>
                        <img 
                          src={contract.signatureData} 
                          alt="Digital signature"
                          className="border rounded mt-2 max-w-full"
                        />
                      </div>
                    )}
                  </div>
                ) : canSign && !isExpired ? (
                  <div className="space-y-4">
                    <div>
                      <label className="font-medium text-sm">Draw your signature:</label>
                      <canvas
                        ref={canvasRef}
                        width={250}
                        height={100}
                        className="border border-gray-300 rounded mt-2 cursor-crosshair"
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleSignContract}
                        disabled={!signature || signContractMutation.isPending}
                        className="flex-1"
                      >
                        {signContractMutation.isPending ? "Signing..." : "Sign Contract"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      By signing this contract, you agree to all terms and conditions outlined above.
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    {isExpired ? (
                      <div>
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
                        <p className="font-medium text-red-600">Contract Expired</p>
                        <p className="text-sm">
                          This contract expired on {new Date(contract.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <User className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-medium">Awaiting Signature</p>
                        <p className="text-sm">
                          {isCustomerContract ? 
                            "Waiting for customer to sign this contract" : 
                            "Waiting for tradie to sign this contract"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Contract ID:</span>
                    <span>#{contract.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>{new Date(contract.expiresAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{contract.contractType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}