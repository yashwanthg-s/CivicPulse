# Status Lock - Complete Flowchart

## 🔄 Complaint Status Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLAINT CREATED                            │
│                                                                 │
│                    Status: 🔴 Open                              │
│                    ✅ Can be updated                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                    Officer selects complaint
                             │
                             ↓
                    ┌─────────────────────┐
                    │ Show Update Form    │
                    │ ✓ Status dropdown   │
                    │ ✓ Message textarea  │
                    │ ✓ Update button     │
                    └────────┬────────────┘
                             │
                             ↓
                    Officer changes status
                             │
                ┌────────────┼────────────┐
                │            │            │
                ↓            ↓            ↓
        🟡 Assigned   🟠 In Progress   ❌ Rejected
        ✅ Can update ✅ Can update    🔒 FINAL
                │            │            │
                └────────────┼────────────┘
                             │
                             ↓
                    Officer continues work
                             │
                             ↓
                    Officer marks as resolved
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLAINT RESOLVED                           │
│                                                                 │
│                    Status: 🟢 Resolved                          │
│                    ❌ CANNOT be updated                         │
│                    🔒 FINAL STATE                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
                    Officer selects complaint
                             │
                             ↓
                    ┌─────────────────────────────┐
                    │ Show Lock Message           │
                    │ ✅ Complaint Resolved       │
                    │ ✅ Shows officer name       │
                    │ ✅ Shows timestamp          │
                    │ ❌ No status dropdown       │
                    │ ❌ No message textarea      │
                    │ ❌ No update button         │
                    └─────────────────────────────┘
                             │
                             ↓
                    Officer CANNOT make changes
                             │
                             ↓
                    Complaint stays in history
```

---

## 📊 Status Update Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                  Officer Selects Complaint                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                    Check complaint status
                             │
                ┌────────────┼────────────┐
                │            │            │
                ↓            ↓            ↓
        Status = Resolved?  Status = Rejected?  Other Status?
                │            │            │
                ↓            ↓            ↓
              YES           YES           NO
                │            │            │
                ↓            ↓            ↓
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Show Lock    │ │ Show Lock    │ │ Show Update  │
        │ Message      │ │ Message      │ │ Form         │
        │              │ │              │ │              │
        │ ✅ Resolved  │ │ ✅ Resolved  │ │ ✓ Dropdown   │
        │ ❌ No form   │ │ ❌ No form   │ │ ✓ Textarea   │
        │              │ │              │ │ ✓ Button     │
        └──────────────┘ └──────────────┘ └──────────────┘
                │            │            │
                └────────────┼────────────┘
                             │
                             ↓
                    Officer sees appropriate UI
```

---

## 🔐 Lock Mechanism

```
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend Logic                                 │
│                                                                 │
│  if (selectedComplaint.status === 'resolved') {                │
│    // LOCKED - Show lock message                               │
│    return <LockMessage />                                       │
│  } else {                                                       │
│    // UNLOCKED - Show update form                              │
│    return <UpdateForm />                                        │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Status Transition Matrix

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ From Status  │ To Open  │ To Assign│ To Prog  │ To Resol │ To Reject│
├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 🔴 Open      │    -     │    ✅    │    ✅    │    ✅    │    ✅    │
│ 🟡 Assigned  │    ✅    │    -     │    ✅    │    ✅    │    ✅    │
│ 🟠 In Prog   │    ✅    │    ✅    │    -     │    ✅    │    ✅    │
│ 🟢 Resolved  │    ❌    │    ❌    │    ❌    │    -     │    ❌    │
│ ❌ Rejected  │    ❌    │    ❌    │    ❌    │    ❌    │    -     │
└──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

✅ = Can transition
❌ = Cannot transition (LOCKED)
-  = Same status
```

---

## 🎯 User Journey

### Scenario 1: Normal Workflow (Allowed)

```
1. Complaint Created
   Status: 🔴 Open
   Officer sees: Update form ✅
   
2. Officer Assigns
   Status: 🟡 Assigned
   Officer sees: Update form ✅
   
3. Officer Starts Work
   Status: 🟠 In Progress
   Officer sees: Update form ✅
   
4. Officer Completes Work
   Status: 🟢 Resolved
   Officer sees: Lock message ✅
   
5. Complaint is FINAL
   Status: 🟢 Resolved
   Officer sees: Lock message ✅
   Officer CANNOT update ❌
```

### Scenario 2: Trying to Update Resolved (Blocked)

```
1. Officer selects resolved complaint
   
2. Frontend checks status
   if (status === 'resolved') → TRUE
   
3. Show lock message instead of form
   
4. Officer sees:
   ✅ Complaint Resolved
   This complaint has been resolved and is now final.
   No further updates are allowed.
   
5. Officer CANNOT:
   ❌ Change status
   ❌ Add message
   ❌ Click update button
```

