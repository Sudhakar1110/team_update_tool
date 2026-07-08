# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _

no_cache = 1


def get_context(context):
	context.title = _("Projects")
	context.no_breadcrumbs = 1

	# Get filter parameters
	status_filter = frappe.form_dict.get("status")
	category_filter = frappe.form_dict.get("category")

	# Build filters
	filters = {}
	if status_filter:
		filters["status"] = status_filter
	if category_filter:
		filters["project_category"] = category_filter

	# View-Only Users only see approved projects
	user = frappe.session.user
	roles = frappe.get_roles(user)
	is_viewer = "View-Only User" in roles and "Admin" not in roles and "System Manager" not in roles
	if is_viewer:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			filters["status"] = approved

	# Get projects
	context.projects = frappe.get_all("Project",
		filters=filters,
		fields=["name", "project_title", "status", "team", "priority",
				"project_category", "creation", "start_date", "completion_date",
				"owner"],
		order_by="modified desc"
	)

	# Enrich with status names/colors
	for p in context.projects:
		if p.status:
			s = frappe.get_cached_doc("Project Status", p.status)
			p.status_name = s.status_name
			p.status_color = s.color

	# Get available statuses and categories for filters
	context.statuses = frappe.get_all("Project Status",
		fields=["name", "status_name", "color"],
		order_by="status_name asc"
	)
	context.categories = frappe.get_all("Project Category",
		fields=["name", "category_name"],
		order_by="category_name asc"
	)

	context.is_logged_in = user != "Guest"
	context.is_viewer = is_viewer
	context.active_status = status_filter
	context.active_category = category_filter
