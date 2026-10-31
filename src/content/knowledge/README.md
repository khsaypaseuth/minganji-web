# MingAnji.ai public knowledge base

These Markdown files are the **only** product knowledge sent to the AI
assistant (see `src/lib/knowledge.ts` and `src/app/api/chat/route.ts`).
Everything here must be safe for public visitors. Do not add credentials,
internal URLs, customer records, private prices or unreleased plans.

`README.md` itself is not sent to the AI.

## How to update

1. Edit or add a `.md` file in this folder (keep facts short and verifiable).
2. Note the source in the table below.
3. Restart / redeploy. Files are read at server start and cached.

## Sources (reviewed 31 Oct 2026)

| File | Supported by |
| --- | --- |
| `01-platform.md` | Client brief (product definition, capability list); minganji.ai home page ("field intelligence, equipment monitoring and operational software"; "Powered by Tian'An"; availability disclaimer). |
| `02-trucks.md` | Client brief (five truck categories sold and equipped). Reference site does not list these categories, so no specifications are given. |
| `03-features.md` | Client brief (five capability areas). minganji.ai: GNSS position, engine/auger/boom counters (FleetView), cycle classification (ShiftView), borehole records (BoreProof), "open exports" (no formats named). MVP portal prototype (claude.ai artifact NKfEmsokcLRYJxihXT5kdm): live map, truck status online/idle/offline, timeline, holes, planned pole positions, work time, exports. |
| `04-drilling.md` | minganji.ai (records combine position with drilling data; depth and position captured by sensors); MVP prototype (holes list "from sensor data only", hole map, planned positions along a line). Accuracy figures and hash-sealing claims from the reference site are deliberately **not** included until confirmed for current trucks. |
| `05-contact.md` | minganji.ai footer (info@minganji.ai, Shenzhen, China); brief (sign-in URL https://demo.minganji.ai/signin; no registration URL). |
| `06-boundaries.md` | Brief (assistant must not invent prices, capabilities, policies or live data). |
| `07-plans.md` | MVP portal prototype (plans page: features per plan, history periods, downgrade rule, bank transfer and BCEL QR payment, LAK prices). Tier names, vehicle limits (1 / 3 / 10 / more than 10) and the Pro and Premium prices confirmed by the owner on 31 Oct 2026. |

## Pending confirmation (do not add until verified)

- Supported export file formats (the MVP prototype shows DXF in UTM 48N and CSV; not confirmed for production).
- Hardware specifications, positioning accuracy, connectivity (reference site mentions RTK GNSS, 5G/4G, offline buffering).
- Staff management / timesheet scope and availability.
- Trial terms, yearly billing, extra-vehicle packs, contract terms, privacy policy, terms of use.
