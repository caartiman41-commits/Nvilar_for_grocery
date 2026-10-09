export interface LegalSection {
  number: number;
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: 'merchant_agreement' | 'terms_conditions' | 'privacy_policy';
  title: string;
  cardSubtitle: string;
  linkText: string;
  version: string;
  lastUpdated: string;
  preambleSubtitle?: string;
  sections: LegalSection[];
  acceptButtonText: string;
}

export const SELLER_LEGAL_DOCUMENTS: Record<'merchant_agreement' | 'terms_conditions' | 'privacy_policy', LegalDocument> = {
  merchant_agreement: {
    id: 'merchant_agreement',
    title: 'Nvilar Seller Merchant Agreement',
    cardSubtitle: 'Commercial contract, SLA, commissions, T+2/T+3 payouts, TCS/TDS deductions & anti-counterfeiting policy.',
    linkText: 'Read full agreement',
    version: 'v2.4 - September 2026',
    lastUpdated: 'September 21, 2026',
    acceptButtonText: 'I Agree & Accept Merchant Agreement',
    sections: [
      {
        number: 1,
        title: 'Preamble & Scope of Engagement',
        paragraphs: [
          'This Nvilar Seller Merchant Agreement ("Agreement") is legally executed between Nvilar Technologies Private Limited ("Nvilar", "Marketplace", "We", "Us") and the commercial entity, partnership, or individual proprietor successfully registering as a merchant ("Seller", "Merchant", "You").',
          'By completing registration and selecting the acceptance checkbox, the Merchant unconditionally consents to offer, display, and sell authentic fashion, apparel, and lifestyle merchandise on the Nvilar platform under the terms and conditions outlined herein.',
          'This electronic agreement constitutes an enforceable contract under the Indian Contract Act, 1872, and Section 10A of the Information Technology Act, 2000.',
        ],
      },
      {
        number: 2,
        title: 'Onboarding, KYC Verification & Legal Identity',
        paragraphs: [
          'The Seller represents and warrants that all registration documents submitted—including Aadhaar Card, Permanent Account Number (PAN), Goods and Services Tax Identification Number (GSTIN), Trade Licenses, Certificate of Incorporation (CoI), and Bank Details—are genuine, unaltered, and belong exclusively to the legal entity or proprietor named.',
          'Nvilar conducts a strict 24–48 hour automated and manual compliance review. Any discovery of forged, fraudulent, or impersonated identity documents will lead to immediate cancellation of application, permanent forfeiture of seller privileges, and reporting to relevant statutory law enforcement bodies under Section 420 and Section 468 of the Indian Penal Code.',
          'The Seller undertakes to notify Nvilar within forty-eight (48) hours of any material alteration in its business structure, GST registration status, director/partner appointments, or bank account details.',
        ],
      },
      {
        number: 3,
        title: 'Hyperlocal Delivery, Store GPS & 30-Minute SLA Standards',
        paragraphs: [
          'Nvilar operates a hyperlocal quick-commerce fashion fulfillment network designed for rapid consumer delivery (< 9km boutique radar).',
          'The Seller agrees to maintain high-accuracy GPS store coordinates on record at all times. Physical boutique verification may be conducted by Nvilar onboarding personnel prior to storefront live status.',
          'Upon receipt of a customer purchase order on the Nvilar Seller Portal, the Seller undertakes to accept the order within three (3) minutes and execute packaging, quality inspection, and parcel handover to the designated Nvilar logistics partner within ten to fifteen (10–15) minutes.',
          'Repeated failure to meet dispatch windows, resulting in customer SLA breaches or delivery delays, will incur operational delay surcharges and may trigger automatic temporary suppression of the Seller storefront.',
        ],
      },
      {
        number: 4,
        title: 'Commercial Structure, Platform Commission & Service Fees',
        paragraphs: [
          'The Marketplace operates on a performance-based facilitation commission structure ranging between 5% to 15% of the net transaction value (excluding applicable statutory taxes), depending on product category and sales volume.',
          'A standardized Payment Processing & Gateway fee of 2.0% (plus applicable GST) shall be levied on all digital prepaid and card transactions.',
          'Nvilar shall furnish monthly commercial GST tax invoices detailing total commissions, logistics fulfillment charges, and marketing platform fees accrued during the billing period.',
        ],
      },
      {
        number: 5,
        title: 'Settlements, Payout Cycles & Statutory Tax Deductions',
        paragraphs: [
          'Net sales proceeds, after deduction of agreed platform commissions, gateway charges, and applicable statutory taxes, shall be settled into the Seller verified UPI VPA or Bank Account on a T+2 / T+3 business-day schedule following successful delivery confirmation.',
          'In strict compliance with Section 52 of the Central Goods and Services Tax (CGST) Act, 2017, Nvilar shall collect Tax Collection at Source (TCS) at the statutory rate (currently 1%) from the net taxable supplies made through the platform and remit the same to the Government against the Seller GSTIN.',
          'In compliance with Section 194-O of the Income Tax Act, 1961, Nvilar shall withhold Tax Deducted at Source (TDS) at the applicable rate on the gross amount of sales.',
        ],
      },
      {
        number: 6,
        title: 'Returns, Replacements, Customer Disputes & RTO',
        paragraphs: [
          'All merchandise listed on Nvilar is subject to a standard customer return/replacement window (e.g. 7 days for size exchanges or defective merchandise) in accordance with the Consumer Protection (E-Commerce) Rules, 2020.',
          'In the event of an approved return, Nvilar logistics will manage reverse pickup and return the item to the Seller store premises within designated return cycles.',
          'The Seller has forty-eight (48) hours upon receiving the returned item to raise an authenticity dispute (with photographic/unboxing evidence) if the item received has been tampered with or swapped by the customer.',
        ],
      },
      {
        number: 7,
        title: 'Zero-Tolerance Anti-Counterfeiting & Authenticity Policy',
        paragraphs: [
          'The Seller provides an absolute and irrevocable guarantee that every item sold through Nvilar is 100% genuine, brand-original, and free from intellectual property infringement or counterfeit duplication.',
          'If a product sold by the Seller is certified counterfeit or a replica by the respective brand or intellectual property owner, Nvilar reserves the immediate right to: (a) instantly freeze and deactivate the Seller account, (b) forfeit all pending escrow settlements, and (c) levy a non-negotiable liquidated damages fine of ₹50,000 or ten times (10x) the product order value, whichever is higher, without prejudice to criminal proceedings under the Copyright Act, 1957 and Trade Marks Act, 1999.',
        ],
      },
      {
        number: 8,
        title: 'Termination, Store De-listing & Offboarding',
        paragraphs: [
          'Either party may terminate this commercial partnership by providing thirty (30) calendar days prior written notice via registered email.',
          'Nvilar reserves the immediate right to suspend or permanently de-list the Seller without prior notice upon: (a) post-order cancellation rate exceeding 2.0%, (b) customer defect rate exceeding 1.5%, (c) failure to honor GPS or physical boutique audits, or (d) regulatory non-compliance.',
          'Upon termination, pending funds shall be held for thirty (30) days in escrow to offset potential post-delivery returns, warranty claims, or customer chargebacks before final settlement.',
        ],
      },
      {
        number: 9,
        title: 'Indemnification & Limitation of Liability',
        paragraphs: [
          'The Seller agrees to defend, indemnify, and hold harmless Nvilar, its directors, employees, and affiliates against any third-party lawsuits, damages, consumer forum claims, GST/tax penalties, or IP infringement notices arising from the Seller merchandise, catalog descriptions, or dispatch defaults.',
          'In no event shall Nvilar be liable to the Seller for indirect, incidental, punitive, or consequential damages, lost profits, or business interruption.',
        ],
      },
      {
        number: 10,
        title: 'Dispute Resolution, Governing Law & Jurisdiction',
        paragraphs: [
          'This Agreement shall be governed by, construed, and enforced in accordance with the laws of the Republic of India.',
          'Any dispute, controversy, or claim arising out of this Agreement shall be referred to and finally resolved by arbitration administered by a Sole Arbitrator appointed mutually by both parties under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Guwahati, Assam, India.',
          'Subject to arbitration, the courts having territorial jurisdiction in Guwahati, Assam shall have exclusive jurisdiction over all proceedings.',
        ],
      },
    ],
  },
  terms_conditions: {
    id: 'terms_conditions',
    title: 'Seller Terms & Conditions (Platform Rules)',
    cardSubtitle: 'Catalog accuracy, MRP compliance, real-time inventory, no circumvention & prohibited goods policy.',
    linkText: 'Read full terms',
    version: 'v2.4 - September 2026',
    lastUpdated: 'September 21, 2026',
    acceptButtonText: 'I Agree & Accept Platform Terms',
    sections: [
      {
        number: 1,
        title: 'Acceptance & Seller Code of Conduct',
        paragraphs: [
          'These Platform Terms and Conditions ("Terms") govern access to and use of the Nvilar Seller Portal, inventory management dashboard, and associated commercial APIs.',
          'Sellers are expected to maintain the highest standard of professional integrity, luxury presentation, and prompt consumer service in alignment with the premium Nvilar brand reputation.',
          'Any abusive behavior, fraudulent inventory inflation, discriminatory conduct, or unprofessional communication with Nvilar delivery riders or support personnel will result in disciplinary action up to account deactivation.',
        ],
      },
      {
        number: 2,
        title: 'Catalog Accuracy, Product Imagery & Legal Metrology Compliance',
        paragraphs: [
          'All product listings must display true-to-life photography without deceptive digital alterations or misleading color filters.',
          'In strict compliance with the Legal Metrology (Packaged Commodities) Rules, 2011 and Consumer Protection (E-Commerce) Rules, 2020, product listings must clearly specify: (a) Maximum Retail Price (MRP), (b) Country of Origin, (c) Name and address of the manufacturer/packer/importer, (d) Exact fabric/material composition, and (e) Standardized size chart measurements.',
          'Sellers may not reuse trademarked stock imagery from international luxury fashion houses unless authorized in writing by the brand principal.',
        ],
      },
      {
        number: 3,
        title: 'Pricing Integrity & Prohibition of Predatory Practices',
        paragraphs: [
          'Products must never be listed, sold, or billed at a price exceeding the physical Maximum Retail Price (MRP) printed on the garment/packaging tag.',
          'Artificial price gouging (such as inflating the MRP prior to a promotional event to simulate deceptive discount margins) is strictly prohibited and constitutes an unfair trade practice under Section 2(47) of the Consumer Protection Act, 2019.',
        ],
      },
      {
        number: 4,
        title: 'Physical Inventory Commitment & Real-Time Stock Sync',
        paragraphs: [
          'Sellers must exclusively list products that are physically in their possession and immediately accessible for rapid dispatch within the store premises.',
          'Listing "Ghost Inventory" (items that are out of stock or sourced on-demand from distant warehouses) is strictly prohibited in our quick-commerce hyperlocal model.',
          'If a Seller accepts an order and subsequently initiates a seller-side cancellation due to inventory unavailability, a commercial penalty equivalent to 10% of the item value shall be debited from the Seller payout ledger.',
        ],
      },
      {
        number: 5,
        title: 'Non-Circumvention & Anti-Poaching Policy',
        paragraphs: [
          'Sellers are expressly forbidden from using customer contact information obtained through Nvilar to solicit direct off-platform transactions or circumvent platform commissions.',
          'Inserting personal flyers, WhatsApp invitation QR codes, offline store discount vouchers, or promotional marketing leaflets inside delivery packages is strictly prohibited.',
          'Any detected violation of this Non-Circumvention clause shall lead to immediate termination of the Seller account and forfeiture of pending settlement balances.',
        ],
      },
      {
        number: 6,
        title: 'Customer Data Confidentiality & Protection',
        paragraphs: [
          'Customer personal data (including delivery address, phone number, recipient name) provided on delivery manifests is strictly confidential and shared solely for the purpose of order fulfillment.',
          'Sellers may not store, export, commercialize, or use customer data for independent SMS, WhatsApp, or telemarketing campaigns.',
          'Unauthorized disclosure of customer data will be prosecuted under the Digital Personal Data Protection Act, 2023, and IT Act Section 72A.',
        ],
      },
      {
        number: 7,
        title: 'Luxury Packaging Standards & Hygiene Safeguards',
        paragraphs: [
          'To maintain the Nvilar premium shopping experience, all garments must be packaged in clean, moisture-resistant protective covers and placed inside official Nvilar tamper-evident packaging bags or boxes.',
          'Items must undergo pre-dispatch quality checks to ensure they are free from stains, loose threads, body odor, manufacturing defects, or missing tags.',
        ],
      },
      {
        number: 8,
        title: 'Prohibited & Banned Merchandise',
        paragraphs: [
          'The following categories are strictly forbidden on the Nvilar platform: (a) Counterfeit or pirated goods, (b) Used or pre-owned garments marketed as new, (c) Stolen property, (d) Hazardous substances or flammable textiles, (e) Items violating wildlife protection laws (e.g., banned animal fur or exotic leathers), and (f) Any item prohibited by the Government of India.',
        ],
      },
    ],
  },
  privacy_policy: {
    id: 'privacy_policy',
    title: 'Seller Privacy Policy (DPDP Act 2023)',
    cardSubtitle: 'Secure KYC, banking & GPS data processing under DPDP Act. No third-party data sale. Grievance officer on record.',
    linkText: 'Read full privacy policy',
    version: 'v2.4 - September 2026',
    lastUpdated: 'September 21, 2026',
    preambleSubtitle: 'Personal & Business Data Protection, KYC Processing & Statutory Compliance under DPDP Act 2023',
    acceptButtonText: 'I Understand & Accept Privacy Policy',
    sections: [
      {
        number: 1,
        title: 'Data Fiduciary Notice & Legal Framework',
        paragraphs: [
          'Nvilar Technologies Private Limited acts as a "Data Fiduciary" under the Digital Personal Data Protection Act, 2023 (DPDP Act) with respect to the personal, financial, and business data collected from registering sellers and their authorized signatories ("Data Principals").',
          'This Privacy Policy transparently delineates how merchant identity records, banking details, and store telemetry data are collected, processed, encrypted, stored, and retained.',
        ],
      },
      {
        number: 2,
        title: 'Categories of Merchant Data Collected',
        paragraphs: [
          'Identity & KYC Information: Name of the proprietor/directors, masked Aadhaar numbers (with initial 8 digits masked in accordance with UIDAI guidelines), Permanent Account Number (PAN), Passport/Voter ID/Driving License scans, Certificate of Incorporation, Director Identification Numbers (DIN), and Board Resolutions.',
          'Financial & Payout Information: Bank account numbers, IFSC codes, canceled cheque scans, UPI Virtual Payment Addresses (VPA), and GSTIN registration certificates.',
          'Geolocation & Store Telemetry: Exact physical boutique GPS coordinates (latitude and longitude), device IP addresses, operating system telemetry, and physical storefront photographs.',
          'Operational Logs: Order acceptance timestamps, dispatch durations, customer review histories, and customer support communications.',
        ],
      },
      {
        number: 3,
        title: 'Legal Basis & Purpose of Processing',
        paragraphs: [
          'We collect and process your business and personal data exclusively for lawful purposes:',
          '(a) Regulatory Compliance: To verify merchant identity pursuant to the Prevention of Money Laundering Act (PMLA), 2002, Reserve Bank of India (RBI) KYC master directions, and GST registration mandates.',
          '(b) Hyperlocal Delivery Routing: Store GPS coordinates are processed to dynamically match your boutique with customers residing within delivery radiuses (< 9km) and optimize rider dispatch.',
          '(c) Financial Settlement: To disburse sales payouts, calculate platform commissions, and deduct statutory GST TCS under Section 52 and Income Tax TDS under Section 194-O.',
          '(d) Fraud Prevention & Platform Security: To prevent multi-accounting, unauthorized credential sharing, and counterfeit product syndicates.',
        ],
      },
      {
        number: 4,
        title: 'Data Security, Encryption & Access Controls',
        paragraphs: [
          'All merchant KYC scans and financial credentials are protected using industry-standard AES-256 bit encryption at rest and TLS 1.3 encryption in transit.',
          'Access to identity documents is strictly restricted to authorized compliance officers and auditors via multi-factor authentication (MFA) on a need-to-know basis.',
          'Nvilar adheres to ISO/IEC 27001 information security principles and does not store unencrypted bank passwords or sensitive UPI MPINs.',
        ],
      },
      {
        number: 5,
        title: 'Third-Party Sharing & Strict No-Sale Commitment',
        paragraphs: [
          'Nvilar maintains a strict policy: We DO NOT sell, rent, or trade Seller personal data, business directories, or financial metrics to third-party marketing companies, advertisers, or lead generators.',
          'Data is shared solely with: (a) Verified Logistics Partners: Only your shop address, boutique GPS location, and dispatch phone number are shared with riders for order pickup. (b) Banking & Payment Gateways: Only required bank account/UPI identifiers are shared with RBI-authorized banking partners for payout processing. (c) Statutory & Law Enforcement Authorities: When mandated by lawful summons, tax notices, or court orders under Indian law.',
        ],
      },
      {
        number: 6,
        title: 'Data Retention & Archival Schedules',
        paragraphs: [
          'Merchant identity, financial ledgers, and transaction invoices are retained for a minimum statutory period of seven (7) years following account closure, as required under the Companies Act, 2013 and the Income Tax Act, 1961.',
          'Following the expiration of statutory retention windows, merchant data is purged securely from our active servers.',
        ],
      },
      {
        number: 7,
        title: 'Rights of the Merchant under DPDP Act 2023',
        paragraphs: [
          'As a Data Principal, you are entitled to:',
          '(a) Right to Summary: Request a summary of personal data processed by Nvilar.',
          '(b) Right to Correction: Promptly update or rectify inaccurate phone numbers, addresses, or banking details.',
          '(c) Right to Grievance Redressal: Register compliance complaints regarding data processing practices.',
        ],
      },
      {
        number: 8,
        title: 'Statutory Grievance Redressal Officer',
        paragraphs: [
          'In compliance with the Information Technology Act, 2000, IT Intermediary Rules, 2021, and DPDP Act, 2023, the designated Grievance Officer for Nvilar Marketplace is:',
          'Name: Chief Compliance & Data Protection Officer\nCompany: Nvilar Technologies Private Limited\nRegistered Address: Commercial Hub, GS Road, Guwahati, Assam - 781005, India\nOfficial Email: compliance@nvilar.com / grievance@nvilar.com\nTurnaround Time: Initial acknowledgment within twenty-four (24) hours and final resolution within fifteen (15) working days.',
        ],
      },
    ],
  },
};
