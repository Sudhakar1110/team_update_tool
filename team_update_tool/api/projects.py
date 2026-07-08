# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

import frappe
from frappe import _


@frappe.whitelist()
def get_projects(status=None, category=None, team=None, limit=20, offset=0):
	"""Get list of projects with optional filters."""
	filters = {}
	if status:
		filters["status"] = status
	if category:
		filters["project_category"] = category
	if team:
		filters["team"] = team

	# View-Only Users only see approved projects
	roles = frappe.get_roles(frappe.session.user)
	if "View-Only User" in roles and "Admin" not in roles:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			filters["status"] = approved

	projects = frappe.get_all("Project",
		filters=filters,
		fields=["name", "project_title", "status", "team", "priority",
				"project_category", "creation", "start_date", "completion_date"],
		limit=limit,
		start=offset,
		order_by="modified desc"
	)

	# Enrich with status names
	for p in projects:
		if p.status:
			status_doc = frappe.get_cached_doc("Project Status", p.status)
			p.status_name = status_doc.status_name
			p.status_color = status_doc.color
		if p.project_category:
			cat = frappe.get_cached_doc("Project Category", p.project_category)
			p.category_name = cat.category_name

	total = frappe.db.count("Project", filters=filters)

	return {
		"projects": projects,
		"total": total,
		"limit": limit,
		"offset": offset,
	}


@frappe.whitelist()
def get_project_detail(name):
	"""Get full project details including all child tables."""
	if not name:
		frappe.throw(_("Project name is required."))

	project = frappe.get_doc("Project", name)

	# Permission check for View-Only Users
	roles = frappe.get_roles(frappe.session.user)
	if "View-Only User" in roles:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		can_view = (approved and project.status == approved) or "Admin" in roles or "System Manager" in roles
		if not can_view:
			frappe.throw(_("You do not have permission to view this project."), frappe.PermissionError)

	# Get screenshots with full image URLs
	screenshots = []
	for s in project.screenshots or []:
		screenshots.append({
			"screenshot": s.screenshot,
			"caption": s.caption,
			"screenshot_type": s.screenshot_type,
		})

	# Get files
	files = []
	for f in project.project_files or []:
		files.append({
			"file": f.file,
			"file_name": f.file_name,
			"file_type": f.file_type,
			"description": f.file_description,
		})

	# Get updates
	updates = []
	for u in project.project_updates or []:
		updates.append({
			"name": u.name,
			"update_title": u.update_title,
			"update_description": u.update_description,
			"update_date": u.update_date,
			"updated_by": u.updated_by,
		})

	# Get technologies
	technologies = [t.technology for t in project.technologies or []]

	# Get status info
	status_info = {}
	if project.status:
		status_doc = frappe.get_cached_doc("Project Status", project.status)
		status_info = {
			"name": status_doc.name,
			"status_name": status_doc.status_name,
			"color": status_doc.color,
		}

	return {
		"name": project.name,
		"project_title": project.title,
		"status": status_info,
		"team": project.team,
		"priority": project.priority,
		"project_category": project.project_category,
		"description": project.description,
		"tags": project.tags,
		"github_repository": project.github_repository,
		"start_date": project.start_date,
		"due_date": project.due_date,
		"completion_date": project.completion_date,
		"approved_by": project.approved_by,
		"approval_date": project.approval_date,
		"review_remarks": project.review_remarks,
		"creation": str(project.creation),
		"owner": project.owner,
		"screenshots": screenshots,
		"files": files,
		"updates": updates,
		"technologies": technologies,
	}


