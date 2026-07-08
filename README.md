# Team Update Tool

A custom **Frappe Framework v15** application for tracking completed team projects with GitHub integration, screenshot uploads, and role-based access control.

## Features

- **Role-Based Access**: `Admin` (full CRUD) and `View-Only User` (read-only, server-enforced)
- **Master Data**: Project Categories, Teams, Technologies, Project Statuses
- **Project Management**: Track projects with GitHub repos, files, screenshots, and updates
- **GitHub Integration**: Auto-fetch repo metadata (commit SHA, languages, default branch)
- **File Upload**: Support for PNG, JPG, JPEG, PDF, DOCX formats
- **Notifications**: In-app alerts for new projects, approvals, and status changes
- **Reports**: Project Summary, Team Activity, Completed Projects, GitHub Repository

## Modules

| Module | Description |
|--------|-------------|
| **Masters** | Project Category, Team, Technology, Project Status |
| **Transactions** | Project, Project Files, Project Screenshots, GitHub Repository, Project Update |
| **Reports** | Project Summary, Team Activity, Completed Projects, GitHub Repository |

## Installation

```bash
cd ~/frappe-bench
bench get-app https://github.com/Sudhakar1110/team_update_tool.git
bench --site your-site.local install-app team_update_tool
bench --site your-site.local migrate
bench build --app team_update_tool
bench restart
```

## Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full CRUD on all DocTypes. Can create, edit, delete, approve, reject |
| **View-Only User** | Read-only. Can view approved projects, GitHub repos, screenshots. Server-enforced |

## Naming Series

| Doctype | Format |
|---------|--------|
| Project | PRJ-.YYYY.-.##### |
| GitHub Repository | GR-.YYYY.-.##### |
| Project Update | PU-.YYYY.-.##### |

## Permissions

Permissions are enforced in three layers:

1. **DocType permission table** - Role-based CRUD in each JSON file
2. **`get_permission_query_conditions()`** - View-Only Users only see Approved projects in list views
3. **`has_permission()`** - Doc-level read check for View-Only Users

## Frappe v15 Compatible

- All code lives inside `apps/team_update_tool` only
- Uses Frappe ORM (`frappe.get_doc`, `frappe.get_all`, `frappe.db.count`)
- No deprecated APIs
- Upgrade-safe with version-controlled JSON files
- Fixtures exportable via `bench export-fixtures`
