# Team Update Tool — Standard Operating Procedure (SOP)

**App Name:** Team Update Tool  
**Version:** 1.0.0  
**Compatibility:** Frappe Framework v15+ / ERPNext v15+  
**Repository:** https://github.com/Sudhakar1110/team_update_tool.git  
**Document Version:** 1.0  
**Last Updated:** July 7, 2026

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [System Requirements](#2-system-requirements)
3. [Installation Procedure](#3-installation-procedure)
4. [Post-Installation Configuration](#4-post-installation-configuration)
5. [Role & Permission Management](#5-role--permission-management)
6. [Creating & Managing Teams](#6-creating--managing-teams)
7. [Uploading a Project Update (Admin)](#7-uploading-a-project-update-admin)
8. [Viewing Projects (Viewer)](#8-viewing-projects-viewer)
9. [Project Status Report](#9-project-status-report)
10. [Notification System](#10-notification-system)
11. [Workspace Usage Guide](#11-workspace-usage-guide)
12. [Troubleshooting](#12-troubleshooting)
13. [Backup & Restore](#13-backup--restore)
14. [Appendix: Doctype Reference](#14-appendix-doctype-reference)

---

## 1. Purpose & Scope

### 1.1 Purpose
The Team Update Tool enables teams (e.g., Developers, Designers, QA) to upload completed project details — including GitHub repository links, source files, and workflow/UI screenshots — so that other teams (e.g., Marketing, Management) can browse and review completed work with strict role-based access control.

### 1.2 Scope
This SOP covers:
- Installation and setup on a Frappe/ERPNext v15+ bench
- Configuration of teams, members, and notification recipients
- Daily operations: uploading projects, viewing projects, generating reports
- Role management: Admin (full access) vs Viewer (read-only access)
- Troubleshooting common issues

### 1.3 Key Features
- **Two access roles:** Team Update Admin (full CRUD) and Team Update Viewer (read-only)
- **Project uploads:** GitHub repo URLs, live demo URLs, zipped source files, screenshots
- **Team management:** Create teams with members and team leads
- **Status tracking:** Draft → In Progress → Completed → On Hold → Approved
- **Script report:** Project Status Summary with filters by team and date range
- **Notifications:** In-app and optional email alerts for new/completed projects
- **Workspace:** Dedicated workspace with shortcuts and card navigation

---

## 2. System Requirements

### 2.1 Software Requirements
| Component | Version |
|-----------|---------|
| Frappe Framework | v15.0.0 or higher |
| ERPNext (optional) | v15.0.0 or higher |
| Python | 3.10 or higher |
| Node.js | 18.x or higher |
| MariaDB | 10.6 or higher |
| Redis | 6.x or higher |

### 2.2 Hardware Requirements (Minimum)
| Resource | Requirement |
|----------|-------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Disk | 20 GB free space |

---

## 3. Installation Procedure

### 3.1 Get the App
```bash
# Navigate to your bench directory
cd ~/frappe-bench

# Download the app from GitHub
bench get-app https://github.com/Sudhakar1110/team_update_tool.git
```

**Expected output:** The app clones successfully with no errors.

### 3.2 Install on a Site
```bash
bench --site your-site-name install-app team_update_tool
```

**What this does:**
- Runs `after_install` which automatically creates two roles:
  - `Team Update Admin` — Full access
  - `Team Update Viewer` — Read-only access
- Registers the app module

### 3.3 Run Migration
```bash
bench --site your-site-name migrate
```

**What this does:**
- Creates all database tables for the doctypes
- Imports workspace, report, and notification definitions
- Applies any pending patches

### 3.4 Build Assets
```bash
bench build --app team_update_tool
```

### 3.5 Restart Bench
```bash
bench restart
```

### 3.6 Verify Installation
1. Log in to your Frappe site
2. You should see **Team Update Tool** in the module list (Workspace dropdown)
3. Click on it to open the Team Update Tool workspace
4. Verify you can see the workspace with shortcuts

---

## 4. Post-Installation Configuration

### Step 1: Create Teams
1. Go to **Team Update Tool > Teams** (or use the workspace)
2. Click **+ Add Team**
3. Enter:
   - **Team Name:** e.g., "Development Team"
   - **Team Type:** Select from dropdown (Development, Marketing, Design, QA, etc.)
   - **Team Lead:** Select a user (optional)
   - **Is Active:** Checked (default)
   - **Description:** Brief description (optional)
4. In the **Members** child table, add team members:
   - **User:** Select a user
   - **Role in Team:** e.g., "Senior Developer" (optional)
5. Save

**Create separate teams for each department:**
- Development Team
- Marketing Team
- Design Team
- QA Team

### Step 2: Configure Team Update Settings
1. Go to **Team Update Tool > Team Update Settings**
2. Configure:
   - **Enable Email Notification:** Check to send email alerts
   - **Default Team:** Select a default team (optional)
   - **Notify Recipients:** Add users who should receive notifications when projects are uploaded or completed
3. Save

### Step 3: Assign Roles to Users
See Section 5 for detailed instructions.

---

## 5. Role & Permission Management

### 5.1 Role Overview

| Role | Permissions | Intended For |
|------|-------------|--------------|
| **Team Update Admin** | Full: Create, Read, Write, Delete, Export, Print, Share, Report | Developers, Project Managers, IT Admins |
| **Team Update Viewer** | Read-only: Read, Export, Print, Report, Email | Marketing, Stakeholders, Management |
| **System Manager** | Full access (Frappe built-in) | IT Administrators |

### 5.2 How to Assign Roles

**Via User form:**
1. Go to **Users** (search in the Awesome Bar)
2. Open the user you want to assign a role to
3. Scroll to the **Roles & Permissions** section
4. Click **+ Add Row**
5. Select the role: `Team Update Admin` or `Team Update Viewer`
6. Save

**Via Bulk Assignment:**
1. Go to **Users > List View**
2. Select multiple users
3. Click **Actions > Assign Role**
4. Select the role and apply

### 5.3 Permission Enforcement Layers

Permissions are enforced at THREE layers for security:

| Layer | Mechanism | What it does |
|-------|-----------|-------------|
| **1. DocType Permissions** | `team_project_update.json`, `team.json`, etc. | Viewer role has only `read`, `report`, `print`, `email`, `export` |
| **2. Server-Side Guard** | `validate()` and `on_trash()` in Python controller | Throws `frappe.PermissionError` if a Viewer attempts create/edit/delete |
| **3. Client-Side UX** | `team_update_tool.js` and doctype JS files | Shows "View Only" banner and disables form for Viewers |

### 5.4 Important Notes
- A user with **both** Admin and Viewer roles will have Admin access (Admin takes precedence)
- **System Manager** always has full access to all doctypes
- Permission changes take effect on next page refresh (no need to logout)

---

## 6. Creating & Managing Teams

### 6.1 Create a New Team
1. Navigate to **Team Update Tool > Teams**
2. Click **+ Add Team**
3. Fill in the following fields:

| Field | Required | Description |
|-------|----------|-------------|
| Team Name | Yes | Unique name for the team (e.g., "Development Team") |
| Team Type | Yes | Select: Development, Marketing, Design, QA, Product, DevOps, Other |
| Team Lead | No | Link to a User who leads this team |
| Is Active | No | Checked by default. Uncheck to deactivate a team |
| Description | No | Brief description of the team's role |

### 6.2 Add Team Members
1. In the **Members** child table, click **+ Add Row**
2. Select a **User** from the dropdown
3. Optionally enter their **Role in Team** (e.g., "Frontend Developer")
4. Repeat for each member
5. Save

> **Note:** A user cannot be added more than once to the same team. The system will display an error if you try.

### 6.3 Edit or Deactivate a Team
- **Edit:** Open the Team record, make changes, and Save
- **Deactivate:** Uncheck **Is Active** and Save
- **Delete:** Only Team Update Admin or System Manager can delete teams

---

## 7. Uploading a Project Update (Admin)

### 7.1 Who can do this?
Users with the **Team Update Admin** or **System Manager** role.

### 7.2 Procedure
1. Go to **Team Update Tool > New Project Update** (shortcut in workspace)
2. Fill in the following fields:

#### Section: Basic Information
| Field | Required | Description |
|-------|----------|-------------|
| **Project Title** | Yes | Name of the project |
| **Team** | Yes | Select the team that completed this project |
| **Project Type** | No | Select from: Web Application, Mobile Application, API/Integration, Automation Script, ERPNext Customization, Other |
| **Status** | Yes | Select: Draft, In Progress, Completed, On Hold, Approved |
| **Priority** | No | Select: Low, Medium, High |

#### Section: Dates
| Field | Required | Description |
|-------|----------|-------------|
| **Start Date** | No | When the project started |
| **Completion Date** | No | When the project was completed |

#### Section: Project Details
| Field | Required | Description |
|-------|----------|-------------|
| **Project Description** | No | Detailed description using the rich text editor |
| **Tags** | No | Comma-separated tags (e.g., "ERPNext, UI, Customization") |

#### Section: Source Code & Links
| Field | Required | Description |
|-------|----------|-------------|
| **GitHub Repository URL** | No | URL to the GitHub repository (e.g., https://github.com/username/repo) |
| **Live / Demo URL** | No | URL to the live demo or staging site |
| **Uploaded Project Files** | No | Attach zip/tar files of the project source code |

#### Section: Screenshots
| Field | Required | Description |
|-------|----------|-------------|
| **Workflow / UI Screenshots** | No | Upload screenshots showing the project workflow or UI |

> For each screenshot, you can add:
> - **Screenshot:** Image file (JPG, PNG, GIF)
> - **Caption:** Brief description of the screenshot
> - **Type:** Workflow, Dashboard, UI Screen, Database/ERD, Other

#### Section: Review (Admin only)
| Field | Required | Description |
|-------|----------|-------------|
| **Reviewed By** | No | Auto-populated when status changes to "Approved" |
| **Review Remarks** | No | Any remarks or notes about the project |

### 7.3 Upload GitHub Files
1. In the **Uploaded Project Files** section, click **+ Add Row**
2. Click the **Attach** button to select and upload a file
3. Optionally add a **Description** for the file
4. Repeat for multiple files if needed

### 7.4 Upload Screenshots
1. In the **Workflow / UI Screenshots** section, click **+ Add Row**
2. Click the **Attach** button to select and upload a screenshot image
3. Add a **Caption** (e.g., "Dashboard View after login")
4. Select the **Type** (Workflow, Dashboard, UI Screen, etc.)
5. Repeat for multiple screenshots

### 7.5 Save and Submit
1. After filling in all details, click **Save**
2. The system will auto-generate a name like `TUT-2026-00001`
3. You can update the status later as the project progresses

---

## 8. Viewing Projects (Viewer)

### 8.1 Who can do this?
Users with the **Team Update Viewer** role.

### 8.2 What Viewers Can Do
- ✅ View all project updates across all teams
- ✅ View project details, descriptions, GitHub links
- ✅ View and download uploaded files
- ✅ View screenshots (images displayed inline)
- ✅ View the Project Status Summary report
- ✅ Export data to CSV/Excel
- ✅ Print records
- ✅ Receive notifications (in-app and email)

### 8.3 What Viewers CANNOT Do
- ❌ Create new project updates
- ❌ Edit existing project updates
- ❌ Delete project updates
- ❌ Create or edit teams
- ❌ Access Team Update Settings
- ❌ Change any data

### 8.4 Viewer Experience
When a Viewer opens a project update form:
- They see a **yellow banner**: "👁 View Only Access — Editing is disabled for your role"
- All form fields are **disabled** (cannot be edited)
- No **Save** or **Delete** buttons are visible
- They can still:
  - Click **"View on GitHub"** button to open the GitHub repo
  - Click **"Open Live Demo"** button to visit the demo URL
  - View all screenshots inline
  - Download attached files

### 8.5 How Viewers Browse Projects
1. Go to **Team Update Tool > All Projects** (from workspace shortcuts)
2. Use filters to narrow down:
   - **Filter by Team:** Select a specific team
   - **Filter by Status:** Select Draft, Completed, etc.
   - **Search:** Search by project title
3. Click on any project to view full details
4. Open GitHub links or demo URLs directly from the form

---

## 9. Project Status Report

### 9.1 Accessing the Report
1. Go to **Team Update Tool > Project Status Summary** (from workspace)

### 9.2 Report Description
The **Project Status Summary** is a Script Report that shows a count of projects per team, broken down by status.

### 9.3 Report Columns
| Column | Description |
|--------|-------------|
| **Team** | Team name (linked to Team doctype) |
| **Total Projects** | Total number of projects |
| **Draft** | Count of Draft projects |
| **In Progress** | Count of In Progress projects |
| **Completed** | Count of Completed projects |
| **On Hold** | Count of On Hold projects |
| **Approved** | Count of Approved projects |

### 9.4 Filters
| Filter | Description |
|--------|-------------|
| **Team** | Filter by a specific team (optional) |
| **Completed From** | Show projects completed on or after this date (optional) |
| **Completed To** | Show projects completed on or before this date (optional) |

### 9.5 Generating the Report
1. Open the report
2. Optionally set filters and click **Refresh**
3. View the summary data
4. Use the **Export** button to download as CSV or Excel

---

## 10. Notification System

### 10.1 Types of Notifications

| Notification | Trigger | Recipients |
|-------------|---------|------------|
| **New Project Uploaded** | When a new Team Project Update is created | All users with Team Update Viewer + Team Update Admin roles |
| **Project Completed** | When a project's status changes to "Completed" | All users with Team Update Viewer + Team Update Admin roles |

### 10.2 In-App Notifications
- Notifications appear in the **bell icon** (Notification Log) in the Frappe toolbar
- Users see a red badge with unread count
- Click the bell to view all notifications

### 10.3 Email Notifications (Optional)
1. Go to **Team Update Settings**
2. Check **Enable Email Notification**
3. Add recipients in the **Notify Recipients** table
4. Save

When enabled, emails are sent to configured recipients for:
- New project uploads
- Projects marked as Completed

### 10.4 Notification Log Entries
In addition to Frappe's Notification system, the app also creates Notification Log entries for users configured in **Team Update Settings > Notify Recipients**. These appear in the bell icon tray.

---

## 11. Workspace Usage Guide

### 11.1 Accessing the Workspace
- **Method 1:** Click the **Team Update Tool** module in the workspace dropdown
- **Method 2:** Search "Team Update Tool" in the Awesome Bar (Ctrl+G)

### 11.2 Workspace Layout

**Top Section — Shortcuts (Quick Actions):**
| Shortcut | Action | Who Can Use |
|----------|--------|-------------|
| **New Project Update** | Opens a new Team Project Update form | Admin only |
| **All Projects** | Opens list of all project updates | Admin + Viewer |
| **Teams** | Opens list of teams | Admin only |
| **Project Status Summary** | Opens the status report | Admin + Viewer |
| **Team Update Settings** | Opens settings (notification config) | Admin only |

**Bottom Section — Card Links:**
| Card | Action | Who Can Use |
|------|--------|-------------|
| **All Project Updates** | Opens list view | Admin + Viewer |
| **Teams** | Opens team list | Admin + Viewer |
| **Project Status Summary** | Opens report | Admin + Viewer |
| **Team Update Settings** | Opens settings | Admin only |

### 11.3 Awesome Bar Shortcuts
Type these in the Awesome Bar (Ctrl+G):
- `Team Project Update` → Opens list of project updates
- `Team` → Opens list of teams
- `Project Status Summary` → Opens the report
- `Team Update Settings` → Opens settings

---

## 12. Troubleshooting

### 12.1 Installation Errors

**Error:** `No such file or directory: 'setup.py'`  
**Cause:** App structure is incorrect in the repository  
**Solution:** Ensure you're using the latest version from GitHub:
```bash
bench get-app https://github.com/Sudhakar1110/team_update_tool.git
```

**Error:** `gunicorn was included as a URL dependency`  
**Cause:** Old requirements.txt listed `frappe` as a pip dependency  
**Solution:** This is already fixed. Run:
```bash
bench get-app https://github.com/Sudhakar1110/team_update_tool.git --overwrite
```

**Error:** `Module Not Found: team_update_tool`  
**Cause:** App not properly installed  
**Solution:**
```bash
bench --site your-site install-app team_update_tool
bench --site your-site migrate
bench restart
```

### 12.2 Runtime Errors

**Error:** "You have View Only access" when trying to save  
**Cause:** User has Team Update Viewer role without Admin role  
**Solution:** Assign the **Team Update Admin** role to the user if they need to edit

**Error:** "User X is added more than once in the Members table"  
**Cause:** Duplicate user entry in team members  
**Solution:** Remove the duplicate entry and save

**Error:** Workspace not showing up  
**Cause:** Assets not built or site not migrated  
**Solution:**
```bash
bench build --app team_update_tool
bench --site your-site migrate
bench restart
```

### 12.3 Permission Issues

**Issue:** Viewer can see the New button in List View  
**Explanation:** The New button may appear but clicking it will throw a PermissionError due to server-side enforcement. This is by design — the server always validates permissions.

**Issue:** Admin cannot see a doctype  
**Solution:** Check if the user has both Admin and Viewer roles. If so, Admin takes precedence. Ensure the user does not have any permission restrictions set on their user record.

### 12.4 Notification Issues

**Issue:** Notifications not appearing  
**Solution:**
1. Check that **Team Update Settings > Enable Email Notification** is checked
2. Verify recipients are added in **Notify Recipients** table
3. Check that Frappe background jobs are running:
```bash
bench doctor
```

**Issue:** Emails not sending  
**Solution:**
1. Verify email setup in **System Settings > Email**
2. Check **Team Update Settings > Enable Email Notification** is checked
3. Verify recipients have valid email addresses in their User record
4. Check the scheduler log: `bench --site your-site show-scheduler-log`

### 12.5 Report Issues

**Issue:** Report shows no data  
**Solution:**
1. Ensure there are Team Project Update records created
2. Clear filters and try again
3. Check if any records exist: `Select * from tabTeam Project Update`

### 12.6 Migration Issues

**Error:** Migration fails with `Table already exists`  
**Solution:**
```bash
bench --site your-site migrate --force
```

**Error:** Patch not applied  
**Solution:**
```bash
bench --site your-site console
```
Then check `tabPatch Log` for failed patches.

---

## 13. Backup & Restore

### 13.1 Backup the Site
```bash
bench --site your-site backup
```

### 13.2 Backup Only the App Data
The Team Update Tool data is stored in your site's database. Regular site backups are sufficient:
```bash
bench --site your-site backup --with-files
```

### 13.3 Restore from Backup
```bash
bench --site your-site restore /path/to/backup/file
```

---

## 14. Appendix: Doctype Reference

### 14.1 Complete List of Doctypes

| Doctype | Type | Purpose |
|---------|------|---------|
| **Team** | Master | Stores team information (name, type, lead, members) |
| **Team Member** | Child Table | List of users in a team (linked to Team) |
| **Team Project Update** | Master | Stores project details, GitHub links, files, screenshots |
| **Project File** | Child Table | Uploaded project files (linked to Team Project Update) |
| **Project Screenshot** | Child Table | Uploaded screenshots (linked to Team Project Update) |
| **Team Update Settings** | Single | Global settings for notifications |
| **Notification Recipient** | Child Table | Users to notify (linked to Team Update Settings) |

### 14.2 Reports

| Report | Type | Purpose |
|--------|------|---------|
| **Project Status Summary** | Script Report | Count of projects per team by status |

### 14.3 Notifications

| Notification | Event | Document Type |
|-------------|-------|---------------|
| **New Project Uploaded** | New Record | Team Project Update |
| **Project Completed** | Value Change (status → Completed) | Team Project Update |

### 14.4 Roles

| Role | Desk Access | Description |
|------|-------------|-------------|
| **Team Update Admin** | Yes | Full access (create, edit, delete, modify) |
| **Team Update Viewer** | Yes | Read-only access. Cannot create, edit or delete records |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 7, 2026 | System | Initial SOP document created |

---

*End of SOP Document*