@frappe.whitelist()
def create_project(project_title, team, status=None, project_category=None,
				   priority="Medium", description=None, tags=None,
				   start_date=None, due_date=None, github_repository=None):
	"""Create a new project from the website."""
	roles = frappe.get_roles(frappe.session.user)
	if "View-Only User" in roles and "Admin" not in roles:
		frappe.throw(_("You do not have permission to create projects."), frappe.PermissionError)

	if not project_title:
		frappe.throw(_("Project title is required."))
	if not team:
		frappe.throw(_("Team is required."))

	# Auto-set status if not provided
	if not status:
		submitted = frappe.db.get_value("Project Status", {"status_name": "Submitted"}, "name")
		if submitted:
			status = submitted

	project = frappe.get_doc({
		"doctype": "Project",
		"project_title": project_title,
		"team": team,
		"status": status or "",
		"project_category": project_category or "",
		"priority": priority,
		"description": description or "",
		"tags": tags or "",
		"start_date": start_date or None,
		"due_date": due_date or None,
		"github_repository": github_repository or "",
	})

	project.insert(ignore_permissions=False)

	return {
		"message": _("Project created successfully."),
		"name": project.name,
		"route": f"/team_update_tool/project?name={project.name}",
	}


@frappe.whitelist()
def update_project_status(name, status):
	"""Update project status (for team members submitting updates)."""
	if not name or not status:
		frappe.throw(_("Project name and status are required."))

	roles = frappe.get_roles(frappe.session.user)
	is_admin = "Admin" in roles or "System Manager" in roles

	project = frappe.get_doc("Project", name)

	# Non-admins can only update their own projects
	if not is_admin and project.owner != frappe.session.user:
		frappe.throw(_("You can only update your own projects."), frappe.PermissionError)

	project.status = status
	project.save(ignore_permissions=is_admin)

	return {
		"message": _("Project status updated successfully."),
		"name": project.name,
		"status": project.status,
	}


@frappe.whitelist()
def add_project_update(name, update_title, update_description=None, status=None):
	"""Add a project update from the website."""
	if not name or not update_title:
		frappe.throw(_("Project name and update title are required."))

	project = frappe.get_doc("Project", name)

	roles = frappe.get_roles(frappe.session.user)
	is_admin = "Admin" in roles or "System Manager" in roles

	if not is_admin and project.owner != frappe.session.user:
		frappe.throw(_("You can only update your own projects."), frappe.PermissionError)

	update = project.append("project_updates", {
		"update_title": update_title,
		"update_description": update_description or "",
		"update_date": frappe.utils.today(),
		"updated_by": frappe.session.user,
	})

	project.save(ignore_permissions=is_admin)

	return {
		"message": _("Project update added successfully."),
		"update_name": update.name,
	}


@frappe.whitelist()
def get_dashboard_stats():
	"""Get dashboard statistics for the website."""
	roles = frappe.get_roles(frappe.session.user)
	is_admin = "Admin" in roles or "System Manager" in roles
	is_viewer = "View-Only User" in roles and not is_admin

	base_filters = {}
	if is_viewer:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			base_filters["status"] = approved

	total_projects = frappe.db.count("Project", filters=base_filters)

	# Status counts
	status_counts = {}
	statuses = frappe.get_all("Project Status", pluck="name")
	for s in statuses:
		f = {**base_filters, "status": s}
		count = frappe.db.count("Project", filters=f)
		if count:
			status_doc = frappe.get_cached_doc("Project Status", s)
			status_counts[status_doc.status_name] = {
				"count": count,
				"color": status_doc.color,
			}

	# Category counts
	category_counts = {}
	categories = frappe.get_all("Project Category", pluck="name")
	for c in categories:
		f = {**base_filters, "project_category": c}
		count = frappe.db.count("Project", filters=f)
		if count:
			cat_doc = frappe.get_cached_doc("Project Category", c)
			category_counts[cat_doc.category_name] = count

	# Recent projects
	filters = {}
	if is_viewer:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			filters["status"] = approved

	recent = frappe.get_all("Project",
		filters=filters,
		fields=["name", "project_title", "status", "creation"],
		limit=5,
		order_by="creation desc"
	)

	# Total teams and technologies
	total_teams = frappe.db.count("Team", filters={"is_active": 1})
	total_technologies = frappe.db.count("Technology")

	# User's own projects count (for logged-in users)
	my_projects = 0
	if frappe.session.user != "Guest" and not is_viewer:
		my_projects = frappe.db.count("Project", filters={"owner": frappe.session.user})

	return {
		"total_projects": total_projects,
		"total_teams": total_teams,
		"total_technologies": total_technologies,
		"my_projects": my_projects,
		"status_counts": status_counts,
		"category_counts": category_counts,
		"recent_projects": recent,
	}


