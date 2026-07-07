// Team Update Dashboard - Professional Frappe Desk Page
// Renders at /app/team_update_dashboard
// UI redesign: 12-column grid, equal cards, sectioned layout, responsive

frappe.pages['team_update_dashboard'].on_page_load = function (wrapper) {
	try {
		console.debug('Team Update Dashboard: on_page_load started');

		var page = frappe.ui.make_app_page({
			parent: wrapper,
			title: __('Team Update Dashboard'),
			single_column: true,
		});

		// Build layout: sidebar + main content
		$(wrapper).find('.page-content').html(
			'<div class="tut-desk-dashboard">' +
				'<div class="tut-sidebar-menu" id="tut-sidebar"></div>' +
				'<div class="tut-dashboard-main" id="tut-dashboard-main"></div>' +
			'</div>'
		);

		render_sidebar();
		setup_header_actions(page);

		// Show loading
		$('#tut-dashboard-main').html(
			'<div class="tut-dashboard-loading text-center" style="padding:80px 0;">' +
				'<div class="spinner-border text-muted" role="status">' +
					'<span class="visually-hidden">Loading...</span>' +
				'</div>' +
				'<p class="text-muted mt-2" style="font-size:14px;">Loading Dashboard...</p>' +
			'</div>'
		);

		// Fetch data
		frappe.call({
			method:
				'team_update_tool.team_update_tool.page.team_update_dashboard.team_update_dashboard.get_dashboard_data',
			callback: function (r) {
				if (r.message) {
					console.debug('Team Update Dashboard: data loaded');
					var $main = $('#tut-dashboard-main');
					$main.empty();
					render_dashboard($main, r.message);
					if (r.message.charts) {
						render_charts($main, r.message.charts);
					}
				} else {
					$('#tut-dashboard-main').html(show_error_html('Empty response from server.'));
				}
			},
			error: function (err) {
				console.error('Team Update Dashboard: API error', err);
				$('#tut-dashboard-main').html(show_error_html('Failed to load dashboard data.'));
			},
		});
	} catch (e) {
		console.error('Team Update Dashboard: on_page_load error', e);
		$(wrapper).html(
			'<div class="alert alert-danger" style="margin:20px;">' +
				'<h4>Dashboard Failed to Load</h4>' +
				'<p>' + frappe.utils.escape_html(e.message || e) + '</p>' +
			'</div>'
		);
	}
};

function show_error_html(msg) {
	return '<div class="alert alert-danger" style="margin:20px;"><h4>Dashboard Error</h4><p>' + frappe.utils.escape_html(msg) + '</p></div>';
}

// ══════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════

function render_sidebar() {
	var sections = [
		{
			title: 'Overview',
			items: [
				{ label: 'Dashboard', icon: 'home', route: '/app/team_update_dashboard', active: true },
			],
		},
		{
			title: 'Core',
			items: [
				{ label: 'All Tasks', icon: 'list', route: '/app/team-project-update' },
				{ label: 'New Task', icon: 'plus', route: '/app/team-project-update/new-task' },
				{ label: 'Teams', icon: 'people', route: '/app/team' },
			],
		},
		{
			title: 'Activity',
			items: [
				{ label: 'GitHub', icon: 'mark-github', route: '/app/team-project-update' },
				{ label: 'Screenshots', icon: 'image', route: '/app/team-project-update' },
				{ label: 'Documents', icon: 'file', route: '/app/team-project-update' },
			],
		},
		{
			title: 'Reports',
			items: [
				{ label: 'Project Status', icon: 'chart', route: '/app/query-report/Project%20Status%20Summary' },
			],
		},
		{
			title: 'Settings',
			items: [
				{ label: 'Notifications', icon: 'bell', route: '/app/notification-log' },
				{ label: 'Settings', icon: 'settings', route: '/app/team-update-settings' },
			],
		},
	];

	var $sidebar = $('#tut-sidebar');
	sections.forEach(function (sec) {
		var $sec = $('<div class="tut-sidebar-section"></div>');
		$sec.append('<div class="tut-sidebar-title">' + sec.title + '</div>');
		sec.items.forEach(function (item) {
			$sec.append(
				'<a class="tut-sidebar-item' + (item.active ? ' active' : '') + '" href="' + item.route + '">' +
					frappe.utils.icon(item.icon, 'sm') + ' ' + item.label +
				'</a>'
			);
		});
		$sidebar.append($sec);
	});
}