---

## 🔍 Detailed Lock Message Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Complaint is Resolved                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                    Frontend renders component
                             │
                             ↓
                    Check: status === 'resolved'?
                             │
                             ↓
                           YES
                             │
                             ↓
        ┌───────────────────────────────────────┐
        │ Render Lock Message Container         │
        │                                       │
        │ Background: Light green (#e8f5e9)    │
        │ Border: 2px solid green (#4caf50)    │
        │ Padding: 20px                         │
        │ Border-radius: 8px                    │
        │                                       │
        │ ┌─────────────────────────────────┐  │
        │ │ ✅ Complaint Resolved           │  │
        │ │ (Color: #2e7d32 - Dark green)   │  │
        │ └─────────────────────────────────┘  │
        │                                       │
        │ This complaint has been resolved     │
        │ and is now final. No further         │
        │ updates are allowed.                 │
        │ (Color: #558b2f - Medium green)      │
        │                                       │
        │ Resolved by: Officer John            │
        │ on 2024-03-14 02:30 PM               │
        │ (Color: #558b2f - Medium green)      │
        │ (Font-size: 0.9rem)                  │
        │                                       │
        └───────────────────────────────────────┘
                             │
                             ↓
                    Officer sees lock message
                    Officer CANNOT update
```

---

## 🚫 What Gets Hidden for Resolved Complaints

```
┌─────────────────────────────────────────────────────────────────┐
│                  Hidden Elements                                │
│                                                                 │
│  ❌ Status Dropdown                                             │
│     <select id="new-status">                                    │
│       <option>Select status...</option>                         │
│       <option>🔴 Open</option>                                  │
│       <option>🟡 Assigned</option>                              │
│       <option>🟠 In Progress</option>                           │
│       <option>🟢 Resolved</option>                              │
│       <option>❌ Rejected</option>                              │
│     </select>                                                   │
│                                                                 │
│  ❌ Message Textarea                                            │
│     <textarea placeholder="Add a message...">                   │
│     </textarea>                                                 │
│                                                                 │
│  ❌ Update Button                                               │
│     <button>✓ Update Status</button>                            │
│                                                                 │
│  ❌ Resolution Upload Button                                    │
│     <button>📸 Upload Resolution Images</button>                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ What Gets Shown for Resolved Complaints

```
┌─────────────────────────────────────────────────────────────────┐
│                  Visible Elements                               │
│                                                                 │
│  ✅ Lock Message Container                                      │
│     Background: Light green                                     │
│     Border: Green                                               │
│                                                                 │
│  ✅ Resolved Title                                              │
│     "✅ Complaint Resolved"                                     │
│     Color: Dark green                                           │
│                                                                 │
│  ✅ Lock Description                                            │
│     "This complaint has been resolved and is now final.         │
│      No further updates are allowed."                           │
│     Color: Medium green                                         │
│                                                                 │
│  ✅ Resolution Metadata                                         │
│     "Resolved by: Officer John"                                 │
│     "on 2024-03-14 02:30 PM"                                    │
│     Color: Medium green                                         │
│     Font-size: 0.9rem                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Status Lifecycle

```
CREATION
   │
   ↓
🔴 Open (Editable)
   │ Officer can update
   ↓
🟡 Assigned (Editable)
   │ Officer can update
   ↓
🟠 In Progress (Editable)
   │ Officer can update
   ↓
🟢 Resolved (LOCKED)
   │ Officer CANNOT update
   │ FINAL STATE
   ↓
HISTORY
   │ Complaint appears in history
   │ Officer can view but not edit
   ↓
COMPLETE
```

---

## 📊 State Machine Diagram

```
                    ┌─────────────┐
                    │   CREATED   │
                    │  🔴 Open    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  ASSIGNED   │
                    │ 🟡 Assigned │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │  IN PROGRESS    │
                    │ 🟠 In Progress  │
                    └──────┬──────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │  RESOLVED   │      │  REJECTED   │
         │ 🟢 Resolved │      │ ❌ Rejected │
         │   (LOCKED)  │      │   (LOCKED)  │
         └─────────────┘      └─────────────┘
                │                     │
                └──────────┬──────────┘
                           │
                    ┌──────▼──────┐
                    │   HISTORY   │
                    │  (Read-only) │
                    └─────────────┘
```

---

## Summary

**Status Lock Flowchart:**
1. Complaint created with status Open
2. Officer can update through Open → Assigned → In Progress
3. Officer marks as Resolved
4. Status becomes LOCKED
5. Officer cannot update anymore
6. Complaint moves to history (read-only)

**Key Points:**
- ✅ Open/Assigned/In Progress = Editable
- 🔒 Resolved/Rejected = LOCKED (Final)
- 📋 History = Read-only view

