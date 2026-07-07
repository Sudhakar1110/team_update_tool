// Copyright (c) 2026, Your Company and contributors
// For license information, please see license.txt

frappe.ui.form.on("Team Project Update", {
	refresh: function (frm) {
		team_update_tool.show_viewer_banner(frm);

		if (frm.doc.github_repo_url) {
			frm.add_custom_button(__("Open GitHub Repo"), function () {
				window.open(frm.doc.github_repo_url, "_blank");
			});
		}

		if (frm.doc.live_demo_url) {
			frm.add_custom_button(__("Open Live Demo"), function () {
				window.open(frm.doc.live_demo_url, "_blank");
			});
		}

		frm.trigger("set_status_indicator");
	},

	set_status_indicator: function (frm) {
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
	},

	status: function (frm) {
		frm.trigger("set_status_indicator");
	},

	project_title: function (frm) {
		frm.set_df_property("project_title", "description", "");
	},
});
