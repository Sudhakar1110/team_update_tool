# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import today, add_months


@frappe.whitelist()
def get_stats():
	"""Returns dashboard statistics for the SPA frontend."""
	total_projects = frappe.db.count("Team Project Update")
	completed = frappe.db.count("Team Project Update", {"status": "Approved"})
	in_progress = frappe.db.count("Team Project Update", {"status": "In Progress"})
	assigned = frappe.db.count("Team Project Update", {"status": "Assigned"})
	draft = frappe.db.count("Team Project Update", {"status": "Draft"})
	pending_review = frappe.db.count(
		"Team Project Update", {"status": ["in", ["Under Review", "Completed"]]}
	)
	rejected = frappe.db.count("Team Project Update", {"status": "Rejected"})
	total_teams = frappe.db.count("Team")
	active_teams = frappe.db.count("Team", {"is_active": 1})

	return {
		"total_projects": total_projects,
		"completed": completed,
		"in_progress": in_progress,
		"assigned": assigned,
		"draft": draft,
		"pending_review": pending_review,
		"rejected": rejected,
		"total_teams": total_teams,
		"active_teams": active_teams,
	}


@frappe.whitelist()
def get_chart_data():
	"""Returns chart data for the SPA dashboard."""
	# Project Status Distribution
	status_counts = frappe.db.sql(
		"""SELECT status, COUNT(*) as count
		FROM `tabTeam Project Update` GROUP BY status ORDER BY count DESC""",
		as_dict=1,
	)

	# Monthly Completed
	six_months_ago = add_months(today(), -6)
	monthly_completed = frappe.db.sql(
		"""SELECT DATE_FORMAT(COALESCE(completion_date, modified), '%%Y-%%m') as month,
			COUNT(*) as count
		FROM `tabTeam Project Update`
		WHERE status = 'Approved' AND COALESCE(completion_date, modified) >= %s
		GROUP BY month ORDER BY month ASC""",
		(six_months_ago,),
		as_dict=1,
	)

	# Team Performance
	team_performance = frappe.db.sql(
		"""SELECT team, COUNT(*) as count
		FROM `tabTeam Project Update` GROUP BY team ORDER BY count DESC LIMIT 10""",
		as_dict=1,
	)

	return {
		"status_counts": status_counts,
		"monthly_completed": monthly_completed,
		"team_performance": team_performance,
	}


@frappe.whitelist()
def get_recent_activity():
	"""Returns recent projects, notifications, and GitHub uploads."""
	recent_projects = frappe.get_all(
		"Team Project Update",
		fields=["name", "project_title", "status", "team", "progress_percent", "modified"],
		order_by="modified desc",
		limit=10,
	)

	notifications = frappe.get_all(
		"Notification Log",
		fields=["name", "subject", "creation", "document_name"],
		filters={"for_user": frappe.session.user},
		order_by="creation desc",
		limit=10,
	)

	github_projects = frappe.get_all(
		"Team Project Update",
		fields=["name", "project_title", "github_repo_url", "team", "modified"],
		filters={"github_repo_url": ["!=", ""]},
		order_by="modified desc",
		limit=8,
	)

	return {
		"recent_projects": recent_projects,
		"notifications": notifications,
		"github_projects": github_projects,
	}


@frappe.whitelist()
def get_user_info():
	"""Returns current user information."""
	user = frappe.session.user
	user_info = frappe.get_value("User", user, ["full_name", "email", "user_image"], as_dict=1)
	roles = frappe.get_roles(user)
	return {
		"name": user,
		"full_name": user_info.full_name if user_info else user,
		"email": user_info.email if user_info else "",
		"user_image": user_info.user_image if user_info else "",
		"roles": [r for r in roles if r not in ("All", "Guest", "System Manager")],
	}


@frappe.whitelist()
def get_dashboard_data():
	"""Returns all dashboard data including stats, charts, recent projects, notifications, teams."""
	user = frappe.session.user
	data = _get_stats_and_activities(user)
	data["charts"] = _get_chart_data()
	return data


