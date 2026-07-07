# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Team(Document):
	def validate(self):
		self.validate_unique_members()

	def validate_unique_members(self):
		seen = set()
		for row in self.members:
			if row.user in seen:
				frappe.throw(f"User {row.user} is added more than once in the Members table.")
			seen.add(row.user)
