# Copyright (c) 2026, Your Company and contributors
# For license information, please see license.txt

"""
Demo Data Seeding Script for Team Update Tool.

Run this script on your Frappe site to create sample demo data
including users, teams, and tasks in various workflow stages.

How to run:
    bench --site yoursite execute team_update_tool.demo.seed_demo_data

Or via console:
    bench --site yoursite console
    >>> import team_update_tool.demo
    >>> team_update_tool.demo.seed_demo_data()
"""

import frappe
from frappe.utils import today, add_days


def seed_demo_data():
	"""Main function to seed all demo data."""
	print("=" * 60)
	print("Seeding Demo Data for Team Update Tool...")
	print("=" * 60)

	create_demo_users()
	create_demo_team()
	create_demo_tasks()

	print("\n✅ Demo data seeding complete!")
	print("\nUsers created:")
	print("  admin@demo.com → Team Update Admin")
	print("  leader@demo.com → Team Update Team Leader")
	print("  member@demo.com → Team Update Team Member")
	print("  viewer@demo.com → Team Update Viewer")
	print("\nTeam created: Development Team")
	print("Tasks created: 3 (In Progress, Completed, Approved)")
	print("\n📋 Next steps:")
	print("  1. Login as different users to see role-based views")
	print("  2. Try the full workflow (see SOP.md section 19)")
	print("=" * 60)


def create_demo_users():
	"""Create 4 demo users with different roles."""
	print("\n1. Creating demo users...")

	users_data = [
		{
			"email": "admin@demo.com",
			"first_name": "Admin",
			"last_name": "User",
			"role": "Team Update Admin",
			"send_welcome_email": 0,
		},
		{
			"email": "leader@demo.com",
			"first_name": "Team",
			"last_name": "Leader",
			"role": "Team Update Team Leader",
			"send_welcome_email": 0,
		},
		{
			"email": "member@demo.com",
			"first_name": "Team",
			"last_name": "Member",
			"role": "Team Update Team Member",
			"send_welcome_email": 0,
		},
		{
			"email": "viewer@demo.com",
			"first_name": "Viewer",
			"last_name": "User",
			"role": "Team Update Viewer",
			"send_welcome_email": 0,
		},
	]

	for ud in users_data:
		if frappe.db.exists("User", ud["email"]):
			print(f"  ⏭️  User {ud['email']} already exists, skipping...")
			continue

		user = frappe.get_doc(
			{
				"doctype": "User",
				"email": ud["email"],
				"first_name": ud["first_name"],
				"last_name": ud["last_name"],
				"send_welcome_email": ud["send_welcome_email"],
				"roles": [{"role": ud["role"]}],
			}
		)
		user.insert(ignore_permissions=True)
		print(f"  ✅ Created user: {ud['email']} → {ud['role']}")

	frappe.db.commit()


def create_demo_team():
	"""Create a sample team with members."""
	print("\n2. Creating demo team...")

	if frappe.db.exists("Team", "Development Team"):
		print("  ⏭️  Team 'Development Team' already exists, skipping...")
		return

	team = frappe.get_doc(
		{
			"doctype": "Team",
			"team_name": "Development Team",
			"team_type": "Development",
			"team_lead": "leader@demo.com",
			"is_active": 1,
			"description": "Sample development team for demo purposes",
			"members": [
				{"user": "leader@demo.com", "role_in_team": "Team Lead"},
				{"user": "member@demo.com", "role_in_team": "Full Stack Developer"},
			],
		}
	)
	team.insert(ignore_permissions=True)
	print("  ✅ Created team: Development Team")
	frappe.db.commit()


def create_demo_tasks():
	"""Create sample tasks in different workflow stages."""
	print("\n3. Creating demo tasks...")

	tasks_data = [
		{
			"project_title": "Customer Dashboard Enhancement",
			"team": "Development Team",
			"project_owner": "admin@demo.com",
			"status": "In Progress",
			"priority": "High",
			"assigned_team_leader": "leader@demo.com",
			"assigned_by_admin": 1,
			"assigned_to": "member@demo.com",
			"assigned_by_team_leader": 1,
			"progress_percent": 60,
			"start_date": add_days(today(), -10),
			"due_date": add_days(today(), 5),
			"project_description": "<p>Enhancing the customer dashboard with new charts, filters, and export functionality. Building interactive data visualizations using Chart.js.</p>",
			"github_repo_url": "https://github.com/demo-org/customer-dashboard",
			"tags": "dashboard, UI, charts",
			"team_leader_review_status": "Pending Review",
		},
		{
			"project_title": "REST API Integration Module",
			"team": "Development Team",
			"project_owner": "admin@demo.com",
			"status": "Completed",
			"priority": "Urgent",
			"assigned_team_leader": "leader@demo.com",
			"assigned_by_admin": 1,
			"assigned_to": "member@demo.com",
			"assigned_by_team_leader": 1,
			"progress_percent": 100,
			"start_date": add_days(today(), -20),
			"completion_date": add_days(today(), -2),
			"project_description": "<p>Built a complete REST API integration module connecting our ERPNext system with third-party payment gateway. Includes webhooks, error handling, and logging.</p>",
			"github_repo_url": "https://github.com/demo-org/api-payment-module",
			"live_demo_url": "https://demo-api.example.com/docs",
			"tags": "API, payment, integration",
			"team_leader_review_status": "Reviewed",
			"team_leader_review_date": add_days(today(), -2),
			"team_leader_review_remarks": "All endpoints tested and working. Documentation is comprehensive.",
		},
		{
			"project_title": "Mobile App - User Profile Screen",
			"team": "Development Team",
			"project_owner": "admin@demo.com",
			"status": "Approved",
			"priority": "Medium",
			"assigned_team_leader": "leader@demo.com",
			"assigned_by_admin": 1,
			"assigned_to": "member@demo.com",
			"assigned_by_team_leader": 1,
			"progress_percent": 100,
			"start_date": add_days(today(), -30),
			"completion_date": add_days(today(), -10),
			"project_description": "<p>Designed and developed the user profile screen for our mobile application. Features include avatar upload, bio editing, notification preferences, and account settings.</p>",
			"github_repo_url": "https://github.com/demo-org/mobile-app-profile",
			"live_demo_url": "https://demo-mobile.example.com/profile",
			"tags": "mobile, UI, profile",
			"team_leader_review_status": "Reviewed",
			"team_leader_review_date": add_days(today(), -10),
			"team_leader_review_remarks": "Excellent work! UI matches the design spec perfectly.",
			"reviewed_by": "leader@demo.com",
			"approved_by": "admin@demo.com",
			"approval_date": add_days(today(), -9),
			"review_remarks": "Approved. Great work by the team!",
		},
	]

	created_count = 0
	for td in tasks_data:
		# Check if task already exists
		if frappe.db.exists("Team Project Update", {"project_title": td["project_title"]}):
			print(f"  ⏭️  Task '{td['project_title']}' already exists, skipping...")
			continue

		task = frappe.get_doc(
			{
				"doctype": "Team Project Update",
				**td,
			}
		)
		task.insert(ignore_permissions=True)
		created_count += 1
		print(f"  ✅ Created task: {td['project_title']} → Status: {td['status']}")

	if created_count > 0:
		frappe.db.commit()
