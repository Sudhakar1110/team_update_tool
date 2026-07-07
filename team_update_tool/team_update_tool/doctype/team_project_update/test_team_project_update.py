# Copyright (c) 2026, Your Company and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestTeamProjectUpdate(FrappeTestCase):
	def setUp(self):
		if not frappe.db.exists("Team", "QA Test Team"):
			frappe.get_doc(
				{
					"doctype": "Team",
					"team_name": "QA Test Team",
					"team_type": "Development",
				}
			).insert(ignore_permissions=True)

	def test_create_project_update(self):
		doc = frappe.get_doc(
			{
				"doctype": "Team Project Update",
				"project_title": "Sample Project",
				"team": "QA Test Team",
				"status": "In Progress",
				"github_repo_url": "https://github.com/example/sample-project",
			}
		)
		doc.insert(ignore_permissions=True)
		self.assertTrue(doc.name.startswith("TUT-"))
		self.assertEqual(doc.project_owner, frappe.session.user)

	def test_viewer_cannot_create(self):
		if not frappe.db.exists("User", "viewer_test@example.com"):
			user = frappe.get_doc(
				{
					"doctype": "User",
					"email": "viewer_test@example.com",
					"first_name": "Viewer",
					"send_welcome_email": 0,
					"roles": [{"role": "Team Update Viewer"}],
				}
			)
			user.insert(ignore_permissions=True)

		frappe.set_user("viewer_test@example.com")
		try:
			with self.assertRaises(frappe.PermissionError):
				frappe.get_doc(
					{
						"doctype": "Team Project Update",
						"project_title": "Should Fail",
						"team": "QA Test Team",
						"status": "Draft",
					}
				).insert()
		finally:
			frappe.set_user("Administrator")
