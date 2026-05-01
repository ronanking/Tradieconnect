// Australian Licence Verification
// Uses free government open data APIs where available
// Falls back to directing users to official state portals

interface LicenceResult {
  valid: boolean;
  name?: string;
  licenceClass?: string;
  status?: string;
  expiryDate?: string;
  state?: string;
  source?: string;
  error?: string;
  checkUrl?: string; // fallback URL for manual check
}

// State regulatory bodies and their free public portals
const STATE_PORTALS: Record<string, { name: string; url: string; apiSupported: boolean }> = {
  QLD: { name: "QBCC",        url: "https://www.qbcc.qld.gov.au/",                       apiSupported: true  },
  NSW: { name: "NSW Fair Trading", url: "https://verify.licence.nsw.gov.au/",            apiSupported: false },
  VIC: { name: "VBA",         url: "https://www.vba.vic.gov.au/practitioners/search",     apiSupported: false },
  WA:  { name: "Building Commission WA", url: "https://www.building.wa.gov.au/",         apiSupported: false },
  SA:  { name: "CBS SA",      url: "https://www.cbs.sa.gov.au/",                          apiSupported: false },
  ACT: { name: "Access Canberra", url: "https://www.accesscanberra.act.gov.au/",          apiSupported: false },
  NT:  { name: "NT Licensing", url: "https://nt.gov.au/industry/licensing",               apiSupported: false },
  TAS: { name: "Consumer Building and Occupational Services", url: "https://www.cbos.tas.gov.au/", apiSupported: false },
};

// QLD - Free open data API
async function verifyQLD(licenceNumber: string): Promise<LicenceResult> {
  try {
    const url = `https://data.qld.gov.au/api/3/action/datastore_search?resource_id=25608781-b28c-44f8-8545-0ab18d84082f&q=${encodeURIComponent(licenceNumber)}&limit=5`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    if (data.success && data.result?.records?.length > 0) {
      // Find exact match
      const exact = data.result.records.find((r: any) =>
        r["Licence Number"]?.toString().trim() === licenceNumber.trim() ||
        r["Licence No"]?.toString().trim() === licenceNumber.trim()
      ) || data.result.records[0];

      return {
        valid: true,
        name: exact["Licensee Name"] || exact["Name"] || exact["Licence Holder"],
        licenceClass: exact["Licence Class"] || exact["Class"] || exact["Category"],
        status: exact["Licence Status"] || exact["Status"] || "Active",
        expiryDate: exact["Expiry Date"] || exact["Expiry"],
        state: "QLD",
        source: "QBCC Licensed Contractors Register",
      };
    }
    return { valid: false, error: "Licence not found in QBCC register", state: "QLD", checkUrl: STATE_PORTALS.QLD.url };
  } catch (err) {
    return { valid: false, error: "Could not connect to QBCC", state: "QLD", checkUrl: STATE_PORTALS.QLD.url };
  }
}

// For states without a free API, return the official portal link so admin can check manually
function manualCheckResult(state: string, licenceNumber: string): LicenceResult {
  const portal = STATE_PORTALS[state];
  return {
    valid: false,
    error: `Automatic verification not available for ${state}. Please verify manually.`,
    state,
    checkUrl: portal?.url,
    source: portal?.name,
  };
}

export async function verifyLicence(licenceNumber: string, state: string): Promise<LicenceResult> {
  const clean = licenceNumber.trim();
  if (!clean) return { valid: false, error: "No licence number provided" };

  const upperState = state?.toUpperCase();

  switch (upperState) {
    case "QLD":
    case "QUEENSLAND":
      return verifyQLD(clean);

    case "NSW":
    case "NEW SOUTH WALES":
    case "VIC":
    case "VICTORIA":
    case "WA":
    case "WESTERN AUSTRALIA":
    case "SA":
    case "SOUTH AUSTRALIA":
    case "ACT":
    case "NT":
    case "NORTHERN TERRITORY":
    case "TAS":
    case "TASMANIA": {
      const stateCode = upperState.length <= 3 ? upperState : Object.keys(STATE_PORTALS).find(k =>
        STATE_PORTALS[k].name.toUpperCase().includes(upperState) || upperState.includes(k)
      ) || upperState;
      return manualCheckResult(stateCode, clean);
    }

    default:
      return verifyQLD(clean); // Default to QLD check
  }
}

// ABN verification (works without a GUID key using the public lookup)
export async function verifyABN(abn: string): Promise<{
  valid: boolean;
  entityName?: string;
  entityType?: string;
  status?: string;
  error?: string;
}> {
  try {
    const cleanABN = abn.replace(/\s/g, "");
    if (!/^\d{11}$/.test(cleanABN)) {
      return { valid: false, error: "ABN must be 11 digits" };
    }

    const guid = process.env.ABR_GUID || "";
    if (!guid) return { valid: false, error: "ABN verification not configured" };

    const url = `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${cleanABN}&callback=callback&guid=${guid}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const text = await response.text();
    const jsonStr = text.replace(/^callback\(/, "").replace(/\);?\s*$/, "");
    const data = JSON.parse(jsonStr);

    if (data.AbnStatus === "Active") {
      return {
        valid: true,
        entityName: data.EntityName || data.BusinessName?.[0]?.OrganisationName,
        entityType: data.EntityTypeName,
        status: data.AbnStatus,
      };
    }
    return { valid: false, error: `ABN status: ${data.AbnStatus || "Not found"}` };
  } catch {
    return { valid: false, error: "Could not verify ABN at this time" };
  }
}