@frappe.whitelist()
def get_projects_for_user(user=None):
	"""Get projects owned by a specific user (for My Projects page)."""
	if not user:
		user = frappe.session.user

	if user == "Guest":
		frappe.throw(_("Please login to view your projects."))

	projects = frappe.get_all("Project",
		filters={"owner": user},
		fields=["name", "project_title", "status", "team", "priority",
				"project_category", "creation", "completion_date"],
		order_by="modified desc"
	)

	for p in projects:
		if p.status:
			status_doc = frappe.get_cached_doc("Project Status", p.status)
			p.status_name = status_doc.status_name
			p.status_color = status_doc.color

	return projects


@frappe.whitelist()
def get_repositories(limit=20, offset=0):
	"""Get GitHub repositories."""
	repos = frappe.get_all("GitHub Repository",
		fields=["name", "repository_url", "repository_name", "commit_hash",
				"default_branch", "languages", "creation"],
		limit=limit,
		start=offset,
		order_by="modified desc"
	)

	total = frappe.db.count("GitHub Repository")

	return {
		"repositories": repos,
		"total": total,
	}


@frappe.whitelist()
def get_gallery(limit=30, offset=0):
	"""Get all screenshots from approved projects for the gallery."""
	roles = frappe.get_roles(frappe.session.user)
	is_viewer = "View-Only User" in roles and "Admin" not in roles

	# Get projects that are visible
	project_filters = {}
	if is_viewer:
		approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")
		if approved:
			project_filters["status"] = approved

	projects = frappe.get_all("Project",
		filters=project_filters,
		pluck="name"
	)

	if not projects:
		return {"screenshots": [], "total": 0}

	# Get screenshots from all visible projects
	# Since screenshots is a child table, we need to query them via parent
	all_screenshots = []
	for project_name in projects:
		project = frappe.get_cached_doc("Project", project_name)
		for s in project.screenshots or []:
			all_screenshots.append({
				"screenshot": s.screenshot,
				"caption": s.caption or "",
				"screenshot_type": s.screenshot_type or "",
				"project": project_name,
				"project_title": project.title,
			})

	# Sort by modified (most recent first)
	all_screenshots.reverse()

	total = len(all_screenshots)
	limited = all_screenshots[offset:offset + limit]

	return {
		"screenshots": limited,
		"total": total,
	}


@frappe.whitelist(allow_guest=True)
def get_public_data():
	"""Get public data for the home page (no login required)."""
	approved = frappe.db.get_value("Project Status", {"status_name": "Approved"}, "name")

	filters = {}
	if approved:
		filters["status"] = approved

	# Stats
	total_projects = frappe.db.count("Project", filters=filters)
	total_teams = frappe.db.count("Team", filters={"is_active": 1})
	total_technologies = frappe.db.count("Technology")

	# Featured projects (recent approved)
	featured = frappe.get_all("Project",
		filters=filters,
		fields=["name", "project_title", "status", "team", "project_category", "creation"],
		limit=6,
		order_by="creation desc"
	)

	# Categories
	categories = frappe.get_all("Project Category",
		fields=["name", "category_name", "description"]
	)

	# Technologies
	technologies = frappe.get_all("Technology",
		fields=["name", "technology_name", "description"]
	)

	return {
		"total_projects": total_projects,
		"total_teams": total_teams,
		"total_technologies": total_technologies,
		"featured_projects": featured,
		"categories": categories,
		"technologies": technologies,
	}
