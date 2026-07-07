from frappe import _


def get_data():
	return [
		{
			"module_name": "Team Update Tool",
			"category": "Modules",
			"label": _("Team Update Tool"),
			"color": "#2E8B57",
			"icon": "octicon octicon-repo",
			"type": "module",
			"description": "Role-based task management with Admin, Team Leader, Team Member, and Viewer access.",
			"onboard_present": 1,
			"items": [
				{
					"type": "doctype",
					"name": "Team",
					"label": _("Team"),
					"description": _("Manage teams and team members."),
					"category": "Master",
				},
				{
					"type": "doctype",
					"name": "Team Project Update",
					"label": _("Team Project Update"),
					"description": _("Create and manage tasks with full workflow."),
					"category": "Transaction",
				},
				{
					"type": "doctype",
					"name": "Team Update Settings",
					"label": _("Team Update Settings"),
					"description": _("Configure notification settings."),
					"category": "Settings",
				},
				{
					"type": "report",
					"name": "Project Status Summary",
					"label": _("Project Status Summary"),
					"description": _("View task status, assignments, and progress."),
					"category": "Report",
					"is_query_report": True,
				},
			],
		}
	]
