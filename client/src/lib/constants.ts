export const TRADE_CATEGORIES = [
  { 
    id: 1, 
    name: "Plumbing", 
    icon: "fas fa-hammer", 
    jobCount: 234,
    description: "Professional plumbing services including pipe repairs, fixture installations, drain cleaning, and emergency leak fixes. Our licensed plumbers handle everything from simple tap repairs to complete bathroom renovations.",
    services: ["Leak repairs", "Pipe installation", "Drain cleaning", "Fixture installation", "Emergency callouts", "Bathroom renovations"],
    averageRate: "$80-120/hour",
    typicalJobs: ["Blocked drains", "Leaking taps", "Toilet repairs", "Hot water systems", "Bathroom installations"]
  },
  { 
    id: 2, 
    name: "Electrical", 
    icon: "fas fa-bolt", 
    jobCount: 189,
    description: "Certified electrical services covering wiring, lighting installations, safety switches, and electrical repairs. All work performed by licensed electricians following Australian safety standards.",
    services: ["Wiring installation", "Lighting setup", "Safety switches", "Power points", "Electrical repairs", "Ceiling fans"],
    averageRate: "$90-140/hour",
    typicalJobs: ["New power points", "Light installations", "Electrical faults", "Safety inspections", "Switchboard upgrades"]
  },
  { 
    id: 3, 
    name: "Painting", 
    icon: "fas fa-paint-roller", 
    jobCount: 156,
    description: "Interior and exterior painting services using quality paints and professional techniques. From single rooms to whole house makeovers, our painters deliver exceptional results.",
    services: ["Interior painting", "Exterior painting", "Wallpaper removal", "Surface preparation", "Color consultation", "Protective coatings"],
    averageRate: "$45-65/hour",
    typicalJobs: ["Room painting", "House exteriors", "Feature walls", "Fence painting", "Commercial spaces"]
  },
  { 
    id: 4, 
    name: "Carpentry", 
    icon: "fas fa-tools", 
    jobCount: 198,
    description: "Custom carpentry and woodworking services including built-in furniture, decking, shelving, and structural repairs. Skilled craftsmen delivering quality timber solutions.",
    services: ["Custom furniture", "Decking", "Shelving", "Door installation", "Structural repairs", "Renovations"],
    averageRate: "$65-95/hour",
    typicalJobs: ["Built-in wardrobes", "Deck construction", "Kitchen installations", "Door hanging", "Timber repairs"]
  },
  { 
    id: 5, 
    name: "HVAC", 
    icon: "fas fa-wrench", 
    jobCount: 87,
    description: "Heating, ventilation, and air conditioning services including installation, maintenance, and repairs. Keep your home comfortable year-round with professional HVAC solutions.",
    services: ["AC installation", "Heating systems", "Ventilation", "Maintenance", "Repairs", "Duct cleaning"],
    averageRate: "$85-125/hour",
    typicalJobs: ["Air conditioner installation", "Heater repairs", "Duct cleaning", "System maintenance", "Ventilation upgrades"]
  },
  { 
    id: 6, 
    name: "Roofing", 
    icon: "fas fa-home", 
    jobCount: 145,
    description: "Complete roofing services including repairs, replacements, gutter installation, and maintenance. Protect your home with quality roofing solutions from experienced professionals.",
    services: ["Roof repairs", "Roof replacement", "Gutter installation", "Roof cleaning", "Insulation", "Storm damage"],
    averageRate: "$70-110/hour",
    typicalJobs: ["Roof leak repairs", "Gutter replacement", "Tile replacement", "Roof cleaning", "Insurance claims"]
  },
  { 
    id: 7, 
    name: "Landscaping", 
    icon: "fas fa-leaf", 
    jobCount: 167,
    description: "Professional landscaping services including garden design, lawn care, tree services, and outdoor construction. Transform your outdoor space with expert landscape solutions.",
    services: ["Garden design", "Lawn installation", "Tree pruning", "Irrigation systems", "Retaining walls", "Outdoor lighting"],
    averageRate: "$55-85/hour",
    typicalJobs: ["Garden makeovers", "Lawn installation", "Tree removal", "Hedge trimming", "Pathway construction"]
  },
  { 
    id: 8, 
    name: "Tiling", 
    icon: "fas fa-th", 
    jobCount: 132,
    description: "Expert tiling services for bathrooms, kitchens, and outdoor areas. Quality tile installation, repairs, and waterproofing by experienced tilers.",
    services: ["Bathroom tiling", "Kitchen splashbacks", "Floor tiling", "Waterproofing", "Tile repairs", "Grouting"],
    averageRate: "$60-90/hour",
    typicalJobs: ["Bathroom renovations", "Kitchen splashbacks", "Floor installations", "Shower repairs", "Tile replacement"]
  },
  { 
    id: 9, 
    name: "Fencing", 
    icon: "fas fa-border-style", 
    jobCount: 98,
    description: "Residential and commercial fencing solutions including timber, colorbond, and pool fencing. Secure your property with quality fencing installation and repairs.",
    services: ["Timber fencing", "Colorbond fencing", "Pool fencing", "Gate installation", "Fence repairs", "Security fencing"],
    averageRate: "$50-80/hour",
    typicalJobs: ["Backyard fencing", "Pool fencing", "Gate installation", "Fence repairs", "Security upgrades"]
  },
  { 
    id: 10, 
    name: "Cleaning", 
    icon: "fas fa-broom", 
    jobCount: 76,
    description: "Professional cleaning services for homes and businesses including deep cleaning, carpet cleaning, and specialized cleaning solutions.",
    services: ["House cleaning", "Carpet cleaning", "Window cleaning", "Deep cleaning", "End of lease cleaning", "Commercial cleaning"],
    averageRate: "$35-55/hour",
    typicalJobs: ["Regular house cleaning", "Carpet steam cleaning", "Window cleaning", "End of lease cleaning", "Post-construction cleaning"]
  },
  { 
    id: 11, 
    name: "Flooring", 
    icon: "fas fa-layer-group", 
    jobCount: 64,
    description: "Expert flooring installation and repair services including timber, laminate, vinyl, and carpet flooring solutions.",
    services: ["Timber flooring", "Laminate installation", "Vinyl flooring", "Carpet installation", "Floor sanding", "Floor repairs"],
    averageRate: "$65-95/hour",
    typicalJobs: ["Timber floor installation", "Laminate flooring", "Carpet replacement", "Floor sanding", "Vinyl installation"]
  },
  { 
    id: 12, 
    name: "Locksmith", 
    icon: "fas fa-key", 
    jobCount: 42,
    description: "Emergency and general locksmith services including lock installations, repairs, and security upgrades for homes and businesses.",
    services: ["Lock installation", "Lock repairs", "Key cutting", "Security upgrades", "Emergency lockouts", "Safe installation"],
    averageRate: "$85-150/hour",
    typicalJobs: ["Emergency lockouts", "Lock replacements", "Key cutting", "Security upgrades", "Safe installation"]
  },
  { 
    id: 13, 
    name: "Demolition", 
    icon: "fas fa-hammer", 
    jobCount: 38,
    description: "Safe demolition services for residential and commercial projects including partial demolition, renovation preparation, and site clearing.",
    services: ["Partial demolition", "Wall removal", "Site clearing", "Renovation preparation", "Debris removal", "Structural demolition"],
    averageRate: "$70-120/hour",
    typicalJobs: ["Wall removal", "Kitchen demolition", "Bathroom demolition", "Shed demolition", "Site preparation"]
  },
  { 
    id: 14, 
    name: "Handyman", 
    icon: "fas fa-tools", 
    jobCount: 156,
    description: "General handyman services for home repairs, maintenance, and small projects that don't require specialized trades.",
    services: ["General repairs", "Furniture assembly", "Hanging pictures", "Minor plumbing", "Small electrical", "Maintenance"],
    averageRate: "$45-75/hour",
    typicalJobs: ["Furniture assembly", "Hanging pictures", "Minor repairs", "Gutter cleaning", "Pressure washing"]
  },
  { 
    id: 15, 
    name: "Concreting", 
    icon: "fas fa-cube", 
    jobCount: 89,
    description: "Professional concreting services including driveways, patios, footpaths, and decorative concrete work.",
    services: ["Driveways", "Patios", "Footpaths", "Decorative concrete", "Concrete repairs", "Exposed aggregate"],
    averageRate: "$60-100/hour",
    typicalJobs: ["Concrete driveways", "Patio construction", "Footpath installation", "Concrete repairs", "Decorative finishes"]
  },
  { 
    id: 16, 
    name: "Glazing", 
    icon: "fas fa-window-maximize", 
    jobCount: 31,
    description: "Window and glass services including installations, repairs, and replacements for residential and commercial properties.",
    services: ["Window installation", "Glass repairs", "Window replacements", "Shower screens", "Mirrors", "Glazing repairs"],
    averageRate: "$75-110/hour",
    typicalJobs: ["Window replacements", "Shower screen installation", "Glass repairs", "Mirror installation", "Glazing repairs"]
  },
  { 
    id: 17, 
    name: "Pest Control", 
    icon: "fas fa-bug", 
    jobCount: 67,
    description: "Professional pest control services including termite treatments, general pest control, and preventative measures.",
    services: ["Termite treatments", "General pest control", "Rodent control", "Insect control", "Preventative treatments", "Inspections"],
    averageRate: "$90-180/hour",
    typicalJobs: ["Termite inspections", "General pest treatments", "Rodent control", "Ant treatments", "Cockroach control"]
  },
  { 
    id: 18, 
    name: "Pool Services", 
    icon: "fas fa-swimming-pool", 
    jobCount: 54,
    description: "Complete pool services including cleaning, maintenance, repairs, and equipment installation for residential pools.",
    services: ["Pool cleaning", "Pool maintenance", "Equipment repairs", "Pool heating", "Safety inspections", "Chemical balancing"],
    averageRate: "$65-95/hour",
    typicalJobs: ["Regular pool cleaning", "Pool equipment repairs", "Pool heating installation", "Safety inspections", "Chemical treatments"]
  },
  { 
    id: 19, 
    name: "Insulation", 
    icon: "fas fa-snowflake", 
    jobCount: 43,
    description: "Energy-efficient insulation services including ceiling, wall, and underfloor insulation installation and upgrades.",
    services: ["Ceiling insulation", "Wall insulation", "Underfloor insulation", "Insulation removal", "Energy assessments", "Insulation upgrades"],
    averageRate: "$55-85/hour",
    typicalJobs: ["Ceiling insulation", "Wall insulation", "Insulation removal", "Energy efficiency upgrades", "Thermal assessments"]
  },
];

export const TIMELINE_OPTIONS = [
  "ASAP",
  "This week", 
  "Next week",
  "Within a month",
  "Flexible timing"
];

export const AUSTRALIAN_STATES = [
  "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"
];
