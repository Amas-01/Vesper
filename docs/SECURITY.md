# 🔐 Vesper Protocol Security & Audit

Comprehensive security documentation, audit process, known limitations, and responsible disclosure guidelines.

## 🏰 Security Philosophy

**"Defense in Depth"**: Multiple layers of protection at contract, infrastructure, and operational levels.

**Principles**:
- All user funds are secured in sBTC escrow
- No admin keys with unrestricted fund access
- DAO governance controls protocol parameters
- Transparent audit trail for all operations
- Clear disclosure of known risks and limitations

---

## 🔍 Contracted Security Audit

### 📋 Audit Scope

**Phase 4 (Mainnet Preparation) includes third-party audit of:**
- All three main contracts (core, dao, registry)
- Clarity syntax and type safety
- Re-entrancy protection
- Access control enforcement
- Overflow/underflow edge cases
- Escrow model implementations
- DAO voting mechanics

### 🔄 Audit Process

1. **RFP & Selection** (Month 3)
   - Issue RFP to reputable audit firms
   - Candidates: Halborn, Trail of Bits, OpenZeppelin (Stacks)
   - 2-3 week selection window

2. **Kick-off** (Early Month 4)
   - Audit firm reviews code and architecture
   - Team available for questions
   - Entrance testing begins

3. **Main Audit** (Weeks 1-3)
   - Systematic code review
   - Black-box and white-box testing
   - Vulnerability classification

4. **Remediation** (Week 3)
   - Team fixes critical and high findings
   - Audit firm validates fixes
   - Low/informational findings documented

5. **Final Report** (Week 4)
   - Detailed audit report published
   - All findings and resolutions listed
   - Sign-off obtained

### 📢 Audit Report Publication

- [ ] Full audit report published on GitHub
- [ ] Executive summary in README
- [ ] All findings categorized (Critical, High, Medium, Low, Info)
- [ ] Remediation status for each finding

---

## ⚠️ Known Limitations (MVP)

### Phase 1 (Month 1)

**Governance**
- Centralized initial deployment (core team controls parameters)
- Emergency pause only callable by core team
- No multi-sig on critical operations yet

**Streaming Logic**
- Per-block settlement only (no sub-block granularity)
- Fixed rate-per-block (no dynamic pricing)
- No partial cancellation (all-or-nothing)

**Escrow Models**
- Only "hold" and "simple return" implemented initially
- No complex multi-party escrow scenarios
- Burn model deferred to Phase 2

**Performance**
- Max 100 concurrent streams per user (soft limit)
- Batch operations limited to 10 streams per transaction
- No streaming batch indexing (off-chain only)

### Phase 2 (Month 2)

**Will Add**:
- Full DAO governance
- Advanced cancellation models
- Burn escrow support
- Multi-recipient payroll (basic)

**Still Limiting**:
- No cross-chain swaps
- No NFT receipts
- Limited integration with DeFi

### Phase 3+ (Months 3-4)

**To Be Added**:
- Advanced analytics
- Cross-chain compatibility
- NFT-based stream receipts
- Integration with other DeFi protocols

---

## 🚨 Known Vulnerabilities & Mitigations

### 1. Escrow Timing Risk

**Vulnerability**: If payer funds withdrawn before stream activated, recipient loses payout.

**Severity**: Medium

**Mitigation**:
- Funds locked in escrow on stream creation
- Cannot be withdrawn until stream completes or expires
- Clear on-chain proof of funds availability

**Residual Risk**: Escrow contract bug could lock funds permanently.

---

### 2. Rate Manipulation

**Vulnerability**: Payer could update rate mid-stream to reduce future payouts.

**Severity**: Low (design choice, not bug)

**Mitigation**:
- Rate updates only apply to future accrual
- Historical accrued amount frozen
- Recipient can cancel stream if dissatisfied

**Note**: This is intentional flexibility, not a bug.

---

### 3. Voting Power Concentration

**Vulnerability**: Large token holders could pass proposals against community interest.

**Severity**: Medium (governance risk)

**Mitigation**:
- Multi-stage governance (proposal → vote → execution)
- Voting period allows time for community discussion
- Token distribution matters (initial allocation)
- Emergency pause if severe attack detected

---

### 4. sBTC Bridge Risk

**Vulnerability**: sBTC bridge itself is managed by Stacks Core team, not by Vesper.

**Severity**: Inherent to sBTC, not Vesper-specific

**Mitigation**:
- Use only audited sBTC bridge contracts
- Monitor bridge health regularly
- Document bridge status in UI
- Have ETF or alternative on-ramp ready

---

### 5. Block Manipulation (Testnet Only)

**Vulnerability**: During testnet, faster block times could skew rate calculations.

**Severity**: Testnet only (mainnet blocks fixed at ~10 min)

**Mitigation**:
- Explicitly tested with various block times
- All math relative to block height, not time
- Clear documentation of mainnet vs. testnet differences

---

## 📋 Security Best Practices

### For Smart Contracts

- ✓ All state mutations emit events
- ✓ Composite keys prevent map collisions
- ✓ Type system prevents many runtime errors
- ✓ Input validation on all public functions
- ✓ No hardcoded addresses or private keys

### For Frontend

