# Notes

## User preferences

- **No code lessons.** The user is a developer building Hoalu but explicitly does not want to learn
  about the code. Read the codebase to ground lessons; never teach the code itself. When pointing out
  what's wrong in the app, frame it as "user/financial perspective" and "what the app should do," not
  "how to fix the code."
- **Family scope.** The user said "my/my family money." Lessons should consider multi-person household
  finances where relevant (the app's workspace/member model supports this).

## Open questions for the user

- ~~**Jurisdiction.**~~ **RESOLVED: Vietnam.** The household earns and spends primarily in VND;
  USD is used for online payments (SaaS, international services). US-centric tax/retirement content
  does not apply.
- ~~**Currencies in use.**~~ **RESOLVED: VND primary, USD for online payments.** This makes
  Lesson 9 (multi-currency) directly relevant — the household has real USD exposure to convert and
  track. The SBV central rate (sbv.gov.vn) is the canonical FX source.
- **Current financial fluency.** Has the user read any personal-finance books before, or is this
  greenfield? (Affects the starting zone of proximal development.) **Still open — ask.**
- **Vietnamese-language high-trust sources.** The user is Vietnamese and may know better local
  resources than I can find (PIT, BHXH, VN30 investing). Ask before asserting.

## Working notes

- The codebase audit (see `reference/hoalu-financial-audit.html`) is the single most useful grounding
  document. Every concept lesson can point back to a concrete gap or defect it finds.
- The biggest financially-impactful defects to build lessons around, in priority order:
  1. No wallet balances at all → cannot show cash position or net worth (the core stock concept).
  2. Credit cards modeled as plain wallets → cannot represent debt.
  3. Cash-flow chart "balance" starts from 0 each period → misleading; not a real balance.
  4. No per-category budgets → no budgeting system.
  5. No transfers between accounts → moving money is impossible.
  6. FX correctness: single conversion date for monthly sums, `created_at` vs `date` lookup, silent
     zeroing when a rate is missing.
  7. Recurring-bill `dueDay=0` validation gap; "one-time recurring bill" contradiction.
  8. Income `repeat` field is decorative (no occurrence generation, no `recurringBillId`).
- Curriculum arc (knowledge → app audit → improvement direction):
  1. Stock vs Flow (balance sheet vs cash flow) — the foundational distinction Hoalu is half-blind to.
  2. The balance sheet: assets, liabilities, net worth.
  3. Wallets & accounts done right (checking/savings/credit-card/investment/debt).
  4. Credit cards as debt instruments.
  5. Cash flow & the savings rate.
  6. Transfers are neither income nor expense.
  7. Budgeting systems (zero-based / envelope / 50-30-20).
  8. Recurring bills & subscriptions done right.
  9. Multi-currency done right. **VIETNAM-GROUNDED:** SBV central rate is the canonical FX source;
     the household's USD online spending makes this lesson directly practical.
  10. Savings goals & sinking funds.
  11. Debt & loans (amortization, avalanche vs snowball).
  12. Investing basics & net-worth growth. **Needs Vietnam grounding:** VN30 index funds, local
      securities accounts, BHXH — find high-trust sources before refining.
  13. Financial independence & the 4% rule. **Needs Vietnam grounding:** no 401k/IRA; retirement is
      BHXH + voluntary; the 4% rule's universal maths holds but the investable vehicles differ.
