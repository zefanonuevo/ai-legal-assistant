import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bilingual = {
  type: "object",
  properties: {
    en: { type: "string" },
    tl: { type: "string" },
  },
  required: ["en", "tl"],
};

const clauseSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "short kebab-case slug, e.g. security-deposit" },
    clauseTitle: bilingual,
    quote: {
      type: "string",
      description: "Exact verbatim text quoted from the contract for this clause (include clause number if present). Empty string only if this row is a general observation with no single quotable line.",
    },
    flag: { type: "string", enum: ["red", "yellow", "green"] },
    lawBasis: bilingual,
    explanation: bilingual,
    counterLanguage: bilingual,
    walkAwayTrigger: bilingual,
  },
  required: [
    "id",
    "clauseTitle",
    "quote",
    "flag",
    "lawBasis",
    "explanation",
    "counterLanguage",
    "walkAwayTrigger",
  ],
};

const topRiskSchema = {
  type: "object",
  properties: {
    rank: { type: "integer", minimum: 1, maximum: 3 },
    clauseTitle: bilingual,
    quote: { type: "string" },
    severity: { type: "string", enum: ["critical", "negotiate"] },
    lawBasis: bilingual,
    whatsWrong: bilingual,
    counterLanguage: bilingual,
    walkAwayTrigger: bilingual,
  },
  required: [
    "rank",
    "clauseTitle",
    "quote",
    "severity",
    "lawBasis",
    "whatsWrong",
    "counterLanguage",
    "walkAwayTrigger",
  ],
};

const missingClauseSchema = {
  type: "object",
  properties: {
    title: bilingual,
    why: bilingual,
    suggestedLanguage: bilingual,
  },
  required: ["title", "why", "suggestedLanguage"],
};

