# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _

no_cache = 1


def get_context(context):
	context.title = _("Screenshot Gallery")
	context.no_breadcrumbs = 1

	# Build list of screenshots from visible projects
	user = frappe.session.user
	roles = frappe.get_roles(user)
	is_viewer = "View-Only User" in roles and "Admin" not in roles

	project_filters = {}
	if is_viewer:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			project_filters["status"] = approved

	projects = frappe.get_all("Project", filters=project_filters, pluck="name")

	context.screenshots = []
	for project_name in projects:
		try:
			project = frappe.get_cached_doc("Project", project_name)
			for s in project.screenshots or []:
				context.screenshots.append({
					"screenshot": s.screenshot,
					"caption": s.caption or "",
					"screenshot_type": s.screenshot_type or "",
					"project": project_name,
					"project_title": project.title,
				})
		except frappe.DoesNotExistError:
			pass

	# Reverse for most recent first
	context.screenshots.reverse()
	context.total = len(context.screenshots)