// ══════════════════════════════════════════════════════════
// HEADER ACTIONS
// ══════════════════════════════════════════════════════════

function setup_header_actions(page) {
	page.add_inner_button(__('New Task'), function () { frappe.new_doc('Team Project Update'); }, __('Actions'));
	page.add_inner_button(__('All Projects'), function () { frappe.set_route('list', 'Team Project Update'); }, __('Actions'));
	page.add_inner_button(__('Teams'), function () { frappe.set_route('list', 'Team'); }, __('Actions'));
	page.add_inner_button(__('Report'), function () { frappe.set_route('query-report', 'Project Status Summary'); }, __('Actions'));
}

// ══════════════════════════════════════════════════════════
// DASHBOARD RENDERER
// ══════════════════════════════════════════════════════════

function render_dashboard($main, data) {
	var $d = $('<div class="tut-dashboard-container"></div>');

	// 1. Welcome Banner
	$d.append(render_welcome(data.stats));

	// 2. Quick Actions
	$d.append(render_quick_actions());

	// 3. Stats Grid
	$d.append(section_header('Dashboard Overview', ''));
	$d.append(render_stats_row(data.stats));

	// 4. Charts placeholder
	$d.append('<div class="tut-charts-row" id="tut-charts-row" style="margin-bottom:20px;"></div>');

	// 5. Two-column content: Projects + Teams
	var $grid = $('<div class="tut-content-grid"></div>');
	if (data.recent_projects && data.recent_projects.length) {
		$grid.append(render_recent_projects(data.recent_projects));
	}
	if (data.teams && data.teams.length) {
		$grid.append(render_teams_table(data.teams));
	}
	$d.append($grid);

	// 6. Two-column: GitHub + Screenshots + Documents
	var $grid2 = $('<div class="tut-content-grid"></div>');
	if (data.github_projects && data.github_projects.length) {
		$grid2.append(render_github_projects(data.github_projects));
	}
	if (data.recent_screenshots && data.recent_screenshots.length) {
		$grid2.append(render_recent_screenshots(data.recent_screenshots));
	}
	if (data.recent_files && data.recent_files.length) {
		$grid2.append(render_recent_files(data.recent_files));
	}
	if ($grid2.children().length) {
		$d.append($grid2);
	}

	// 7. Notifications
	if (data.notifications && data.notifications.length) {
		$d.append(render_notifications(data.notifications));
	}

	// 8. Empty state
	if (!data.recent_projects || !data.recent_projects.length) {
		$d.append(render_empty_state());
	}

	$main.append($d);
}

// ══════════════════════════════════════════════════════════
// WELCOME BANNER
// ══════════════════════════════════════════════════════════

function render_welcome(stats) {
	var name = frappe.user.full_name(frappe.session.user) || 'User';
	return '' +
		'<div class="tut-welcome-banner">' +
			'<div class="tut-welcome-text">' +
				'<h3>Welcome back, ' + frappe.utils.escape_html(name) + ' 👋</h3>' +
				'<p>You have <strong>' + (stats.pending_review || 0) + '</strong> items pending review and <strong>' + (stats.in_progress || 0) + '</strong> in progress.</p>' +
			'</div>' +
			'<div class="tut-welcome-actions">' +
				'<button class="tut-btn tut-btn-primary" onclick="frappe.new_doc(\'Team Project Update\')">' +
					frappe.utils.icon('plus', 'sm') + ' New Task' +
				'</button>' +
				'<button class="tut-btn" onclick="frappe.set_route(\'list\', \'Team Project Update\')">View All</button>' +
			'</div>' +
		'</div>';
}

// ══════════════════════════════════════════════════════════
// SECTION HEADER HELPER
// ══════════════════════════════════════════════════════════

