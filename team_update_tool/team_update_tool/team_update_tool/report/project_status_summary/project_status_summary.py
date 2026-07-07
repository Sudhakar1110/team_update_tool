# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	filters = filters or {}
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{"label": _("Team"), "fieldname": "team", "fieldtype": "Link", "options": "Team", "width": 180},
		{"label": _("Total Projects"), "fieldname": "total", "fieldtype": "Int", "width": 120},
		{"label": _("Draft"), "fieldname": "draft", "fieldtype": "Int", "width": 90},
		{"label": _("In Progress"), "fieldname": "in_progress", "fieldtype": "Int", "width": 100},
		{"label": _("Completed"), "fieldname": "completed", "fieldtype": "Int", "width": 100},
		{"label": _("On Hold"), "fieldname": "on_hold", "fieldtype": "Int", "width": 90},
		{"label": _("Approved"), "fieldname": "approved", "fieldtype": "Int", "width": 90},
	]


def get_data(filters):
	conditions = []
	values = {}

	if filters.get("team"):
		conditions.append("team = %(team)s")
		values["team"] = filters.get("team")

	if filters.get("from_date"):
		conditions.append("completion_date >= %(from_date)s")
		values["from_date"] = filters.get("from_date")

	if filters.get("to_date"):
		conditions.append("completion_date <= %(to_date)s")
		values["to_date"] = filters.get("to_date")

	where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

	rows = frappe.db.sql(
		f"""
		SELECT
			team,
			status,
			COUNT(name) as count
		FROM `tabTeam Project Update`
		{where_clause}
		GROUP BY team, status
		""",
		values,
		as_dict=True,
	)

	summary = {}
	for row in rows:
		team = row.team
		if team not in summary:
			summary[team] = {
				"team": team,
				"total": 0,
				"draft": 0,
				"in_progress": 0,
				"completed": 0,
				"on_hold": 0,
				"approved": 0,
			}
		key_map = {
			"Draft": "draft",
			"In Progress": "in_progress",
			"Completed": "completed",
			"On Hold": "on_hold",
			"Approved": "approved",
		}
		field = key_map.get(row.status)
		if field:
			summary[team][field] += row.count
		summary[team]["total"] += row.count

	return list(summary.values())
