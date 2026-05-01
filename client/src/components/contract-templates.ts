// Comprehensive contract templates for different trade categories and job types

export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  terms: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "plumbing_standard",
    name: "Standard Plumbing Agreement",
    category: "Plumbing",
    description: "Comprehensive contract for plumbing installations, repairs, and maintenance",
    terms: `
      <h3>COMPREHENSIVE PLUMBING SERVICE AGREEMENT</h3>
      <p><strong>PARTIES:</strong> This agreement is between the Customer and Licensed Plumber, facilitated through TradieConnect Platform.</p>
      
      <h4>1. SCOPE OF PLUMBING SERVICES</h4>
      <p><strong>1.1 Service Description:</strong> Professional plumbing services including installation, repair, maintenance, and testing of water supply, drainage, and gas systems.</p>
      <p><strong>1.2 Compliance Standards:</strong> All work performed in accordance with Australian Standards AS/NZS 3500 (Plumbing and Drainage) and local council requirements.</p>
      <p><strong>1.3 Licensing Requirements:</strong> Plumber holds current trade license and will provide evidence upon request.</p>
      <p><strong>1.4 Testing & Commissioning:</strong> All installations will be pressure tested and commissioned before handover.</p>
      
      <h4>2. MATERIALS & EQUIPMENT</h4>
      <p><strong>2.1 Material Standards:</strong> All materials meet Australian Standards and carry manufacturer warranties (typically 10-25 years for pipes, 5-10 years for fixtures).</p>
      <p><strong>2.2 Water Efficiency:</strong> All fixtures meet WELS (Water Efficiency Labelling and Standards) requirements where applicable.</p>
      <p><strong>2.3 Material Supply:</strong> Plumber provides all pipes, fittings, consumables unless customer-supplied items are specified in quote.</p>
      <p><strong>2.4 Approved Materials:</strong> Only use materials approved by relevant authorities (e.g., WaterMark certified).</p>
      
      <h4>3. SAFETY & COMPLIANCE</h4>
      <p><strong>3.1 Gas Work:</strong> Gas fitting work only performed by licensed gas fitters with current certification.</p>
      <p><strong>3.2 Backflow Prevention:</strong> Install appropriate backflow prevention devices as required by water authority.</p>
      <p><strong>3.3 Hot Water Systems:</strong> All hot water system work complies with AS/NZS 3500.4 and local authority requirements.</p>
      <p><strong>3.4 Excavation Safety:</strong> Dial Before You Dig service used for all excavation work.</p>
      
      <h4>4. WARRANTIES & GUARANTEES</h4>
      <p><strong>4.1 Workmanship Warranty:</strong> 12-month warranty on all workmanship defects.</p>
      <p><strong>4.2 Material Warranty:</strong> Pass-through manufacturer warranties on all materials and fixtures.</p>
      <p><strong>4.3 Leak Warranty:</strong> 12-month warranty against leaks in joints and connections.</p>
      <p><strong>4.4 Emergency Service:</strong> 24-hour emergency contact for warranty-related issues.</p>
      
      <h4>5. PAYMENT & INVOICING</h4>
      <p><strong>5.1 Payment Terms:</strong> Net 7 days from invoice date for residential work, 30 days for commercial work.</p>
      <p><strong>5.2 Progress Payments:</strong> For works over $5,000, progress payments may be claimed at defined milestones.</p>
      <p><strong>5.3 Variations:</strong> Additional work requires written approval and may incur additional charges.</p>
      <p><strong>5.4 Retention:</strong> Customer may retain 10% for 30 days as defect liability retention.</p>
      
      <h4>6. PERMITS & INSPECTIONS</h4>
      <p><strong>6.1 Permits:</strong> Plumber responsible for obtaining all required trade permits and approvals.</p>
      <p><strong>6.2 Inspections:</strong> Coordinate and provide access for required council and water authority inspections.</p>
      <p><strong>6.3 Compliance Certificates:</strong> Provide all required compliance certificates and documentation.</p>
      <p><strong>6.4 Authority Notifications:</strong> Notify relevant authorities of work completion as required.</p>
    `
  },
  {
    id: "electrical_standard",
    name: "Standard Electrical Agreement",
    category: "Electrical",
    description: "Comprehensive contract for electrical installations, repairs, and maintenance",
    terms: `
      <h3>COMPREHENSIVE ELECTRICAL SERVICE AGREEMENT</h3>
      <p><strong>PARTIES:</strong> This agreement is between the Customer and Licensed Electrician, facilitated through TradieConnect Platform.</p>
      
      <h4>1. SCOPE OF ELECTRICAL SERVICES</h4>
      <p><strong>1.1 Service Description:</strong> Professional electrical services including installation, repair, maintenance, and testing of electrical systems and equipment.</p>
      <p><strong>1.2 Compliance Standards:</strong> All work performed in accordance with Australian Standards AS/NZS 3000 (Wiring Rules) and local authority requirements.</p>
      <p><strong>1.3 Licensing Requirements:</strong> Electrician holds current electrical license and will provide evidence upon request.</p>
      <p><strong>1.4 Testing & Certification:</strong> All installations will be tested and certified before energization.</p>
      
      <h4>2. SAFETY & COMPLIANCE</h4>
      <p><strong>2.1 Electrical Safety:</strong> All work complies with Occupational Health and Safety regulations and electrical safety standards.</p>
      <p><strong>2.2 Isolation Procedures:</strong> Proper isolation and lockout/tagout procedures followed for all electrical work.</p>
      <p><strong>2.3 RCD Protection:</strong> Install appropriate RCD (Residual Current Device) protection as required by standards.</p>
      <p><strong>2.4 Switchboard Compliance:</strong> All switchboard work meets current standards and labeling requirements.</p>
      
      <h4>3. MATERIALS & EQUIPMENT</h4>
      <p><strong>3.1 Approved Equipment:</strong> All electrical equipment and materials meet Australian Standards and carry appropriate certifications.</p>
      <p><strong>3.2 Energy Efficiency:</strong> Recommend and install energy-efficient solutions where applicable.</p>
      <p><strong>3.3 Cable Standards:</strong> Use appropriate cable types and sizes as per AS/NZS 3008 (cable selection standards).</p>
      <p><strong>3.4 Equipment Warranties:</strong> Pass-through manufacturer warranties on all electrical equipment.</p>
      
      <h4>4. TESTING & CERTIFICATION</h4>
      <p><strong>4.1 Electrical Testing:</strong> Comprehensive testing including insulation resistance, continuity, and RCD testing.</p>
      <p><strong>4.2 Compliance Certificates:</strong> Provide Certificate of Electrical Safety and other required documentation.</p>
      <p><strong>4.3 Test Results:</strong> Provide detailed test results and measurements for all installations.</p>
      <p><strong>4.4 Periodic Testing:</strong> Advise on future testing requirements and maintenance schedules.</p>
      
      <h4>5. WARRANTIES & GUARANTEES</h4>
      <p><strong>5.1 Workmanship Warranty:</strong> 12-month warranty on all electrical workmanship.</p>
      <p><strong>5.2 Equipment Warranty:</strong> Pass-through manufacturer warranties on all electrical equipment.</p>
      <p><strong>5.3 Safety Guarantee:</strong> All work guaranteed to meet electrical safety standards.</p>
      <p><strong>5.4 Emergency Service:</strong> 24-hour emergency contact for electrical safety issues.</p>
      
      <h4>6. PERMITS & NOTIFICATIONS</h4>
      <p><strong>6.1 Electrical Permits:</strong> Electrician responsible for obtaining all required electrical permits.</p>
      <p><strong>6.2 Authority Notifications:</strong> Notify electricity distributor and relevant authorities as required.</p>
      <p><strong>6.3 Inspections:</strong> Coordinate and provide access for required electrical inspections.</p>
      <p><strong>6.4 Connection Approvals:</strong> Obtain necessary approvals for new connections or modifications.</p>
    `
  },
  {
    id: "building_standard",
    name: "Standard Building/Construction Agreement",
    category: "Building",
    description: "Comprehensive contract for building, renovation, and construction work",
    terms: `
      <h3>COMPREHENSIVE BUILDING & CONSTRUCTION AGREEMENT</h3>
      <p><strong>PARTIES:</strong> This agreement is between the Customer and Licensed Builder, facilitated through TradieConnect Platform.</p>
      
      <h4>1. SCOPE OF BUILDING WORKS</h4>
      <p><strong>1.1 Work Description:</strong> Building, renovation, and construction services as detailed in plans, specifications, and quote.</p>
      <p><strong>1.2 Building Standards:</strong> All work performed in accordance with Building Code of Australia (BCA) and local council requirements.</p>
      <p><strong>1.3 Licensing Requirements:</strong> Builder holds current building license and will provide evidence upon request.</p>
      <p><strong>1.4 Quality Standards:</strong> All work meets or exceeds Australian Standards and industry best practices.</p>
      
      <h4>2. PERMITS & APPROVALS</h4>
      <p><strong>2.1 Building Permits:</strong> Builder responsible for obtaining all required building permits and approvals.</p>
      <p><strong>2.2 Development Consent:</strong> Customer responsible for obtaining development consent where required.</p>
      <p><strong>2.3 Authority Inspections:</strong> Coordinate and provide access for all required council and authority inspections.</p>
      <p><strong>2.4 Compliance Documentation:</strong> Provide all required certificates and compliance documentation.</p>
      
      <h4>3. MATERIALS & WORKMANSHIP</h4>
      <p><strong>3.1 Material Standards:</strong> All materials meet Australian Standards and carry appropriate certifications.</p>
      <p><strong>3.2 Structural Integrity:</strong> All structural work designed and certified by qualified structural engineer where required.</p>
      <p><strong>3.3 Weatherproofing:</strong> All external work includes appropriate weatherproofing and protection.</p>
      <p><strong>3.4 Finish Quality:</strong> All finishes meet specified standards and customer expectations.</p>
      
      <h4>4. INSURANCE & LIABILITY</h4>
      <p><strong>4.1 Home Building Insurance:</strong> Appropriate home building compensation insurance in place for residential work over $20,000.</p>
      <p><strong>4.2 Public Liability:</strong> Maintain current public liability insurance ($5M minimum for building work).</p>
      <p><strong>4.3 Workers Compensation:</strong> Current workers compensation insurance for all workers on site.</p>
      <p><strong>4.4 Contract Works Insurance:</strong> Appropriate insurance coverage for work in progress.</p>
      
      <h4>5. DEFECTS & WARRANTIES</h4>
      <p><strong>5.1 Defect Liability:</strong> 6-month defect liability period for rectification of construction defects.</p>
      <p><strong>5.2 Structural Warranty:</strong> 6-year warranty on structural defects as per Home Building Act.</p>
      <p><strong>5.3 Waterproofing Warranty:</strong> 6-year warranty on waterproofing work in wet areas.</p>
      <p><strong>5.4 Maintenance Period:</strong> 12-month maintenance period for non-structural defects.</p>
      
      <h4>6. PAYMENT SCHEDULE</h4>
      <p><strong>6.1 Progress Payments:</strong> Payments linked to defined milestones and completion of work stages.</p>
      <p><strong>6.2 Retention:</strong> Customer may retain 5% of contract value for 6 months as defect liability retention.</p>
      <p><strong>6.3 Variation Orders:</strong> All variations require written approval and may incur additional costs.</p>
      <p><strong>6.4 Final Payment:</strong> Final payment due upon practical completion and handover.</p>
    `
  },
  {
    id: "general_maintenance",
    name: "General Maintenance Agreement",
    category: "General",
    description: "Standard contract for general maintenance and repair services",
    terms: `
      <h3>GENERAL MAINTENANCE & REPAIR AGREEMENT</h3>
      <p><strong>PARTIES:</strong> This agreement is between the Customer and Service Provider, facilitated through TradieConnect Platform.</p>
      
      <h4>1. SCOPE OF MAINTENANCE SERVICES</h4>
      <p><strong>1.1 Service Description:</strong> General maintenance, repair, and improvement services as detailed in job posting and quote.</p>
      <p><strong>1.2 Work Standards:</strong> All work performed to professional standards and industry best practices.</p>
      <p><strong>1.3 Skill Requirements:</strong> Service provider has appropriate skills and experience for the specified work.</p>
      <p><strong>1.4 Safety Compliance:</strong> All work complies with relevant safety standards and regulations.</p>
      
      <h4>2. MATERIALS & EQUIPMENT</h4>
      <p><strong>2.1 Material Quality:</strong> All materials suitable for intended purpose and carry appropriate warranties.</p>
      <p><strong>2.2 Equipment Use:</strong> Use appropriate tools and equipment for safe and efficient completion.</p>
      <p><strong>2.3 Customer Supplies:</strong> Customer-supplied materials used at customer's risk.</p>
      <p><strong>2.4 Waste Management:</strong> Appropriate disposal of waste materials and debris.</p>
      
      <h4>3. SITE SAFETY & PROTECTION</h4>
      <p><strong>3.1 Property Protection:</strong> Take reasonable care to protect customer property during work.</p>
      <p><strong>3.2 Work Area Safety:</strong> Maintain safe work environment and use appropriate safety equipment.</p>
      <p><strong>3.3 Public Safety:</strong> Ensure work does not endanger public safety or property.</p>
      <p><strong>3.4 Environmental Protection:</strong> Comply with environmental protection requirements.</p>
      
      <h4>4. COMPLETION & HANDOVER</h4>
      <p><strong>4.1 Work Completion:</strong> Work deemed complete when functional and meets specified requirements.</p>
      <p><strong>4.2 Clean-up:</strong> Clean work area and remove all debris and waste materials.</p>
      <p><strong>4.3 Customer Acceptance:</strong> Customer inspection and acceptance of completed work.</p>
      <p><strong>4.4 Documentation:</strong> Provide relevant documentation, warranties, and maintenance instructions.</p>
      
      <h4>5. WARRANTIES & GUARANTEES</h4>
      <p><strong>5.1 Workmanship Warranty:</strong> 3-month warranty on workmanship for maintenance and repair work.</p>
      <p><strong>5.2 Material Warranty:</strong> Pass-through manufacturer warranties on materials and components.</p>
      <p><strong>5.3 Warranty Exclusions:</strong> Warranty does not cover normal wear and tear or misuse.</p>
      <p><strong>5.4 Warranty Service:</strong> Reasonable response time for warranty-related issues.</p>
      
      <h4>6. PAYMENT & COMPLETION</h4>
      <p><strong>6.1 Payment Terms:</strong> Payment due within 7 days of satisfactory completion.</p>
      <p><strong>6.2 Additional Work:</strong> Any additional work outside original scope requires written agreement.</p>
      <p><strong>6.3 Partial Completion:</strong> Payment due for work completed if job is terminated early.</p>
      <p><strong>6.4 Dispute Resolution:</strong> Disputes resolved through TradieConnect mediation service.</p>
    `
  }
];

// Helper function to get contract template by category
export function getContractTemplate(category: string): ContractTemplate {
  const template = CONTRACT_TEMPLATES.find(t => t.category === category);
  return template || CONTRACT_TEMPLATES.find(t => t.category === "General")!;
}

// Helper function to customize contract terms with job-specific details
export function customizeContractTerms(template: ContractTemplate, jobDetails: {
  title: string;
  description: string;
  location: string;
  budget?: string;
  timeline?: string;
}): string {
  let customizedTerms = template.terms;
  
  // Replace placeholders with job-specific details
  customizedTerms = customizedTerms.replace(/\{JOB_TITLE\}/g, jobDetails.title);
  customizedTerms = customizedTerms.replace(/\{JOB_DESCRIPTION\}/g, jobDetails.description);
  customizedTerms = customizedTerms.replace(/\{JOB_LOCATION\}/g, jobDetails.location);
  
  if (jobDetails.budget) {
    customizedTerms = customizedTerms.replace(/\{JOB_BUDGET\}/g, jobDetails.budget);
  }
  
  if (jobDetails.timeline) {
    customizedTerms = customizedTerms.replace(/\{JOB_TIMELINE\}/g, jobDetails.timeline);
  }
  
  return customizedTerms;
}