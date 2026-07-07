# Team Update Tool — First Entry Setup Guide

**Version:** 1.0.0  
**Compatibility:** Frappe Framework v15+ / ERPNext v15+

---

## 📋 Before You Start

Make sure the app is installed:
```bash
bench get-app https://github.com/Sudhakar1110/team_update_tool.git
bench --site yoursitename install-app team_update_tool
bench --site yoursitename migrate
bench restart
```

---

## 🚀 Quick Start: Run Demo Data (Recommended)

The fastest way to see the app working is to run the demo data script:

```bash
bench --site yoursitename execute team_update_tool.demo.seed_demo_data
```

This will automatically create:
- **4 users** with different roles
- **1 team** with members
- **3 tasks** in different workflow stages (In Progress, Completed, Approved)

---

## 👤 Manual Setup: Step-by-Step (First Time)

Follow these steps to create your **first entry** data manually.

---

### STEP 1: Login as Administrator

Login to your Frappe site using the **Administrator** account or a user with **System Manager** role.

---

### STEP 2: Create Test Users

> **Path:** User → + Add User

Create these 4 users with different roles:

| # | User Email | First Name | Last Name | Role to Assign |
|---|------------|------------|-----------|---------------|
| 1 | `admin@demo.com` | Admin | User | Team Update Admin |
| 2 | `leader@demo.com` | Team | Leader | Team Update Team Leader |
| 3 | `member@demo.com` | Team | Member | Team Update Team Member |
| 4 | `viewer@demo.com` | Viewer | User | Team Update Viewer |

**How to create a user:**
1. Go to **User** (search in Awesome Bar)
2. Click **+ Add User**
3. Fill Email, First Name, Last Name
4. Scroll to **Roles & Permissions** section
5. Click **+ Add Row** → Select the role
6. Make sure **Send Welcome Email** is unchecked
7. Click **Save**

---

### STEP 3: Create a Team

> **Path:** Team Update Tool workspace → Teams → + Add Team

| Field | Value |
|-------|-------|
| Team Name | `Development Team` |
| Team Type | `Development` |
| Team Lead | `leader@demo.com` (select from dropdown) |
| Is Active | ✅ Checked |
| Description | `Demo development team for testing` |

**Add Members:**
| User | Role in Team |
|------|-------------|
| `leader@demo.com` | Team Lead |
| `member@demo.com` | Full Stack Developer |

---

### STEP 4: Create Your First Task (as Admin)

> **Who:** Login as **Administrator** or a user with **Team Update Admin** role
> **Path:** Team Update Tool workspace → New Task

#### Section: Basic Information
| Field | Value |
|-------|-------|
| **Project Title** | `Customer Dashboard Enhancement` |
| **Team** | `Development Team` |
| **Project Type** | `Web Application` |
| **Status** | `Draft` (default) |
| **Priority** | `High` |

#### Section: Task Assignment
| Field | Value |
|-------|-------|
| **Assigned Team Leader** | `leader@demo.com` |

> ⚡ When you select a Team Leader, the `Assigned by Admin` checkbox auto-checks and status changes to **Assigned**.

#### Section: Dates
| Field | Value |
|-------|-------|
| **Start Date** | Select today's date |
| **Due Date** | Select a date 7 days from now |

#### Section: Project Details
| Field | Value |
|-------|-------|
| **Project Description** | Type: `Enhancing the customer dashboard with new charts and export features.` |
| **Tags** | `dashboard, UI, charts` |

#### Click **Save**

✅ **Your first task is created!** The Team Leader (`leader@demo.com`) will receive a notification.

---

### STEP 5: Continue the Workflow

Now login as different users to continue the workflow:

#### Login as `leader@demo.com` (Team Leader)
1. Open the task from **All Tasks** or **My Tasks**
2. In **Assigned To (Team Member)**, select `member@demo.com`
3. **Save** → Status changes to **In Progress**, Team Member gets notified

#### Login as `member@demo.com` (Team Member)
1. Open the task from **My Tasks**
2. Update **Progress (%)** to `50`, **Save**
3. Add **GitHub Repository URL:** `https://github.com/example/demo-project`
4. Upload a **Screenshot** (any image file)
5. Set **Progress (%)** to `100` → Status changes to **Completed**
6. OR click **Actions → Mark 100% Complete**

#### Login as `leader@demo.com` (Team Leader)
1. Open the completed task
2. Review the GitHub URL and screenshots
3. Set **Team Leader Review** to `Reviewed`
4. Click **Actions → Mark Reviewed** → Status changes to **Under Review**

#### Login as `Administrator` (Admin)
1. Open the task (status: Under Review)
2. Click **Actions → Approve Task** → Status changes to **Approved**

#### Login as `viewer@demo.com` (Viewer)
1. Go to **All Tasks** — you'll only see the **Approved** task
2. Open it — all fields are **disabled**, view-only

---

## 📸 Quick Reference: Screenshot Guide

### What each role sees on the form:

| Role | Banner | What's Available |
|------|--------|-----------------|
| **Admin** | 🟢 ⚙️ Admin - Full access | Everything editable + Approve/Reject buttons |
| **Team Leader** | 🟣 👥 Team Leader | Can assign members, update status, Mark Reviewed button |
| **Team Member** | 🔵 🔧 Team Member | Can update progress, upload files, Mark 100% Complete button |
| **Viewer** | 🟡 👁 View Only | Everything read-only, no buttons |

---

## ❌ Common First-Time Issues & Fixes

| Issue | Fix |
|-------|-----|
| "You do not have enough permissions" | Login as **Administrator** or assign **System Manager** role to your user |
| Role not appearing in User form | Run `bench --site yoursitename migrate` then `bench restart` |
| Workspace not showing | Run `bench build --app team_update_tool && bench restart` |
| Team Leader/Task not in dropdown | Make sure the Team and Team Leader were created and saved first |
| Viewer sees no tasks | Only **Approved** tasks are visible to Viewers |
| Notification not appearing | Check `bench doctor` for background jobs, or check Notification Log in bell icon |

---

## 📊 Verify Everything Works

After setting up, verify:

1. ✅ **Workspace** shows all shortcuts (New Task, All Tasks, My Tasks, Teams, etc.)
2. ✅ **Different roles** see different banners and buttons
3. ✅ **Workflow** progresses through all statuses: Draft → Assigned → In Progress → Completed → Under Review → Approved
4. ✅ **Notifications** appear in bell icon for each step
5. ✅ **Report** (Project Status Summary) shows correct data
6. ✅ **Viewer** only sees Approved tasks in read-only mode

---

*End of First Entry Setup Guide*