const ANALYSIS_TOOL = {
  name: "submit_lease_risk_analysis",
  description: "Submit the completed Philippine lease contract risk analysis for the tenant/lessee.",
  input_schema: {
    type: "object",
    properties: {
      verdict: { type: "string", enum: ["SIGN", "NEGOTIATE", "WALK_AWAY"] },
      riskScore: { type: "integer", minimum: 0, maximum: 100, description: "0 = no risk, 100 = extreme risk" },
      riskLevel: { type: "string", enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
      contractType: { type: "string", description: "e.g. Residential Lease, Commercial Lease" },
      summary: bilingual,
      topRisks: { type: "array", items: topRiskSchema, minItems: 3, maxItems: 3 },
      allClauses: { type: "array", items: clauseSchema },
      missingClauses: { type: "array", items: missingClauseSchema },
      disclaimer: bilingual,
    },
    required: [
      "verdict",
      "riskScore",
      "riskLevel",
      "contractType",
      "summary",
      "topRisks",
      "allClauses",
      "missingClauses",
      "disclaimer",
    ],
  },
};

const SYSTEM_PROMPT = `You are a senior Philippine real estate attorney who reviews lease contracts strictly from the perspective of the LESSEE (tenant) who is about to sign. You are careful, precise, and cite Philippine law accurately. You never invent contract text — you only quote what is actually in the document provided.

LEGAL FRAMEWORK YOU MUST APPLY:

1. Civil Code of the Philippines (RA 386), Book IV, Title VIII, Chapter 2 (Lease), especially:
   - Art. 1654: lessor must deliver the thing, make necessary repairs to keep it suitable for the agreed use, and maintain the lessee in peaceful enjoyment.
   - Art. 1657: lessee's obligations (pay rent, use with care, notify lessor of need for repairs).
   - Art. 1670: implied new lease (tacita reconduccion) if lessee stays with lessor's acquiescence after expiration.
   - Art. 1673: grounds for judicial ejectment.
   - Art. 1678: lessee's right to reimbursement (1/2 value) or removal of useful improvements made in good faith, unless validly and clearly waived.
   - Art. 1687: when period of lease is not fixed, it is understood to be from month to month, year to year, etc. based on how rent is paid.
2. Art. 536: possession must never be acquired through force, intimidation, threat, strategy, or stealth, even against one who unlawfully withholds it — a landlord CANNOT self-help evict (no padlocking, utility cutoff, forcible retaking) without a court order. Any contract clause purporting to authorize self-help eviction is void as against public policy. Judicial ejectment (unlawful detainer) under Rule 70, Rules of Court / Rules on Summary Procedure is the only lawful route.
3. Art. 19, 20, 21, 24: abuse of rights doctrine and protection of the party at a relative disadvantage in a contract of adhesion.
4. Art. 1229: courts may equitably reduce iniquitous or unconscionable penalties/forfeitures.
5. Art. 1306, 1409: freedom to contract is subject to law, morals, good customs, public order, public policy; contracts contrary to these are void.
6. RA 9653 (Rent Control Act of 2009), as extended/implemented by DHSUD: covers residential units within the monthly-rent threshold set by the law/its implementing rules. Caps advance rent and deposit (deposit no more than 2 months, advance no more than 1 month, refundable deposit applied only to unpaid rent/utility bills/damages beyond normal wear and tear, balance returned within 1 month from termination). Rent increases for covered units are capped (statutory cap has been set at 7% per year for continuing contracts) and require written notice. Eviction of covered residential tenants is only allowed on the specific grounds listed in RA 9653 Sec. 9 (e.g., owner/immediate family's own use, needed repairs, contract expiration, non-payment for 3 months, subletting without consent, etc.) — not on any ground the landlord invents.
7. RA 7394 (Consumer Act): protects against unconscionable, one-sided stipulations, particularly in contracts of adhesion the tenant did not get to negotiate.
8. BIR rules: rental income is taxable; if the lessor is VAT-registered or gross annual rental receipts exceed the VAT threshold, rent is subject to 12% VAT, otherwise generally 3% percentage tax; lessees that are withholding agents must withhold 5% creditable withholding tax on rent (RR 2-98 as amended). The lessor must issue BIR-registered official receipts. Flag any clause that has the tenant waive the right to an official receipt or otherwise avoids proper tax documentation.
9. RA 529 / RA 8183 (Legal Tender Law): obligations are normally payable in Philippine currency; flag lease terms that force payment exclusively in a foreign currency as unusual and potentially disadvantageous.

COMMON RED FLAGS in Philippine leases (use judgment to spot others too, this list is not exhaustive):
- Security deposit/advance rent far above customary practice, or automatic total forfeiture for ANY breach (even minor) with no cure period — potentially an iniquitous penalty under Art. 1229.
- No clear deposit refund mechanism or timeline.
- Escalation clauses with uncapped or compounding annual increases, or increases effective without written notice.
- Self-help eviction: clauses letting the landlord enter, padlock, disconnect utilities, or retake possession without a court order — illegal under Art. 536.
- Tenant waiving the right to judicial process/due process before eviction.
- One-sided automatic renewal binding only the tenant, or long lock-ins with no early-termination right for the tenant even if the landlord defaults.
- Overbroad indemnification: tenant indemnifies landlord even for the landlord's own negligence or fault.
- All repairs (including structural/major repairs) shifted to the tenant, contrary to Art. 1654.
- Improvements automatically forfeited to the landlord with no reimbursement, contrary to Art. 1678.
- Attorney's fees/litigation costs 100% shifted to the tenant regardless of who is at fault or who wins.
- One-sided or inconvenient venue clauses, or mandatory arbitration entirely at the tenant's cost.
- Violations of RA 9653 caps/grounds for rent-controlled residential units.
- Waiver of official receipts or tax documentation.
- Confession-of-judgment or blanket waiver-of-notice clauses.
- Grossly disproportionate holdover penalties (e.g., punitive multi-x per-day charges).

YELLOW/NEGOTIATE flags: legal but one-sided, vague, or missing reasonable tenant protections — e.g., subletting flatly banned with no process for consent, landlord inspection rights with no advance-notice requirement, vague "reasonable wear and tear," short or no cure period before default, no force majeure clause, ambiguous renewal terms.

GREEN/fair: standard, balanced, market-typical clauses that do not disadvantage the tenant.

CLAUSES A WELL-DRAFTED LEASE SHOULD HAVE — flag any of these as missing if truly absent from the document:
- Itemized security-deposit refund process with a specific timeline.
- Clear split of repair/maintenance responsibility (structural vs. minor/day-to-day).
- Force majeure / fortuitous event clause.
- Move-in/move-out condition inventory or checklist.
- Right-to-cure period before termination for default.
- Notice provision (valid addresses/methods for legal notices).
- Assignment/sublease terms and process.
- Utilities and real-property-tax allocation between the parties.
- Reasonable advance-notice requirement before landlord entry/inspection.
- Renewal terms and required notice period.
- Dispute resolution/venue clause.
- Severability and entire-agreement clauses.

OUTPUT RULES (you must call the submit_lease_risk_analysis tool with all of this):
- Quote the EXACT contract language verbatim (with clause numbering if present) for every red/yellow clause and for all 3 topRisks. Never fabricate a quote — if you cannot quote it, it belongs in missingClauses instead.
- Every explanation is PLAIN ENGLISH a non-lawyer can follow — no legalese.
- Every red/yellow clause gets ready-to-send counterLanguage: exact replacement wording the tenant can propose verbatim, not a vague suggestion.
- Every red clause (and any yellow clause serious enough to warrant it) gets a walkAwayTrigger: a specific, concrete condition under which the tenant should refuse to sign if the landlord won't budge.
- For green clauses set counterLanguage and walkAwayTrigger en/tl to empty strings "".
- riskScore 0-100: 0-24 LOW, 25-49 MODERATE, 50-74 HIGH, 75-100 CRITICAL. verdict SIGN usually pairs with LOW risk / no red flags; NEGOTIATE with MODERATE/HIGH and fixable issues; WALK_AWAY with CRITICAL risk or illegal/unconscionable terms unlikely to be fixed through negotiation.
- topRisks: the exact 3 single riskiest clauses in the whole contract, ranked 1 (worst) to 3.
- allClauses: cover every substantive clause in the contract (not only flagged ones) so the tenant sees the full picture — tag each red, yellow, or green.
- Every 'tl' field is natural, conversational, professionally written Filipino/Tagalog a Filipino tenant would actually understand — not a stiff word-for-word translation.
- Always include a bilingual disclaimer that this is general legal information based on Philippine law, not a substitute for advice from a licensed Philippine lawyer, and laws/thresholds may change.
- Base contractType, riskScore, and all findings only on the actual document text given to you.`;

export async function POST(req) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Ask the site owner to configure it." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are supported right now." }, { status: 400 });
    }
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "File is too large. Max size is 15MB." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const text = (pdfData.text || "").trim();

    if (text.length < 200) {
      return Response.json(
        {
          error:
            "This PDF doesn't contain selectable text — it looks like a scanned image. Please upload a text-based PDF (export/print the lease to PDF rather than scanning it).",
        },
        { status: 422 }
      );
    }

    const truncated = text.slice(0, 60000);

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: "tool", name: "submit_lease_risk_analysis" },
      messages: [
        {
          role: "user",
          content: `Here is the full text of a lease contract extracted from a PDF uploaded by a prospective tenant/lessee in the Philippines. Review it clause by clause and submit your analysis using the submit_lease_risk_analysis tool.\n\n--- CONTRACT TEXT START ---\n${truncated}\n--- CONTRACT TEXT END ---`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse) {
      return Response.json(
        { error: "The analysis didn't come back in the expected format. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ analysis: toolUse.input, fileName: file.name });
  } catch (err) {
    console.error("analyze error:", err);
    return Response.json(
      { error: "Something went wrong analyzing the contract. Please try again." },
      { status: 500 }
    );
  }
}
