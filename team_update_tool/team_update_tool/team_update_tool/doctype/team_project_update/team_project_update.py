# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class TeamProjectUpdate(Document):
	def validate(self):
		self.validate_viewer_cannot_write()
		self.validate_github_url()
		self.set_reviewed_by()

	def before_insert(self):
		if not self.project_owner:
			self.project_owner = frappe.session.user

	def validate_viewer_cannot_write(self):
		"""Hard server side guard: even if someone bypasses the UI (API call,
		mobile app, etc.) a user who ONLY has the Team Update Viewer role
		(and is not an Admin / System Manager) can never create, edit or
		delete a record. This mirrors the DocType permission table but adds
		an explicit, readable check + a clear error message.
		"""
		roles = frappe.get_roles(frappe.session.user)
		is_admin = "Team Update Admin" in roles or "System Manager" in roles
		is_viewer_only = "Team Update Viewer" in roles and not is_admin

		if is_viewer_only:
			frappe.throw(
				_("You have View Only access to Team Update Tool. You are not permitted to create, edit or delete project updates."),
				frappe.PermissionError,
			)

	def validate_github_url(self):
		if self.github_repo_url and "github.com" not in self.github_repo_url.lower():
			frappe.msgprint(
				_("The link entered does not look like a GitHub URL. Please double check it."),
				alert=True,
				indicator="orange",
			)

	def set_reviewed_by(self):
		if self.status == "Approved" and not self.reviewed_by:
			self.reviewed_by = frappe.session.user

	def on_trash(self):
		roles = frappe.get_roles(frappe.session.user)
		if "Team Update Admin" not in roles and "System Manager" not in roles:
			frappe.throw(
				_("Only Team Update Admin can delete project updates."), frappe.PermissionError
			)


def get_permission_query_conditions(user):
	"""Optional helper (wired up via hooks.py permission_query_conditions if enabled).
	Currently both Admin and Viewer see every project (marketing needs to see
	ALL completed projects across every team), so no extra filtering is
	applied by default. Kept here for teams that want to scope visibility
	e.g. per-team or per-owner in the future.
	"""
	return ""


def notify_new_project(doc, method=None):
	"""Called on after_insert. Notifies configured recipients (see Team
	Update Settings) that a new project update has been uploaded."""
	_send_notification(
		doc,
		subject=f"New Project Uploaded: {doc.project_title}",
		message=(
			f"<p>{frappe.utils.get_fullname(doc.project_owner)} uploaded a new project update.</p>"
			f"<p><b>Project:</b> {doc.project_title}<br>"
			f"<b>Team:</b> {doc.team}<br>"
			f"<b>Status:</b> {doc.status}</p>"
		),
	)


def notify_status_change(doc, method=None):
	"""Called on on_update. Notifies recipients specifically when a project
	is marked Completed, since that is the key event other teams (e.g.
	Marketing) care about."""
	if doc.has_value_changed("status") and doc.status == "Completed":
		_send_notification(
			doc,
			subject=f"Project Completed: {doc.project_title}",
			message=(
				f"<p>The following project was marked as <b>Completed</b>:</p>"
				f"<p><b>Project:</b> {doc.project_title}<br>"
				f"<b>Team:</b> {doc.team}<br>"
				f"<b>GitHub:</b> {doc.github_repo_url or '-'}</p>"
			),
		)


def _send_notification(doc, subject, message):
	try:
		settings = frappe.get_single("Team Update Settings")
	except Exception:
		return

	recipients = [row.user for row in getattr(settings, "notify_recipients", [])]
	if not recipients:
		return

	# In-app notification (bell icon)
	for user in recipients:
		if user == frappe.session.user:
			continue
		frappe.get_doc(
			{
				"doctype": "Notification Log",
				"subject": subject,
				"for_user": user,
				"type": "Alert",
				"document_type": doc.doctype,
				"document_name": doc.name,
				"from_user": frappe.session.user,
			}
		).insert(ignore_permissions=True)

	# Email notification (optional, controlled by settings)
	if getattr(settings, "enable_email_notification", 0):
		emails = [
			frappe.db.get_value("User", u, "email")
			for u in recipients
			if frappe.db.get_value("User", u, "email")
		]
		if emails:
			frappe.sendmail(recipients=emails, subject=subject, message=message)
