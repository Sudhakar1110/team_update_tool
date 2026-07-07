// Team Update Tool - global client side helpers

frappe.provide("team_update_tool");

/**
 * Shows a small "read only" banner on forms for users who only
 * hold the "Team Update Viewer" role, as a friendly visual reminder
 * that the record cannot be edited (actual enforcement is done via
 * DocType permissions on the server).
 */
team_update_tool.show_viewer_banner = function (frm) {
	const roles = frappe.user_roles || [];
	const is_admin = roles.includes("Team Update Admin") || roles.includes("System Manager");
	const is_viewer = roles.includes("Team Update Viewer");

	if (is_viewer && !is_admin) {
		frm.dashboard.set_headline_alert(
			'<div class="tut-readonly-banner">👁 View Only Access - Editing is disabled for your role</div>'
		);
		frm.disable_form();
	}
};

/**
 * Adds a "View on GitHub" button to project forms that have a repo URL.
 */
team_update_tool.add_github_button = function (frm) {
	if (frm.doc.github_repo_url && !frm.is_new()) {
		frm.add_custom_button(__("Open GitHub Repo"), function () {
			window.open(frm.doc.github_repo_url, "_blank");
		}, __("View"));
	}
};

/**
 * Adds a "View Live Demo" button to project forms that have a demo URL.
 */
team_update_tool.add_demo_button = function (frm) {
	if (frm.doc.live_demo_url && !frm.is_new()) {
		frm.add_custom_button(__("Open Live Demo"), function () {
			window.open(frm.doc.live_demo_url, "_blank");
		}, __("View"));
	}
};

/**
 * Sets the status indicator color on the form.
 */
team_update_tool.set_status_indicator = function (frm) {
	const colors = {
		Draft: "grey",
		"In Progress": "orange",
		Completed: "green",
		"On Hold": "red",
		Approved: "blue",
	};
	if (frm.doc.status) {
		frm.page.set_indicator(frm.doc.status, colors[frm.doc.status] || "grey");
	}
};
