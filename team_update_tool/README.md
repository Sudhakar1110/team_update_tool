# Team Update Tool

A custom **Frappe Framework** app (fully compatible with **ERPNext v15+**) that lets
teams (e.g. Developers) upload completed projects — GitHub repo links, source
files, and workflow/UI screenshots — so other teams (e.g. Marketing) can browse
what has shipped, with strict **Admin vs View-Only** access control.

## Features

- **Team Project Update** doctype: project title, team, GitHub repo URL, live
  demo URL, uploaded source files, workflow/UI screenshots, status, priority,
  dates, description, tags, review remarks.
- **Team** master doctype with a Team Members child table.
- **Two access roles**:
  - `Team Update Admin` — full Create / Read / Update / Delete / Export / Share.
  - `Team Update Viewer` — Read + Export + Print only. Cannot create, edit or
    delete anything (enforced both at the DocType permission level **and**
    inside the server-side controller as a defense-in-depth check).
- **Team Update Settings** (single doctype) to configure notification
  recipients and toggle email alerts.
- **Script Report** — *Project Status Summary* — counts of projects per team
  by status (Draft / In Progress / Completed / On Hold / Approved), filterable
  by team and completion date range.
- **Workspace** — *Team Update Tool* — shortcuts to create a project, browse
  all projects, manage teams, view the report and settings.
- **Notifications** (Frappe `Notification` alerts):
  - *New Project Uploaded* — fires when any new project update is created.
  - *Project Completed* — fires when a project's status changes to `Completed`.
  - Both also push an in-app Notification Log entry + optional email via the
    doctype controller (`team_project_update.py`), driven by the recipients
    configured in **Team Update Settings**.

## Folder Structure

```
team_update_tool/
├── setup.py
├── requirements.txt
├── MANIFEST.in
├── license.txt
├── team_update_tool/
│   ├── hooks.py
│   ├── install.py                 # creates the 2 roles on install
│   ├── modules.txt
│   ├── patches.txt
│   ├── config/
│   │   ├── desktop.py
│   │   └── docs.py
│   ├── public/
│   │   ├── css/team_update_tool.css
│   │   └── js/team_update_tool.js
│   └── team_update_tool/          # module: "Team Update Tool"
│       ├── doctype/
│       │   ├── team/
│       │   ├── team_member/               (child table)
│       │   ├── team_project_update/       (core doctype)
│       │   ├── project_screenshot/        (child table)
│       │   ├── project_file/              (child table)
│       │   ├── team_update_settings/      (single doctype)
│       │   └── notification_recipient/    (child table)
│       ├── report/
│       │   └── project_status_summary/
│       ├── workspace/
│       │   └── team_update_tool/
│       └── notification/
│           ├── new_project_uploaded/
│           └── project_completed/
```

## Installation (bench)

```bash
# 1. Get the app onto your bench
cd ~/frappe-bench
bench get-app team_update_tool /path/to/team_update_tool   # or your git URL

# 2. Install it on your site (ERPNext v15+ site)
bench --site your-site.local install-app team_update_tool

# 3. Migrate to sync doctypes / report / workspace / notifications
bench --site your-site.local migrate

# 4. Build assets
bench build --app team_update_tool

# 5. Restart
bench restart
```

`install.py:after_install` automatically creates the two roles
(`Team Update Admin`, `Team Update Viewer`) the first time the app is
installed, so you don't need to create them manually.

## Post-install configuration

1. Go to **Team Update Tool workspace → Teams** and create your teams
   (e.g. "Development", "Marketing"), adding members under each team.
2. Go to **User** for each team member and assign the correct role:
   - Developers / project uploaders → `Team Update Admin`
   - Marketing / stakeholders who only need to browse → `Team Update Viewer`
   - (You can also keep `System Manager` for IT admins — it already has full
     rights on every doctype in this app.)
3. Go to **Team Update Settings** and add the users who should be notified
   whenever a new project is uploaded or marked Completed, and toggle
   **Enable Email Notification** if you also want emails sent.
4. Go to **Team Project Update → New** to let the Development team start
   logging finished projects: paste the GitHub repo URL, attach the zipped
   source (optional), and upload workflow/UI screenshots.
5. Marketing (or any `Team Update Viewer`) opens the same list/workspace and
   can view every project, screenshots and the GitHub link — but the form
   is locked (no Save/Delete) and the workspace clearly shows a "View Only"
   banner.

## Notes on permissions

Permissions are enforced in three layers, so the Viewer role cannot bypass
read-only access even via the API/mobile app:

1. **DocType permission table** (`team_project_update.json`) — Viewer role
   has `read`, `report`, `print`, `email`, `export` only; no `write`/`create`/`delete`.
2. **Server-side controller guard** (`validate()` / `on_trash()` in
   `team_project_update.py`) — throws `frappe.PermissionError` if a
   Viewer-only user somehow attempts to insert/save/delete.
3. **Client-side UX** (`team_update_tool.js` / doctype `.js` files) — shows a
   "View Only" banner and disables the form for a smoother user experience.

## Compatibility

Built against the **Frappe Framework v15** doctype schema (`naming_rule`,
`field_order`, Workspace `content` builder JSON, `Notification` alert
doctype, `Notification Log`) and is compatible with **ERPNext v15+** sites
(the app itself does not depend on any ERPNext doctype, so it installs
cleanly on a plain Frappe site or an ERPNext v15+ site).
