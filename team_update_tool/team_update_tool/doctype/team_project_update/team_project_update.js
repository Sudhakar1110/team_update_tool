// Copyright (c) 2026, Your Company and contributors
// For license information, please see license.txt

frappe.ui.form.on("Team Project Update", {
	refresh: function (frm) {
		team_update_tool.show_viewer_banner(frm);
		team_update_tool.add_github_button(frm);
		team_update_tool.add_demo_button(frm);
		team_update_tool.set_status_indicator(frm);
	},

	status: function (frm) {
		team_update_tool.set_status_indicator(frm);
	},
});
