// Team Update Tool — Complete Client-side JavaScript

frappe.provide("team_update_tool");

// ==============================
// Desk: View-Only Banner
// ==============================

team_update_tool.show_viewer_banner = function (frm) {
	const roles = frappe.user_roles || [];
	const is_admin = roles.includes("Admin") || roles.includes("System Manager");
	const is_viewer = roles.includes("View-Only User");

	if (is_viewer && !is_admin) {
		frm.dashboard.set_headline_alert(
			'<div class="tut-readonly-banner">👁 View Only Access — You cannot create, edit, or delete records</div>'
		);
		frm.disable_form();
	}
};

// ==============================
// Website: Navigation Enhancement
// ==============================

frappe.ready(function() {
	// Add active class to current page link in web navigation
	const path = window.location.pathname;
	document.querySelectorAll('.navbar-nav a, .web-sidebar a').forEach(function(link) {
		if (link.getAttribute('href') === path) {
			link.classList.add('active');
		}
	});

	// Auto-dismiss form messages after 5 seconds
	document.querySelectorAll('.tut-form-success, .tut-form-error').forEach(function(el) {
		if (el.style.display !== 'none') {
			setTimeout(function() {
				el.style.opacity = '0';
				el.style.transition = 'opacity 0.5s ease';
				setTimeout(function() { el.style.display = 'none'; }, 500);
			}, 5000);
		}
	});
});
