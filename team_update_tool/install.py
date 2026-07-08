# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe


def after_install():
	"""Creates roles on app install."""
	create_roles()
	frappe.db.commit()


def create_roles():
	roles = [
		{
			"role_name": "Admin",
			"desk_access": 1,
			"description": "Full CRUD access. Can create, read, update, delete, approve, reject projects, manage teams, configure settings.",
		},
		{
			"role_name": "View-Only User",
			"desk_access": 1,
			"description": "Read-only access. Can view approved projects, GitHub links, screenshots, documents, and reports. Cannot create, edit, delete, or upload.",
		},
	]
	for role in roles:
		if not frappe.db.exists("Role", role["role_name"]):
			doc = frappe.get_doc({
				"doctype": "Role",
				"role_name": role["role_name"],
				"desk_access": role["desk_access"],
				"description": role["description"],
			})
			doc.insert(ignore_permissions=True)
