app_name = "team_update_tool"
app_title = "Team Update Tool"
app_publisher = "Your Company"
app_description = "Team Project Update Tool - Track completed projects, GitHub links and workflow screenshots with role based Admin / Viewer access. Built for Frappe Framework and ERPNext v15+."
app_email = "admin@example.com"
app_license = "MIT"
app_icon = "octicon octicon-repo"
app_color = "#2E8B57"

# Includes in <head>
# ------------------
app_include_css = "/assets/team_update_tool/css/team_update_tool.css"
app_include_js = "/assets/team_update_tool/js/team_update_tool.js"

# Home Pages
# ----------
# application home page (will override Website Settings)
# home_page = "login"

# Installation
# ------------
after_install = "team_update_tool.install.after_install"

# Fixtures
# --------
# Exported so that `bench --site [site] export-fixtures` / a fresh
# `bench --site [site] migrate` keeps the two custom Roles available
# even if the site is rebuilt from scratch.
fixtures = [
	{
		"dt": "Role",
		"filters": [["role_name", "in", ["Team Update Admin", "Team Update Viewer"]]],
	}
]

# Document Events
# ---------------
# hook on document methods and events
doc_events = {
	"Team Project Update": {
		"after_insert": "team_update_tool.team_update_tool.doctype.team_project_update.team_project_update.notify_new_project",
		"on_update": "team_update_tool.team_update_tool.doctype.team_project_update.team_project_update.notify_status_change",
	}
}

# Permission query conditions
# ----------------------------
# Optional - restrict list view to a user's own team while still allowing
# full read for both Admin and Viewer roles at the DocType permission level.
# Left disabled by default. Uncomment to enable "see only my team's projects"
# style scoping for Viewer role.
# permission_query_conditions = {
# 	"Team Project Update": "team_update_tool.team_update_tool.doctype.team_project_update.team_project_update.get_permission_query_conditions",
# }

# Website route rules
# --------------------
website_route_rules = []