function section_header(title, link) {
	var link_html = link ? '<a href="' + link + '">View All</a>' : '';
	return '<div class="tut-section-header-compact"><h3>' + title + '</h3>' + link_html + '</div>';
}

// ══════════════════════════════════════════════════════════
// QUICK ACTIONS
// ══════════════════════════════════════════════════════════

function render_quick_actions() {
	var actions = [
		{ key: 'new_task', label: 'New Task', icon: 'plus' },
		{ key: 'all_tasks', label: 'All Tasks', icon: 'list' },
		{ key: 'teams', label: 'Teams', icon: 'people' },
		{ key: 'report', label: 'Status Report', icon: 'chart' },
		{ key: 'settings', label: 'Settings', icon: 'settings' },
	];
	var action_map = {
		new_task: function () { frappe.new_doc('Team Project Update'); },
		all_tasks: function () { frappe.set_route('list', 'Team Project Update'); },
		teams: function () { frappe.set_route('list', 'Team'); },
		report: function () { frappe.set_route('query-report', 'Project Status Summary'); },
		settings: function () { frappe.set_route('Form', 'Team Update Settings'); },
	};
	var $wrap = $('<div class="tut-quick-actions"></div>');
	actions.forEach(function (a) {
		var $btn = $(
			'<button class="tut-quick-btn">' +
				frappe.utils.icon(a.icon, 'sm') + ' ' + a.label +
			'</button>'
		);
		$btn.click(action_map[a.key]);
		$wrap.append($btn);
	});
	return $wrap;
}

// ══════════════════════════════════════════════════════════
// STATS CARDS
// ══════════════════════════════════════════════════════════

function render_stats_row(stats) {
	var cards = [
		{ label: 'Total Projects', value: stats.total_projects || 0, icon: '📊', color: 'tut-stat-blue' },
		{ label: 'Completed', value: stats.completed || 0, icon: '✅', color: 'tut-stat-green' },
		{ label: 'In Progress', value: stats.in_progress || 0, icon: '🔄', color: 'tut-stat-orange' },
		{ label: 'Pending Review', value: stats.pending_review || 0, icon: '📋', color: 'tut-stat-red' },
		{ label: 'Rejected', value: stats.rejected || 0, icon: '❌', color: 'tut-stat-red' },
		{ label: 'Active Teams', value: stats.active_teams || 0, icon: '👥', color: 'tut-stat-purple' },
		{ label: 'Team Leaders', value: stats.team_leaders || 0, icon: '👤', color: 'tut-stat-blue' },
		{ label: 'Team Members', value: stats.team_members || 0, icon: '👥', color: 'tut-stat-purple' },
		{ label: 'All Teams', value: stats.total_teams || 0, icon: '🏢', color: 'tut-stat-blue' },
		{ label: 'Assigned', value: stats.assigned || 0, icon: '📌', color: 'tut-stat-orange' },
	];

	var $grid = $('<div class="tut-stats-grid"></div>');
	cards.forEach(function (card) {
		$grid.append(
			'<div class="tut-stat-card ' + card.color + '">' +
				'<div class="tut-stat-icon">' + card.icon + '</div>' +
				'<div class="tut-stat-body">' +
					'<div class="tut-stat-number">' + card.value + '</div>' +
					'<div class="tut-stat-label">' + card.label + '</div>' +
				'</div>' +
			'</div>'
		);
	});
	return $grid;
}

// ══════════════════════════════════════════════════════════
// RECENT PROJECTS TABLE
// ══════════════════════════════════════════════════════════

