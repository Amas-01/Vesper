# 🧪 Vesper Frontend Testing Checklist

## Prerequisites
✅ Dev server running on http://localhost:5174
✅ Environment configured with testnet contract address
✅ Browser cache cleared

---

## 📋 Test Scenarios

### 1️⃣ **Home Page** - `/`
- [ ] Landing page loads without errors
- [ ] "Get Started" button is visible
- [ ] "View on GitHub" button links correctly
- [ ] Dark theme applied
- [ ] Text displays: "Real-Time Per-Block Payment Streaming on Stacks"

### 2️⃣ **Header Navigation**
- [ ] Vesper logo is visible
- [ ] Navigation menu shows: Dashboard, Create Stream, Docs
- [ ] Wallet connect button shows address or "Connect Wallet" text
- [ ] Network badge shows (Testnet/Mainnet indicator)

### 3️⃣ **Create Stream Page** - `/create`
**Form Sections (Should all be visible now):**
- [ ] **Recipient Address** input field
  - Placeholder: "SP... or SN..."
  - Validation message if invalid
- [ ] **Total Deposit (STX)** input field
  - Min 0, accepts decimals
  - Validation message if empty
- [ ] **Duration (Days)** input field
  - Min 1 day
  - Validation message if invalid
- [ ] **Memo (Optional)** textarea
- [ ] **Create Stream** button

**Stream Preview Panel (Right side):**
- [ ] Title: "Stream Preview"
- [ ] Shows placeholder: "Fill in the form to see stream preview" initially
- [ ] Once form fields are filled:
  - [ ] Recipient address displays
  - [ ] Amount Breakdown shows (Total Deposit, Protocol Fee, Net Deposit)
  - [ ] Duration section shows (Days, Blocks)
  - [ ] Streaming Rate shows (Per Block, Per Day)

**Calculations (When form has valid data):**
- [ ] Protocol Fee = 0.25% of total
- [ ] Net Deposit = Total Deposit - Fee
- [ ] Per Block Rate calculated correctly
- [ ] Daily Rate calculated correctly

### 4️⃣ **Dashboard Page** - `/dashboard`
**Before Wallet Connection:**
- [ ] Shows message: "Connect your wallet to view and manage your payment streams"
- [ ] "Go Home & Connect" button visible

**After Wallet Connection:**
- [ ] Summary Cards display (4 metrics):
  - [ ] Streams Sent (count)
  - [ ] Streams Receiving (count)
  - [ ] Total Sending (STX amount)
  - [ ] Claimable (STX amount)
- [ ] Two sections appear:
  - [ ] "Payment Streams Sent" section with cards/list
  - [ ] "Payment Streams Received" section with cards/list
- [ ] View toggle buttons: Grid / List
- [ ] "Create Stream" button
- [ ] Empty state message if no streams exist

### 5️⃣ **Stream Detail Page** - `/stream/:id`
*(Only accessible after creating a stream or with valid stream ID)*
- [ ] Title: "Stream #[ID]"
- [ ] Back button to Dashboard
- [ ] Stream header shows:
  - [ ] From/To addresses
- [ ] Stream Progress section:
  - [ ] Progress bar (%)
  - [ ] Deposited amount
  - [ ] Withdrawn amount
  - [ ] Remaining amount
- [ ] Stream Details section:
  - [ ] Rate per Block
  - [ ] Start/End block
  - [ ] Status (Active/Paused)
- [ ] Action buttons sidebar:
  - [ ] Withdraw button (if recipient)
  - [ ] Top Up button (if sender)
  - [ ] Cancel button (if sender)

---

## 🔌 Wallet Connection Test

### With Hiro Wallet:
1. Click wallet button in header
2. Select "Connect with Hiro Wallet"
3. Approve connection
4. Button should show truncated address: `SP2D...DKJ3`
5. Network badge should show testnet/mainnet

---

## 📊 Form Validation Test

### Valid Data Entry:
```
Recipient: SP3P7R3D3EX3KMDA0A6XPTDQKZ9EFM5KC1EWMTXDNC
Total Deposit: 10.5
Duration: 30 days
```

### Expected Preview Output:
```
Recipient: SP3P7R3D3EX3KMDA0A6XPTDQKZ9EFM5KC1EWMTXDNC
Total Deposit: 10.50 STX
Protocol Fee: 0.026250 STX
Net Deposit: 10.473750 STX
Duration: 30 days / 4320 blocks
Per Block Rate: 0.00242282 STX
Per Day Rate: 0.349125 STX/day
```

### Invalid Data:
- [ ] Empty recipient: shows "Recipient address is required"
- [ ] Invalid address format: shows "Invalid Stacks address format"
- [ ] Empty deposit: shows "Deposit amount is required"
- [ ] Negative duration: shows validation error
- [ ] Create button disabled when form invalid

---

## ✨ UI/UX Checks

- [ ] Dark theme consistent across all pages
- [ ] Responsive design (open dev tools → device emulation)
- [ ] No console errors (F12 → Console tab)
- [ ] No TypeScript build warnings
- [ ] Buttons show loading state when processing
- [ ] Error messages display clearly in red
- [ ] Success toast notifications appear
- [ ] Scrolling works smoothly
- [ ] Links navigate correctly

---

## 🐛 Troubleshooting

**If you see "Form implementation coming next":**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Kill dev server (Ctrl+C)
3. Run: `rm -rf node_modules/.vite`
4. Restart: `npm run dev`
5. Reload page (Ctrl+F5)

**If data doesn't show:**
1. Check console for JavaScript errors (F12)
2. Verify .env has correct contract address
3. Ensure testnet network is selected
4. Check if wallet is actually connected

**If styles look broken:**
1. Run: `npm run build`
2. Restart dev server
3. Check if Tailwind CSS loaded correctly

---

## ✅ Final Verification

Once all checks pass:
```bash
npm run build        # Should complete with 0 errors
git status          # Should be clean
git log -1          # Latest commit should be feature implementations
```

**All 4 pages (1.10-1.13) should be fully functional without placeholders!**