- ✓ All user inputs validated
- ✓ Contract addresses from environment variables
- ✓ No local key storage (use wallet only)
- ✓ HTTPS only (enforced by Vercel)
- ✓ CSP headers configured
- ✓ Dependency scanning with Snyk

### For Infrastructure

- ✓ Secrets managed via GitHub org settings (not in code)
- ✓ Mainnet and testnet in separate GitHub environments
- ✓ Deployment approvals required for mainnet
- ✓ cloudflare DDoS protection on API endpoints
- ✓ Rate limiting on public endpoints

---

## 🚨 Incident Response Plan

### Severity Levels

| Level | Example | Response Time | Actions |
|-------|---------|----------------|---------|
| Critical | Fund loss, hack detected | < 1 hour | Emergency pause, all hands, potential rollback |
| High | Contract bug, data corruption | < 4 hours | Patch deployment, user notification |
| Medium | Governance attack, API down | < 1 day | Fix deployment, post-mortem planned |
| Low | UI bug, minor parameter misconfig | < 1 week | Normal deployment process |

### Critical Incident Response

1. **Detect** (0-5 min)
   - Monitoring system alerts team
   - Team verifies issue (not false alarm)

2. **Contain** (5-15 min)
   - Invoke `emergency-pause` on core contract
   - Halt all new streams
   - Notify community on Discord/Twitter

3. **Investigate** (15-60 min)
   - Assess scope and damage
   - Identify root cause
   - Determine safe recovery path

4. **Remediate** (1-4 hours)
   - Deploy fixed contract or mitigation
   - Resume operations or coordinate migration
   - Detailed post-mortem within 24 hours

5. **Learn** (1-2 weeks)
   - Full root cause analysis
   - Preventative measures
   - Additional audit/testing as needed

---

## 💰 Bug Bounty Program

### Scope

The following are in scope for bug bounties:
- Smart contracts (core, dao, registry)
- Frontend authentication and fund handling
- Critical infrastructure (API, indexing)

**Out of Scope**:
- Social engineering
- Physical security
- Third-party systems (sBTC bridge)

### Severity & Rewards

| Severity | Reward (VESPER) | Examples |
|----------|-----------------|----------|
| Critical | 50,000 | Fund loss, reentrancy, auth bypass |
| High | 20,000 | Data corruption, DoS, fund lock |
| Medium | 5,000 | Governance bypass, rate bugs |
| Low | 1,000 | UI issues, edge case bugs |

### Reporting & Responsible Disclosure

**To Report a Bug:**

1. **Do NOT** post in public forums or Twitter
2. Email: **security@vesper.sh** (GPG key available)
3. Include:
   - Detailed description of vulnerability
   - Steps to reproduce
   - Proof of concept (if applicable)
   - Your contact information
   - Suggested fix (optional)

**Responsible Disclosure Terms:**

- 90-day embargo before any public disclosure
- Team will acknowledge receipt within 24 hours
- Updates every 7 days until resolved
- If unresponsive, can coordinate with Stacks ecosystem lead
- Payment upon release (or community consensus for lower severities)

---

## 🔍 Security Monitoring

### Continuous Monitoring

- [ ] GitHub dependabot for vulnerable packages
- [ ] Snyk scanning for supply chain issues
- [ ] Smart contract static analysis (Slither, if available for Clarity)
- [ ] Contract event monitoring for anomalies
- [ ] API rate-limiting and DDoS protection

### Regular Security Activities

- **Weekly**: Review security alerts and logs
- **Monthly**: Dependency update audit
- **Quarterly**: Penetration testing proposal review
- **Annually**: Full security audit (post-mainnet)

---

## ⚖️ Compliance & Regulatory

### Stacks Ecosystem Compliance

- All contracts follow Clarity best practices
- No prohibited functions or patterns
- Compatible with Stacks PoX (Proof of Transfer)
- No conflicts with STX tokenomics

### Responsible Finance Practices

- Clear terms of service (TBD - Month 4)
- User risk disclosures
- No claims of guaranteed returns
- Compliance with local regulations (where applicable)

---

## 📧 Security Contacts

- **Security Issues**: security@vesper.sh
- **General Questions**: team@vesper.sh
- **Emergency**: [Stacks Ecosystem Lead]
- **Public Discord**: [Link]

---

## 📚 Additional Resources

- [Clarity Security Best Practices](https://docs.stacks.co/smart-contracts/clarity/clarity-best-practices)
- [Stacks Audit Guidelines](https://docs.stacks.co/smart-contracts/audit-guidelines)
- [sBTC Bridge Security](https://docs.stacks.co/bitcoin-settlement/sbtc)
- [Bitcoin Consensus Verification](https://developer.bitcoin.org/)

---

## ✅ Security Review Checklist

Before each release:

- [ ] All functions have input validation
- [ ] No reentrancy vulnerabilities
- [ ] Overflow/underflow handled
- [ ] Event emissions complete
- [ ] Access control correct
- [ ] No hardcoded secrets
- [ ] Dependencies up to date
- [ ] Tests passing (80%+ coverage)
- [ ] Linting passed (no warnings)
- [ ] Code review approved (2+ reviewers)
- [ ] Deploy artifacts reproducible

---

**Last Updated**: April 2026 (Phase 0)
**Next Major Review**: Month 4 (Mainnet Audit)