function render_recent_projects(projects) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Recent Projects / Tasks</h4>' +
				'<a href="/app/team-project-update">View All</a>' +
			'</div>' +
			'<div class="tut-section-body" style="padding:0;">' +
				'<div class="tut-data-table-wrap"><table class="tut-data-table">' +
					'<thead><tr>' +
						'<th>Title</th><th>Status</th><th>Team</th><th>Priority</th><th>Progress</th><th>Assigned</th>' +
					'</tr></thead><tbody></tbody></table></div>' +
			'</div>' +
		'</div>'
	);
	var $tbody = $sec.find('tbody');
	projects.forEach(function (p) {
		var sc = get_status_class(p.status);
		var pc = p.priority ? get_priority_class(p.priority) : '';
		var prHtml = p.priority
			? '<span class="tut-status-pill ' + pc + '">' + p.priority + '</span>'
			: '-';
		var progClass = get_progress_class(p.progress_percent);
		var assignee = p.assigned_to || p.project_owner || '-';
		$tbody.append(
			'<tr>' +
				'<td><a href="/app/team-project-update/' + p.name + '">' + frappe.utils.escape_html(p.project_title) + '</a></td>' +
				'<td><span class="tut-status-pill ' + sc + '">' + p.status + '</span></td>' +
				'<td>' + (p.team || '-') + '</td>' +
				'<td>' + prHtml + '</td>' +
				'<td><div class="tut-progress-mini"><div class="tut-progress-track"><div class="tut-progress-fill ' + progClass + '" style="width:' + (p.progress_percent || 0) + '%;"></div></div>' + (p.progress_percent || 0) + '%</div></td>' +
				'<td>' + frappe.utils.escape_html(assignee) + '</td>' +
			'</tr>'
		);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// TEAMS TABLE
// ══════════════════════════════════════════════════════════

function render_teams_table(teams) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Team Performance</h4>' +
				'<a href="/app/team">View All</a>' +
			'</div>' +
			'<div class="tut-section-body" style="padding:0;">' +
				'<div class="tut-data-table-wrap"><table class="tut-data-table">' +
					'<thead><tr>' +
						'<th>Team</th><th>Type</th><th>Lead</th><th>Projects</th><th>Members</th><th>Status</th>' +
					'</tr></thead><tbody></tbody></table></div>' +
			'</div>' +
		'</div>'
	);
	var $tbody = $sec.find('tbody');
	(teams || []).forEach(function (t) {
		var st = t.is_active
			? '<span class="tut-status-pill tut-status-approved">Active</span>'
			: '<span class="tut-status-pill tut-status-draft">Inactive</span>';
		$tbody.append(
			'<tr>' +
				'<td><a href="/app/team/' + t.name + '">' + (t.team_name || t.name) + '</a></td>' +
				'<td>' + (t.team_type || '-') + '</td>' +
				'<td>' + (t.team_lead || '-') + '</td>' +
				'<td>' + t.project_count + '</td>' +
				'<td>' + t.member_count + '</td>' +
				'<td>' + st + '</td>' +
			'</tr>'
		);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// GITHUB REPOS
// ══════════════════════════════════════════════════════════

function render_github_projects(projects) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Recent GitHub Uploads</h4>' +
				'<a href="/app/team-project-update">View All</a>' +
			'</div>' +
			'<div class="tut-section-body"><div class="tut-link-list"></div></div>' +
		'</div>'
	);
	var $list = $sec.find('.tut-link-list');
	projects.forEach(function (p) {
		$list.append(
			'<div class="tut-link-row">' +
				'<span>📦</span>' +
				'<span><a href="' + p.github_repo_url + '" target="_blank">' + frappe.utils.escape_html(p.project_title) + '</a></span>' +
				'<span class="tut-activity-meta">' + (p.team || '') + '</span>' +
			'</div>'
		);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// RECENT SCREENSHOTS
// ══════════════════════════════════════════════════════════

function render_recent_screenshots(screenshots) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Recent Screenshots</h4>' +
				'<a href="/app/team-project-update">View All</a>' +
			'</div>' +
			'<div class="tut-section-body"><div class="tut-screenshot-grid"></div></div>' +
		'</div>'
	);
	var $grid = $sec.find('.tut-screenshot-grid');
	screenshots.forEach(function (s) {
		var img = s.screenshot || '';
		if (img && !img.startsWith('/')) img = '/' + img;
		$grid.append(
			'<div class="tut-screenshot-item">' +
				'<img src="' + img + '" class="tut-thumbnail" onerror="this.style.display=\'none\'" />' +
				'<div class="tut-screenshot-caption">' + (s.caption || s.project_title || '') + '</div>' +
			'</div>'
		);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// RECENT DOCUMENTS
// ══════════════════════════════════════════════════════════

function render_recent_files(files) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Recent Document Uploads</h4>' +
				'<a href="/app/team-project-update">View All</a>' +
			'</div>' +
			'<div class="tut-section-body"><div class="tut-link-list"></div></div>' +
		'</div>'
	);
	var $list = $sec.find('.tut-link-list');
	files.forEach(function (f) {
		var file_url = f.file_attachment || '';
		if (file_url && !file_url.startsWith('/') && !file_url.startsWith('http')) {
			file_url = '/' + file_url;
		}
		$list.append(
			'<div class="tut-link-row">' +
				'<span>📄</span>' +
				'<span><a href="' + file_url + '" target="_blank">' + frappe.utils.escape_html(f.file_description || f.project_title || 'File') + '</a></span>' +
				'<span class="tut-activity-meta">' + (f.project_title || '') + '</span>' +
			'</div>'
		);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════

function render_notifications(notifications) {
	var $sec = $(
		'<div class="tut-section-card">' +
			'<div class="tut-section-header">' +
				'<h4>Recent Notifications</h4>' +
				'<a href="/app/notification-log">View All</a>' +
			'</div>' +
			'<div class="tut-section-body"><div class="tut-activity-list"></div></div>' +
		'</div>'
	);
	var $list = $sec.find('.tut-activity-list');
	notifications.forEach(function (n) {
		var $row = $(
			'<div class="tut-activity-row">' +
				'<span class="tut-activity-icon">🔔</span>' +
				'<span class="tut-activity-text">' + (n.subject || '') + '</span>' +
				'<span class="tut-activity-meta">' + fraetime(n.creation) + '</span>' +
			'</div>'
		);
		if (n.document_name) {
			$row.css('cursor', 'pointer');
			$row.click(function () {
				frappe.set_route('Form', 'Team Project Update', n.document_name);
			});
		}
		$list.append($row);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════════════════════

function render_charts($main, chart_data) {
	var $row = $main.find('#tut-charts-row');
	if (!$row.length) {
		$main.append('<div class="tut-charts-row" id="tut-charts-row"></div>');
		$row = $main.find('#tut-charts-row');
	}
	$row.empty();

	// Chart 1: Project Status (Donut)
	if (chart_data.status_counts && chart_data.status_counts.length) {
		var labels = chart_data.status_counts.map(function (d) { return d.status; });
		var values = chart_data.status_counts.map(function (d) { return d.count; });
		var colors = labels.map(function (s) { return get_chart_color(s); });
		$row.append(
			'<div class="tut-chart-card"><div class="tut-chart-header"><h4>Project Status</h4></div>' +
			'<div class="tut-chart-body"><div class="chart-container" id="chart-status" style="height:220px;"></div></div></div>'
		);
		setTimeout(function () {
			try { new frappe.Chart('#chart-status', {
				data: { labels: labels, datasets: [{ name: 'Projects', values: values, chartType: 'donut' }] },
				type: 'donut', height: 200, colors: colors,
			}); } catch (e) { console.error('Chart 1 error', e); }
		}, 250);
	}

	// Chart 2: Monthly Completed (Bar)
	if (chart_data.monthly_completed && chart_data.monthly_completed.length) {
		var ml = chart_data.monthly_completed.map(function (d) { return d.month || 'N/A'; });
		var mv = chart_data.monthly_completed.map(function (d) { return d.count; });
		$row.append(
			'<div class="tut-chart-card"><div class="tut-chart-header"><h4>Monthly Completed</h4></div>' +
			'<div class="tut-chart-body"><div class="chart-container" id="chart-monthly" style="height:220px;"></div></div></div>'
		);
		setTimeout(function () {
			try { new frappe.Chart('#chart-monthly', {
				data: { labels: ml, datasets: [{ name: 'Completed', values: mv, chartType: 'bar' }] },
				type: 'bar', height: 200, colors: ['#2ecc71'],
			}); } catch (e) { console.error('Chart 2 error', e); }
		}, 250);
	}

	// Chart 3: Team Performance (Bar)
	if (chart_data.team_performance && chart_data.team_performance.length) {
		var tl = chart_data.team_performance.map(function (d) { return d.team || 'Unknown'; });
		var tv = chart_data.team_performance.map(function (d) { return d.count; });
		$row.append(
			'<div class="tut-chart-card"><div class="tut-chart-header"><h4>Team Performance</h4></div>' +
			'<div class="tut-chart-body"><div class="chart-container" id="chart-team" style="height:220px;"></div></div></div>'
		);
		setTimeout(function () {
			try { new frappe.Chart('#chart-team', {
				data: { labels: tl, datasets: [{ name: 'Tasks', values: tv, chartType: 'bar' }] },
				type: 'bar', height: 200, colors: ['#8b5cf6'],
			}); } catch (e) { console.error('Chart 3 error', e); }
		}, 250);
	}

	// Chart 4: Progress Distribution (Percentage)
	if (chart_data.progress_ranges && chart_data.progress_ranges.length) {
		var pl = chart_data.progress_ranges.map(function (d) { return d['range'] || 'Unknown'; });
		var pv = chart_data.progress_ranges.map(function (d) { return d.count; });
		$row.append(
			'<div class="tut-chart-card"><div class="tut-chart-header"><h4>Task Progress</h4></div>' +
			'<div class="tut-chart-body"><div class="chart-container" id="chart-progress" style="height:220px;"></div></div></div>'
		);
		setTimeout(function () {
			try { new frappe.Chart('#chart-progress', {
				data: { labels: pl, datasets: [{ name: 'Tasks', values: pv, chartType: 'bar' }] },
				type: 'percentage', height: 200,
				colors: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'],
			}); } catch (e) { console.error('Chart 4 error', e); }
		}, 250);
	}
}

// ══════════════════════════════════════════════════════════
// EMPTY STATE
// ══════════════════════════════════════════════════════════

function render_empty_state() {
	return '<div class="tut-empty-state">' +
		'<h4>Welcome to Team Update Tool 🚀</h4>' +
		'<p>No projects yet. Create your first task to get started!</p>' +
		'<button class="tut-btn tut-btn-primary" onclick="frappe.new_doc(\'Team Project Update\')">' +
			frappe.utils.icon('plus', 'sm') + ' Create New Task' +
		'</button>' +
	'</div>';
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function get_status_class(status) {
	var m = { Draft: 'tut-status-draft', Assigned: 'tut-status-assigned', 'In Progress': 'tut-status-in-progress',
		Completed: 'tut-status-completed', 'Under Review': 'tut-status-under-review', Approved: 'tut-status-approved', Rejected: 'tut-status-rejected' };
	return m[status] || 'tut-status-draft';
}

function get_priority_class(priority) {
	var m = { Low: 'tut-priority-low', Medium: 'tut-priority-medium', High: 'tut-priority-high', Urgent: 'tut-priority-urgent' };
	return m[priority] || 'tut-priority-medium';
}

function get_progress_class(pct) {
	pct = parseInt(pct) || 0;
	if (pct >= 100) return 'tut-progress-fill-green';
	if (pct >= 50) return 'tut-progress-fill-blue';
	if (pct >= 25) return 'tut-progress-fill-orange';
	return 'tut-progress-fill-red';
}

function get_chart_color(status) {
	var m = { Draft: '#6b7280', Assigned: '#8b5cf6', 'In Progress': '#f59e0b',
		Completed: '#3b82f6', 'Under Review': '#eab308', Approved: '#22c55e', Rejected: '#ef4444' };
	return m[status] || '#6b7280';
}

function fraetime(dt) {
	if (!dt) return '';
	var d = frappe.datetime.str_to_obj(dt);
	var now = new Date();
	var diff = (now - d) / 1000;
	if (diff < 60) return 'just now';
	if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
	if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
	return frappe.datetime.str_to_user(dt.split(' ')[0]);
}
