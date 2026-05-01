import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContractModal from "@/components/contract-modal";
import { FileText, Search, Calendar, User, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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

export default function Contracts() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock current user ID - in real app this would come from auth context
  const currentUserId = 1;

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
    queryFn: async () => {
      // Mock contracts data - replace with real API call
      return [
        {
          id: 1,
          jobId: 1,
          quoteId: 1,
          customerId: 1,
          tradieId: 3,
          contractType: "customer",
          contractTemplate: "standard_customer",
          contractTerms: `
            <h3>COMPREHENSIVE CUSTOMER SERVICE AGREEMENT</h3>
            <p><strong>PARTIES:</strong> This agreement is between the Customer and the Tradie as specified in the job posting, facilitated through TradieConnect Platform.</p>
            
            <h4>1. SERVICE DESCRIPTION & SCOPE</h4>
            <p><strong>1.1 Work Description:</strong> Kitchen sink installation and related plumbing work as detailed in the job posting and quote.</p>
            <p><strong>1.2 Materials & Equipment:</strong> All materials are to be supplied by the Tradie unless otherwise specified. Materials will meet Australian Standards and local building codes.</p>
            <p><strong>1.3 Permits & Approvals:</strong> Tradie is responsible for obtaining all necessary permits and approvals required for the work.</p>
            <p><strong>1.4 Site Access:</strong> Customer must provide reasonable access to the work site during normal business hours (7:00 AM - 6:00 PM, Monday to Friday).</p>
            
            <h4>2. PAYMENT TERMS & CONDITIONS</h4>
            <p><strong>2.1 Payment Schedule:</strong> Payment is due within 7 days of work completion and customer acceptance.</p>
            <p><strong>2.2 Late Payment:</strong> Late payments incur a 1.5% monthly fee (18% per annum) after the due date.</p>
            <p><strong>2.3 Platform Processing:</strong> All payments are processed securely through TradieConnect's platform with no additional fees.</p>
            <p><strong>2.4 Variation Costs:</strong> Any additional work outside the original scope requires written agreement and may incur additional costs.</p>
            <p><strong>2.5 Disputed Payments:</strong> Payment disputes must be raised within 14 days of invoice date.</p>
            
            <h4>3. WARRANTY & GUARANTEES</h4>
            <p><strong>3.1 Workmanship Warranty:</strong> All work is guaranteed against defects in workmanship for 12 months from completion date.</p>
            <p><strong>3.2 Materials Warranty:</strong> Materials are covered by manufacturer's warranty terms, typically 1-10 years depending on the item.</p>
            <p><strong>3.3 Warranty Exclusions:</strong> Warranty does not cover normal wear and tear, misuse, or damage caused by third parties.</p>
            <p><strong>3.4 Warranty Claims:</strong> All warranty claims must be reported within 7 days of discovery and allow reasonable time for rectification.</p>
            
            <h4>4. HEALTH, SAFETY & COMPLIANCE</h4>
            <p><strong>4.1 Safety Standards:</strong> All work must comply with Australian Work Health and Safety (WHS) regulations and local building codes.</p>
            <p><strong>4.2 Insurance Coverage:</strong> Tradie maintains current public liability insurance ($2M minimum) and workers compensation insurance.</p>
            <p><strong>4.3 Safety Equipment:</strong> Customer must ensure safe working conditions and notify Tradie of any hazards on the property.</p>
            <p><strong>4.4 Compliance Certificates:</strong> All required compliance certificates will be provided upon work completion.</p>
            
            <h4>5. CANCELLATION & TERMINATION</h4>
            <p><strong>5.1 Customer Cancellation:</strong> Customer may cancel with 48 hours notice. Cancellation fees may apply for materials already ordered.</p>
            <p><strong>5.2 Tradie Cancellation:</strong> Tradie may cancel with 48 hours notice or immediately for safety concerns or non-payment.</p>
            <p><strong>5.3 Termination for Breach:</strong> Either party may terminate immediately for material breach of contract terms.</p>
            <p><strong>5.4 Completion of Partial Work:</strong> Payment is due for any work completed prior to cancellation.</p>
            
            <h4>6. DISPUTE RESOLUTION</h4>
            <p><strong>6.1 Good Faith Resolution:</strong> Parties agree to attempt resolution through good faith negotiation first.</p>
            <p><strong>6.2 Mediation:</strong> If direct negotiation fails, disputes will be resolved through mediation via TradieConnect's dispute resolution service.</p>
            <p><strong>6.3 Jurisdiction:</strong> This agreement is governed by the laws of New South Wales, Australia.</p>
            <p><strong>6.4 Limitation of Liability:</strong> Total liability is limited to the contract value, excluding consequential damages.</p>
            
            <h4>7. ADDITIONAL TERMS</h4>
            <p><strong>7.1 Force Majeure:</strong> Neither party is liable for delays due to events beyond reasonable control (weather, natural disasters, etc.).</p>
            <p><strong>7.2 Intellectual Property:</strong> All plans, designs, and specifications remain the property of their respective creators.</p>
            <p><strong>7.3 Privacy & Confidentiality:</strong> Both parties agree to maintain confidentiality of personal and property information.</p>
            <p><strong>7.4 Contract Amendments:</strong> Any changes to this agreement must be in writing and signed by both parties.</p>
            <p><strong>7.5 Entire Agreement:</strong> This contract represents the complete agreement between the parties and supersedes all prior negotiations.</p>
          `,
          signedBy: null,
          signedAt: null,
          signatureData: null,
          status: "pending",
          expiresAt: "2024-01-15T00:00:00Z",
          createdAt: "2024-01-08T10:00:00Z",
          job: {
            title: "Kitchen Sink Installation",
            description: "Replace old kitchen sink with new stainless steel model",
            category: "Plumbing",
            location: "Sydney, NSW"
          },
          customer: {
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@email.com"
          },
          tradie: {
            tradeName: "Eastern Suburbs Plumbing",
            user: {
              firstName: "Mike",
              lastName: "Johnson",
              email: "mike@esp.com.au"
            }
          }
        },
        {
          id: 2,
          jobId: 1,
          quoteId: 1,
          customerId: 1,
          tradieId: 3,
          contractType: "tradie",
          contractTemplate: "standard_tradie",
          contractTerms: `
            <h3>COMPREHENSIVE TRADE SERVICE CONTRACT</h3>
            <p><strong>CONTRACTOR:</strong> This agreement is between the Tradie (Service Provider) and the Customer as specified in the job posting, facilitated through TradieConnect Platform.</p>
            
            <h4>1. SCOPE OF WORK & DELIVERABLES</h4>
            <p><strong>1.1 Service Description:</strong> Professional trade services as detailed in the job posting, quote, and agreed specifications.</p>
            <p><strong>1.2 Work Standards:</strong> All work performed to Australian Standards (AS/NZS) and local council requirements.</p>
            <p><strong>1.3 Quality Assurance:</strong> Work will be inspected and tested before handover to ensure compliance and functionality.</p>
            <p><strong>1.4 Documentation:</strong> Provide compliance certificates, warranties, and maintenance instructions upon completion.</p>
            
            <h4>2. MATERIALS & EQUIPMENT</h4>
            <p><strong>2.1 Material Supply:</strong> Tradie provides all pipes, fittings, consumables, and ancillary materials unless specified otherwise.</p>
            <p><strong>2.2 Material Quality:</strong> All materials will be new, meet Australian Standards, and carry manufacturer warranties.</p>
            <p><strong>2.3 Customer-Supplied Items:</strong> Customer responsible for providing sink, fixtures, and any specified items as agreed in quote.</p>
            <p><strong>2.4 Material Defects:</strong> Defective materials will be replaced at no charge during warranty period.</p>
            
            <h4>3. WORKING CONDITIONS & SCHEDULE</h4>
            <p><strong>3.1 Working Hours:</strong> Standard business hours 7:00 AM - 6:00 PM, Monday to Friday. Weekend work available at premium rates (+50%).</p>
            <p><strong>3.2 Site Access:</strong> Customer must provide safe, unrestricted access to work area and utilities during agreed hours.</p>
            <p><strong>3.3 Utilities:</strong> Customer to provide access to water, electricity, and waste disposal facilities as required.</p>
            <p><strong>3.4 Parking:</strong> Customer to provide reasonable parking access or reimburse parking costs if applicable.</p>
            
            <h4>4. PROFESSIONAL OBLIGATIONS</h4>
            <p><strong>4.1 Licensing:</strong> Tradie holds current trade licenses and will provide evidence upon request.</p>
            <p><strong>4.2 Insurance:</strong> Maintains current public liability insurance ($2M minimum) and workers compensation coverage.</p>
            <p><strong>4.3 Safety Compliance:</strong> Will comply with all WHS regulations and use appropriate safety equipment.</p>
            <p><strong>4.4 Professional Conduct:</strong> Maintain professional behavior, respect property, and communicate courteously.</p>
            
            <h4>5. SITE SAFETY & CLEANLINESS</h4>
            <p><strong>5.1 Work Area:</strong> Tradie will maintain clean, safe work environment and protect surrounding areas.</p>
            <p><strong>5.2 Clean-up:</strong> Daily clean-up of immediate work area and removal of all debris upon completion.</p>
            <p><strong>5.3 Property Protection:</strong> Take reasonable care to protect customer property and report any damage immediately.</p>
            <p><strong>5.4 Hazard Management:</strong> Identify and communicate any site hazards to customer immediately.</p>
            
            <h4>6. PERMITS & APPROVALS</h4>
            <p><strong>6.1 Permit Responsibility:</strong> Tradie responsible for obtaining all trade-related permits and approvals.</p>
            <p><strong>6.2 Council Approvals:</strong> Customer responsible for major building approvals unless specifically agreed otherwise.</p>
            <p><strong>6.3 Inspection Coordination:</strong> Tradie will coordinate required inspections and provide access for inspectors.</p>
            <p><strong>6.4 Compliance Documentation:</strong> Provide all required compliance certificates and documentation.</p>
            
            <h4>7. PAYMENT PROTECTION & TERMS</h4>
            <p><strong>7.1 Payment Schedule:</strong> Payment due within 7 days of satisfactory completion and customer acceptance.</p>
            <p><strong>7.2 Progress Payments:</strong> For works over $5,000, progress payments may be claimed upon completion of defined milestones.</p>
            <p><strong>7.3 Variation Orders:</strong> Additional work requires written agreement and may incur additional charges.</p>
            <p><strong>7.4 Retention:</strong> Customer may retain 10% of contract value for 30 days as defect liability retention.</p>
            
            <h4>8. RISK MANAGEMENT</h4>
            <p><strong>8.1 Weather Delays:</strong> Outdoor work may be delayed due to weather conditions without penalty to either party.</p>
            <p><strong>8.2 Site Conditions:</strong> Unforeseen site conditions may require scope variations and additional costs.</p>
            <p><strong>8.3 Force Majeure:</strong> Neither party liable for delays due to events beyond reasonable control.</p>
            <p><strong>8.4 Third Party Delays:</strong> Delays caused by customer, suppliers, or authorities are not tradie responsibility.</p>
            
            <h4>9. COMPLETION & HANDOVER</h4>
            <p><strong>9.1 Practical Completion:</strong> Work deemed complete when functional, tested, and compliant with requirements.</p>
            <p><strong>9.2 Handover Process:</strong> Formal handover includes demonstration, documentation, and customer acceptance.</p>
            <p><strong>9.3 Defect Liability:</strong> 30-day defect liability period for immediate rectification of any defects.</p>
            <p><strong>9.4 Final Payment:</strong> Final payment due upon satisfactory completion and handover.</p>
          `,
          signedBy: 3,
          signedAt: "2024-01-08T11:30:00Z",
          signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          status: "signed",
          expiresAt: "2024-01-15T00:00:00Z",
          createdAt: "2024-01-08T10:00:00Z",
          job: {
            title: "Kitchen Sink Installation",
            description: "Replace old kitchen sink with new stainless steel model",
            category: "Plumbing",
            location: "Sydney, NSW"
          },
          customer: {
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@email.com"
          },
          tradie: {
            tradeName: "Eastern Suburbs Plumbing",
            user: {
              firstName: "Mike",
              lastName: "Johnson",
              email: "mike@esp.com.au"
            }
          }
        }
      ] as Contract[];
    }
  });

  const filteredContracts = (Array.isArray(contracts) ? contracts : []).filter(contract => {
    const matchesSearch = contract.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tradie?.tradeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const customerContracts = filteredContracts.filter(c => c.contractType === "customer");
  const tradieContracts = filteredContracts.filter(c => c.contractType === "tradie");

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-600";
      case "pending":
        return "bg-orange-600";
      case "expired":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const ContractCard = ({ contract }: { contract: Contract }) => {
    const isExpired = new Date(contract.expiresAt) < new Date();
    const actualStatus = isExpired && contract.status === "pending" ? "expired" : contract.status;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {contract.job.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {contract.contractType === "customer" ? "Customer Agreement" : "Trade Contract"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(actualStatus)}
              <Badge className={`${getStatusColor(actualStatus)} text-white`}>
                {actualStatus === "expired" ? "Expired" : contract.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <p className="text-gray-900">{contract.job.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <p className="text-gray-900">{contract.job.location}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Service Provider:</span>
              <p className="text-gray-900">{contract.tradie?.tradeName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expires:</span>
              <p className="text-gray-900">{new Date(contract.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>

          {contract.status === "signed" && contract.signedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Signed on {new Date(contract.signedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={() => handleViewContract(contract)}
            className="w-full"
            variant={contract.status === "pending" && !isExpired ? "default" : "outline"}
          >
            <FileText className="h-4 w-4 mr-2" />
            {contract.status === "pending" && !isExpired ? "Sign Contract" : "View Contract"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contracts</h1>
          <p className="text-gray-600">
            Manage your service agreements and trade contracts
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-end text-sm text-gray-600">
                {filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Tabs */}
        <Tabs defaultValue="customer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Contracts ({customerContracts.length})
            </TabsTrigger>
            <TabsTrigger value="tradie" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Trade Contracts ({tradieContracts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading contracts...</p>
              </div>
            ) : customerContracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Contracts</h3>
                  <p className="text-gray-600">
                    You don't have any customer service agreements yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customerContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tradie" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading contracts...</p>
              </div>
            ) : tradieContracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Trade Contracts</h3>
                  <p className="text-gray-600">
                    You don't have any trade service contracts yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradieContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Contract Modal */}
        <ContractModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contract={selectedContract}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}