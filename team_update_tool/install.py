# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe


def after_install():
	"""Runs once when the app is installed on a site.
	Creates the two access-level roles used by this app:
	  - Team Update Admin  -> full Create / Edit / Delete / Modify rights
	  - Team Update Viewer -> strict read-only rights
	"""
	create_roles()
	create_default_settings()
	frappe.db.commit()


def create_roles():
	roles = [
		{
			"role_name": "Team Update Admin",
			"desk_access": 1,
			"description": "Full access (create, edit, delete, modify) on the Team Update Tool app.",
		},
		{
			"role_name": "Team Update Viewer",
			"desk_access": 1,
			"description": "Read-only access on the Team Update Tool app. Cannot create, edit or delete records.",
		},
	]

	for role in roles:
		if not frappe.db.exists("Role", role["role_name"]):
			doc = frappe.get_doc(
				{
					"doctype": "Role",
					"role_name": role["role_name"],
					"desk_access": role["desk_access"],
					"description": role["description"],
				}
			)
			doc.insert(ignore_permissions=True)
			frappe.msgprint(f"Created Role: {role['role_name']}")


def create_default_settings():
	# DocType may not exist yet on a fresh install (created by bench migrate
	# which runs after after_install). Silently skip if the doctype is absent.
	if not frappe.db.exists("DocType", "Team Update Settings"):
		return
	if not frappe.db.exists("Team Update Settings", "Team Update Settings"):
		return
	settings = frappe.get_single("Team Update Settings")
	if not settings.enable_email_notification:
		settings.enable_email_notification = 1
		settings.save(ignore_permissions=True)