def _get_stats_and_activities(user):
	"""Returns all non-chart dashboard data: stats, recent projects, notifications, teams."""
	# ── Stats ──
	total_projects = frappe.db.count("Team Project Update")
	completed = frappe.db.count("Team Project Update", {"status": "Approved"})
	in_progress = frappe.db.count("Team Project Update", {"status": "In Progress"})
	assigned = frappe.db.count("Team Project Update", {"status": "Assigned"})
	draft = frappe.db.count("Team Project Update", {"status": "Draft"})
	pending_review = frappe.db.count(
		"Team Project Update", {"status": ["in", ["Under Review", "Completed"]]}
	)
	rejected = frappe.db.count("Team Project Update", {"status": "Rejected"})
	total_teams = frappe.db.count("Team")
	active_teams = frappe.db.count("Team", {"is_active": 1})

	# Team Leaders (distinct team_lead from Team doctype)
	team_leaders = frappe.db.sql(
		"""SELECT COUNT(DISTINCT team_lead) FROM `tabTeam`
		WHERE team_lead IS NOT NULL AND team_lead != ''"""
	)[0][0] or 0

	# Team Members (count child table rows)
	team_members = frappe.db.count("Team Member")

	# ── Recent Projects (last 15) ──
	recent_projects = frappe.get_all(
		"Team Project Update",
		fields=[
			"name",
			"project_title",
			"status",
			"team",
			"priority",
			"progress_percent",
			"assigned_to",
			"assigned_team_leader",
			"project_owner",
			"modified",
		],
		order_by="modified desc",
		limit=15,
	)

	# ── User Notifications (last 10) ──
	notifications = frappe.get_all(
		"Notification Log",
		fields=["name", "subject", "creation", "document_name", "type"],
		filters={"for_user": user},
		order_by="creation desc",
		limit=10,
	)

	# ── Teams with project and member counts ──
	teams = frappe.get_all("Team", fields=["name", "team_name", "team_lead", "team_type", "is_active"])
	teams_data = []
	for t in teams:
		project_count = frappe.db.count("Team Project Update", {"team": t.name})
		member_count = frappe.db.count("Team Member", {"parent": t.name})
		teams_data.append(
			{
				"name": t.name,
				"team_name": t.team_name,
				"team_lead": t.team_lead,
				"team_type": t.team_type,
				"is_active": t.is_active,
				"project_count": project_count,
				"member_count": member_count,
			}
		)

	# Recent GitHub URLs (projects with GitHub links)
	github_projects = frappe.get_all(
		"Team Project Update",
		fields=["name", "project_title", "github_repo_url", "team", "modified"],
		filters={"github_repo_url": ["!=", ""]},
		order_by="modified desc",
		limit=8,
	)

	# Recent Screenshots (from child table)
	recent_screenshots = frappe.db.sql(
		"""SELECT ss.name, ss.screenshot, ss.caption, ss.parent as project_name,
			tpu.project_title, tpu.team
		FROM `tabProject Screenshot` ss
		INNER JOIN `tabTeam Project Update` tpu ON tpu.name = ss.parent
		WHERE ss.screenshot IS NOT NULL AND ss.screenshot != ''
		ORDER BY ss.creation DESC
		LIMIT 8""",
		as_dict=1,
	)

	# Recent File Uploads (from child table)
	recent_files = frappe.db.sql(
		"""SELECT pf.name, pf.file_attachment, pf.file_description, pf.parent as project_name,
			tpu.project_title
		FROM `tabProject File` pf
		INNER JOIN `tabTeam Project Update` tpu ON tpu.name = pf.parent
		WHERE pf.file_attachment IS NOT NULL AND pf.file_attachment != ''
		ORDER BY pf.creation DESC
		LIMIT 8""",
		as_dict=1,
	)

	return {
		"stats": {
			"total_projects": total_projects,
			"completed": completed,
			"in_progress": in_progress,
			"assigned": assigned,
			"draft": draft,
			"pending_review": pending_review,
			"rejected": rejected,
			"total_teams": total_teams,
			"active_teams": active_teams,
			"team_leaders": team_leaders,
			"team_members": team_members,
		},
		"recent_projects": recent_projects,
		"notifications": notifications,
		"teams": teams_data,
		"github_projects": github_projects,
		"recent_screenshots": recent_screenshots,
		"recent_files": recent_files,
	}


def _get_chart_data():
	"""Returns data for all dashboard charts (internal helper, not whitelisted directly)."""
	# ── 1. Project Status Distribution (Donut) ──
	status_counts = frappe.db.sql(
		"""SELECT status, COUNT(*) as count
		FROM `tabTeam Project Update`
		GROUP BY status
		ORDER BY count DESC""",
		as_dict=1,
	)

	# ── 2. Monthly Completed Projects (Bar - last 6 months) ──
	six_months_ago = add_months(today(), -6)
	monthly_completed = frappe.db.sql(
		"""SELECT DATE_FORMAT(COALESCE(completion_date, modified), '%%Y-%%m') as month,
			COUNT(*) as count
		FROM `tabTeam Project Update`
		WHERE status = 'Approved'
			AND COALESCE(completion_date, modified) >= %s
		GROUP BY month
		ORDER BY month ASC""",
		(six_months_ago,),
		as_dict=1,
	)

	# ── 3. Team Performance (tasks per team - Bar) ──
	team_performance = frappe.db.sql(
		"""SELECT team, COUNT(*) as count
		FROM `tabTeam Project Update`
		GROUP BY team
		ORDER BY count DESC
		LIMIT 10""",
		as_dict=1,
	)

	# ── 4. Task Progress Distribution (Percentage) ──
	progress_ranges = frappe.db.sql(
		"""SELECT
			CASE
				WHEN progress_percent = 0 THEN 'Not Started'
				WHEN progress_percent <= 25 THEN '0-25%'
				WHEN progress_percent <= 50 THEN '26-50%'
				WHEN progress_percent <= 75 THEN '51-75%'
				WHEN progress_percent < 100 THEN '76-99%'
				WHEN progress_percent = 100 THEN '100%'
			END as `range`,
			COUNT(*) as count
		FROM `tabTeam Project Update`
		GROUP BY `range`
		ORDER BY FIELD(`range`, 'Not Started', '0-25%', '26-50%', '51-75%', '76-99%', '100%')""",
		as_dict=1,
	)

	return {
		"status_counts": status_counts,
		"monthly_completed": monthly_completed,
		"team_performance": team_performance,
		"progress_ranges": progress_ranges,
	}

