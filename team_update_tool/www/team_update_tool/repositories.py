# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _

no_cache = 1


def get_context(context):
	context.title = _("GitHub Repositories")
	context.no_breadcrumbs = 1

	context.repositories = frappe.get_all("GitHub Repository",
		fields=["name", "repository_url", "repository_name", "commit_hash",
				"default_branch", "languages", "creation"],
		order_by="modified desc"
	)
