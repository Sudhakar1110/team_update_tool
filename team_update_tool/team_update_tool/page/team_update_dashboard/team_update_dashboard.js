// Team Update Dashboard - Professional Frappe Desk Page
// Renders at /app/team_update_dashboard

frappe.pages['team_update_dashboard'].on_page_load = function (wrapper) {
	try {
		console.debug('Team Update Dashboard: on_page_load started');

		var page = frappe.ui.make_app_page({
			parent: wrapper,
			title: __('Team Update Dashboard'),
			single_column: true,
		});

		console.debug('Team Update Dashboard: page created');

		// Replace page-content with a flex layout: sidebar + main content
		$(wrapper).find('.page-content').html(
			'<div class="tut-desk-dashboard" style="display:flex;min-height:calc(100vh - 110px);">' +
				'<div class="tut-sidebar-menu" id="tut-sidebar"></div>' +
				'<div class="tut-dashboard-main" id="tut-dashboard-main" style="flex:1;overflow-x:auto;padding:0;"></div>' +
			'</div>'
		);

		// ── Render Sidebar ──
		render_sidebar();

		// ── Set Up Header Actions ──
		setup_header_actions(page);

		// ── Show Loading State ──
		var $main = $(wrapper).find('#tut-dashboard-main');
		$main.html(
			'<div class="tut-dashboard-loading text-center" style="padding:80px 0;">' +
				'<div class="spinner-border text-muted" role="status">' +
					'<span class="visually-hidden">Loading...</span>' +
				'</div>' +
				'<p class="text-muted mt-2" style="font-size:14px;">Loading Dashboard...</p>' +
			'</div>'
		);

		// ── Fetch Dashboard Data ──
		frappe.call({
			method:
				'team_update_tool.team_update_tool.page.team_update_dashboard.team_update_dashboard.get_dashboard_data',
			callback: function (r) {
				if (r.message) {
					console.debug('Team Update Dashboard: data loaded successfully');
					var $main = $(wrapper).find('#tut-dashboard-main');
					$main.empty();
					render_dashboard($main, r.message);
					if (r.message.charts) {
						render_charts($main, r.message.charts);
					}
					// Show empty state if no data at all
					if (
						!r.message.recent_projects ||
						!r.message.recent_projects.length
					) {
						$main.find('.tut-stats-grid').after(
							'<div class="tut-section-card" style="margin-bottom:20px;text-align:center;padding:40px;">' +
								'<h4 style="color:var(--text-muted);margin-bottom:8px;">Welcome to Team Update Tool</h4>' +
								'<p style="color:var(--text-muted);">No projects yet. Create your first task to get started!</p>' +
								'<button class="tut-btn tut-btn-primary" onclick="frappe.new_doc(\'Team Project Update\')">Create New Task</button>' +
							'</div>'
						);
					}
				} else {
					console.error('Team Update Dashboard: empty response', r);
					$(wrapper).find('#tut-dashboard-main').html(
						'<div class="alert alert-danger" style="margin:20px;">' +
							'<h4>Dashboard Error</h4>' +
							'<p>Received empty response from server.</p>' +
						'</div>'
					);
				}
			},
			error: function (err) {
				console.error('Team Update Dashboard: API call failed', err);
				$(wrapper).find('#tut-dashboard-main').html(
					'<div class="alert alert-danger" style="margin:20px;">' +
						'<h4>Dashboard Failed to Load</h4>' +
						'<p>Failed to load dashboard data. Check browser console for details.</p>' +
					'</div>'
				);
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

// ══════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════

function render_sidebar() {
	var sidebar_items = [
		{
			section: 'Overview',
			items: [
				{
					label: 'Dashboard',
					icon: 'home',
					route: '/app/team_update_dashboard',
					active: true,
				},
			],
		},
		{
			section: 'Core',
			items: [
				{ label: 'All Tasks', icon: 'list', route: '/app/team-project-update' },
				{ label: 'New Task', icon: 'plus', route: '/app/team-project-update/new-task' },
				{ label: 'Teams', icon: 'people', route: '/app/team' },
			],
		},
		{
			section: 'Activity',
			items: [
				{ label: 'GitHub Repositories', icon: 'mark-github', route: '/app/team-project-update' },
				{ label: 'Screenshots', icon: 'image', route: '/app/team-project-update' },
				{ label: 'Documents', icon: 'file', route: '/app/team-project-update' },
			],
		},
		{
			section: 'Reports',
			items: [
				{
					label: 'Project Status Summary',
					icon: 'chart',
					route: '/app/query-report/Project%20Status%20Summary',
				},
			],
		},
		{
			section: 'Settings',
			items: [
				{ label: 'Notifications', icon: 'bell', route: '/app/notification-log' },
				{ label: 'Team Update Settings', icon: 'settings', route: '/app/team-update-settings' },
			],
		},
	];

	var $sidebar = $('#tut-sidebar');
	sidebar_items.forEach(function (section) {
		var $sec = $('<div class="tut-sidebar-section"></div>');
		$sec.append('<div class="tut-sidebar-title">' + section.section + '</div>');
		section.items.forEach(function (item) {
			var $item = $(
				'<a class="tut-sidebar-item' +
					(item.active ? ' active' : '') +
					'" href="' +
					item.route +
					'">' +
					frappe.utils.icon(item.icon, 'sm') +
					' ' +
					item.label +
					'</a>'
			);
			$sec.append($item);
		});
		$sidebar.append($sec);
	});
}

// ══════════════════════════════════════════════════════════
// HEADER ACTIONS
// ══════════════════════════════════════════════════════════

function setup_header_actions(page) {
	page.add_inner_button(
		__('New Task'),
		function () {
			frappe.new_doc('Team Project Update');
		},
		__('Actions')
	);

	page.add_inner_button(
		__('View All Projects'),
		function () {
			frappe.set_route('list', 'Team Project Update');
		},
		__('Actions')
	);

	page.add_inner_button(
		__('View Teams'),
		function () {
			frappe.set_route('list', 'Team');
		},
		__('Actions')
	);

	page.add_inner_button(
		__('Project Status Report'),
		function () {
			frappe.set_route('query-report', 'Project Status Summary');
		},
		__('Actions')
	);
}

// ══════════════════════════════════════════════════════════
// DASHBOARD RENDERER
// ══════════════════════════════════════════════════════════

function render_dashboard($main, data) {
	var $dashboard = $('<div class="tut-dashboard-container"></div>');

	// ── Stats Cards ──
	$dashboard.append(render_stats_row(data.stats));

	// ── Quick Actions ──
	$dashboard.append(render_quick_actions());

	// ── Charts Row (placeholder for render_charts) ──
	$dashboard.append('<div class="tut-charts-row" id="tut-charts-row"></div>');

	// ── Recent Projects Table ──
	if (data.recent_projects && data.recent_projects.length) {
		$dashboard.append(render_recent_projects(data.recent_projects));
	}

	// ── Notifications ──
	if (data.notifications && data.notifications.length) {
		$dashboard.append(render_notifications(data.notifications));
	}

	// ── Teams Table ──
	if (data.teams && data.teams.length) {
		$dashboard.append(render_teams_table(data.teams));
	}

	// ── Recent GitHub Repos ──
	if (data.github_projects && data.github_projects.length) {
		$dashboard.append(render_github_projects(data.github_projects));
	}

	// ── Recent Screenshots ──
	if (data.recent_screenshots && data.recent_screenshots.length) {
		$dashboard.append(render_recent_screenshots(data.recent_screenshots));
	}

	$main.append($dashboard);
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
		{ label: 'Active Teams', value: stats.active_teams || 0, icon: '👥', color: 'tut-stat-purple' },
		{ label: 'Team Leaders', value: stats.team_leaders || 0, icon: '👤', color: 'tut-stat-blue' },
		{ label: 'Team Members', value: stats.team_members || 0, icon: '👥', color: 'tut-stat-purple' },
		{ label: 'All Teams', value: stats.total_teams || 0, icon: '🏢', color: 'tut-stat-blue' },
		{ label: 'Assigned', value: stats.assigned || 0, icon: '📌', color: 'tut-stat-orange' },
		{ label: 'Rejected', value: stats.rejected || 0, icon: '❌', color: 'tut-stat-red' },
	];

	var $grid = $('<div class="tut-stats-grid"></div>');
	cards.forEach(function (card) {
		var $card = $(
			'<div class="tut-stat-card-modern ' +
				card.color +
				'">' +
				'<div class="tut-stat-icon-modern">' +
				card.icon +
				'</div>' +
				'<div class="tut-stat-body">' +
				'<div class="tut-stat-number">' +
				card.value +
				'</div>' +
				'<div class="tut-stat-label">' +
				card.label +
				'</div>' +
				'</div>' +
				'</div>'
		);
		$grid.append($card);
	});

	return $grid;
}

// ══════════════════════════════════════════════════════════
// QUICK ACTIONS
// ══════════════════════════════════════════════════════════

function render_quick_actions() {
	var actions = [
		{ key: 'new_task', label: 'New Task', icon: 'plus', color: 'green' },
		{ key: 'all_tasks', label: 'All Tasks', icon: 'list', color: 'blue' },
		{ key: 'teams', label: 'Teams', icon: 'people', color: 'grey' },
		{ key: 'report', label: 'Project Status Report', icon: 'chart', color: 'orange' },
		{ key: 'settings', label: 'Settings', icon: 'settings', color: 'red' },
	];

	var action_map = {
		new_task: function () { frappe.new_doc('Team Project Update'); },
		all_tasks: function () { frappe.set_route('list', 'Team Project Update'); },
		teams: function () { frappe.set_route('list', 'Team'); },
		report: function () { frappe.set_route('query-report', 'Project Status Summary'); },
		settings: function () { frappe.set_route('Form', 'Team Update Settings'); },
	};

	var $sec = $(
		'<div class="tut-section-card" style="margin-bottom:20px;">' +
			'<div class="tut-section-header"><h4>Quick Actions</h4></div>' +
			'<div class="tut-section-body" style="display:flex;gap:8px;flex-wrap:wrap;"></div>' +
		'</div>'
	);
	actions.forEach(function (a) {
		var $btn = $(
			'<button class="tut-btn" style="background:var(--' + a.color +
			'-50);color:var(--' + a.color +
			'-700);border-color:var(--' + a.color +
			'-200);">' +
				frappe.utils.icon(a.icon, 'sm') + ' ' + a.label +
			'</button>'
		);
		$btn.click(action_map[a.key]);
		$sec.find('.tut-section-body').append($btn);
	});
	return $sec;
}

// ══════════════════════════════════════════════════════════
// RECENT PROJECTS TABLE
// ══════════════════════════════════════════════════════════

function render_recent_projects(projects) {
	var $sec = $(
		'<div class="tut-bottom-card">' +
			'<div class="tut-bottom-header"><h4>Recent Projects / Tasks</h4></div>' +
			'<div class="tut-bottom-body"></div>' +
		'</div>'
	);

	var $table = $(
		'<table class="tut-data-table"><thead><tr>' +
			'<th>Title</th><th>Status</th><th>Team</th><th>Priority</th><th>Progress</th><th>Assigned To</th>' +
		'</tr></thead><tbody></tbody></table>'
	);

	projects.forEach(function (p) {
		var status_class = get_status_class(p.status);
		var priority_badge = p.priority
			? '<span class="tut-status-pill tut-status-' + p.priority.toLowerCase() + '">' + p.priority + '</span>'
			: '-';
		var $row = $(
			'<tr style="cursor:pointer;">' +
				'<td><a href="/app/team-project-update/' + p.name + '">' +
					frappe.utils.escape_html(p.project_title) +
				'</a></td>' +
				'<td><span class="tut-status-pill ' + status_class + '">' + p.status + '</span></td>' +
				'<td>' + (p.team || '-') + '</td>' +
				'<td>' + priority_badge + '</td>' +
				'<td><div class="tut-progress-mini"><div class="tut-progress-track"><div class="tut-progress-fill-mini" style="width:' +
					(p.progress_percent || 0) + '%;"></div></div>' +
					(p.progress_percent || 0) + '%</div></td>' +
				'<td>' + (p.assigned_to || p.project_owner || '-') + '</td>' +
			'</tr>'
		);
		$table.find('tbody').append($row);
	});

	$sec.find('.tut-bottom-body').append($table);
	return $sec;
}

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════

function render_notifications(notifications) {
	var $sec = $(
		'<div class="tut-bottom-card" style="margin-top:16px;">' +
			'<div class="tut-bottom-header"><h4>Recent Notifications</h4></div>' +
			'<div class="tut-bottom-body"><div class="tut-notif-list" style="padding:12px;"></div></div>' +
		'</div>'
	);
	var $list = $sec.find('.tut-notif-list');

	notifications.forEach(function (n) {
		var time_html = '<span class="tut-notif-time">' + fraetime(n.creation) + '</span>';
		var $row = $(
			'<div class="tut-notif-row">' +
				'<span class="tut-notif-icon">🔔</span>' +
				'<span class="tut-notif-text">' + (n.subject || '') + '</span>' +
				time_html +
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
// TEAMS TABLE
// ══════════════════════════════════════════════════════════

function render_teams_table(teams) {
	var $sec = $(
		'<div class="tut-bottom-card" style="margin-top:16px;">' +
			'<div class="tut-bottom-header"><h4>Team Performance</h4></div>' +
			'<div class="tut-bottom-body"></div>' +
		'</div>'
	);

	var $table = $(
		'<table class="tut-data-table"><thead><tr>' +
			'<th>Team Name</th><th>Type</th><th>Team Lead</th><th>Projects</th><th>Members</th><th>Status</th>' +
		'</tr></thead><tbody></tbody></table>'
	);

	teams.forEach(function (t) {
		var status_html = t.is_active
			? '<span class="tut-status-pill tut-status-approved">Active</span>'
			: '<span class="tut-status-pill tut-status-draft">Inactive</span>';
		var $row = $(
			'<tr style="cursor:pointer;">' +
				'<td><a href="/app/team/' + t.name + '">' + (t.team_name || t.name) + '</a></td>' +
				'<td>' + (t.team_type || '-') + '</td>' +
				'<td>' + (t.team_lead || '-') + '</td>' +
				'<td>' + t.project_count + '</td>' +
				'<td>' + t.member_count + '</td>' +
				'<td>' + status_html + '</td>' +
			'</tr>'
		);
		$table.find('tbody').append($row);
	});

	$sec.find('.tut-bottom-body').append($table);
	return $sec;
}

// ══════════════════════════════════════════════════════════
// GITHUB REPOS
// ══════════════════════════════════════════════════════════

function render_github_projects(projects) {
	var $sec = $(
		'<div class="tut-section-card" style="margin-top:16px;">' +
			'<div class="tut-section-header"><h4>Recent GitHub Repository Uploads</h4></div>' +
			'<div class="tut-section-body"></div>' +
		'</div>'
	);

	var $list = $('<div style="display:flex;flex-direction:column;gap:6px;"></div>');
	projects.forEach(function (p) {
		var $item = $(
			'<div class="tut-notif-row" style="cursor:pointer;">' +
				'<span>📦</span>' +
				'<span><a href="' + p.github_repo_url + '" target="_blank">' +
					frappe.utils.escape_html(p.project_title) +
				'</a> <span class="text-muted">(' + (p.team || '-') + ')</span></span>' +
			'</div>'
		);
		$list.append($item);
	});

	$sec.find('.tut-section-body').append($list);
	return $sec;
}

// ══════════════════════════════════════════════════════════
// RECENT SCREENSHOTS
// ══════════════════════════════════════════════════════════

function render_recent_screenshots(screenshots) {
	var $sec = $(
		'<div class="tut-section-card" style="margin-top:16px;">' +
			'<div class="tut-section-header"><h4>Recent Screenshot Uploads</h4></div>' +
			'<div class="tut-section-body"></div>' +
		'</div>'
	);

	var $grid = $(
		'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;"></div>'
	);
	screenshots.forEach(function (s) {
		var img_url = s.screenshot;
		if (img_url && !img_url.startsWith('/')) {
			img_url = '/' + img_url;
		}
		var $item = $(
			'<div style="text-align:center;">' +
				'<img src="' + (img_url || '') +
				'" class="tut-thumbnail" style="max-height:100px;width:100%;object-fit:cover;border-radius:6px;border:1px solid var(--border-color);" onerror="this.style.display=\'none\'" />' +
				'<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">' +
					(s.caption || s.project_title || '') +
				'</div>' +
			'</div>'
		);
		$grid.append($item);
	});

	$sec.find('.tut-section-body').append($grid);
	return $sec;
}

// ══════════════════════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════════════════════

function render_charts($main, chart_data) {
	var $charts_row = $main.find('#tut-charts-row');
	if (!$charts_row.length) {
		$main.append('<div class="tut-charts-row" id="tut-charts-row"></div>');
		$charts_row = $main.find('#tut-charts-row');
	}
	$charts_row.empty();

	// Chart 1: Project Status (Donut)
	if (chart_data.status_counts && chart_data.status_counts.length) {
		var $chart1 = $(
			'<div class="tut-chart-card">' +
				'<div class="tut-chart-header"><h4>Project Status</h4></div>' +
				'<div class="tut-chart-body"><div class="chart-container" id="chart-status" style="height:250px;"></div></div>' +
			'</div>'
		);
		$charts_row.append($chart1);

		var status_labels = chart_data.status_counts.map(function (d) { return d.status; });
		var status_values = chart_data.status_counts.map(function (d) { return d.count; });
		var status_colors = status_labels.map(function (s) { return get_chart_color(s); });

		setTimeout(function () {
			try {
				new frappe.Chart('#chart-status', {
					data: { labels: status_labels, datasets: [{ name: 'Projects', values: status_values, chartType: 'donut' }] },
					type: 'donut', height: 200, colors: status_colors,
				});
			} catch (e) { console.error('Team Update Dashboard: Chart 1 error', e); }
		}, 200);
	}

	// Chart 2: Monthly Completed (Bar)
	if (chart_data.monthly_completed && chart_data.monthly_completed.length) {
		var $chart2 = $(
			'<div class="tut-chart-card">' +
				'<div class="tut-chart-header"><h4>Monthly Completed Projects</h4></div>' +
				'<div class="tut-chart-body"><div class="chart-container" id="chart-monthly" style="height:250px;"></div></div>' +
			'</div>'
		);
		$charts_row.append($chart2);

		var monthly_labels = chart_data.monthly_completed.map(function (d) { return d.month || 'N/A'; });
		var monthly_values = chart_data.monthly_completed.map(function (d) { return d.count; });

		setTimeout(function () {
			try {
				new frappe.Chart('#chart-monthly', {
					data: { labels: monthly_labels, datasets: [{ name: 'Completed', values: monthly_values, chartType: 'bar' }] },
					type: 'bar', height: 200, colors: ['#2ecc71'],
				});
			} catch (e) { console.error('Team Update Dashboard: Chart 2 error', e); }
		}, 200);
	}

	// Chart 3: Team Performance (Bar)
	if (chart_data.team_performance && chart_data.team_performance.length) {
		var $chart3 = $(
			'<div class="tut-chart-card">' +
				'<div class="tut-chart-header"><h4>Team Performance</h4></div>' +
				'<div class="tut-chart-body"><div class="chart-container" id="chart-team" style="height:250px;"></div></div>' +
			'</div>'
		);
		$charts_row.append($chart3);

		var team_labels = chart_data.team_performance.map(function (d) { return d.team || 'Unknown'; });
		var team_values = chart_data.team_performance.map(function (d) { return d.count; });

		setTimeout(function () {
			try {
				new frappe.Chart('#chart-team', {
					data: { labels: team_labels, datasets: [{ name: 'Tasks', values: team_values, chartType: 'bar' }] },
					type: 'bar', height: 200, colors: ['#8b5cf6'],
				});
			} catch (e) { console.error('Team Update Dashboard: Chart 3 error', e); }
		}, 200);
	}

	// Chart 4: Progress Distribution (Percentage)
	if (chart_data.progress_ranges && chart_data.progress_ranges.length) {
		var $chart4 = $(
			'<div class="tut-chart-card">' +
				'<div class="tut-chart-header"><h4>Task Progress Distribution</h4></div>' +
				'<div class="tut-chart-body"><div class="chart-container" id="chart-progress" style="height:250px;"></div></div>' +
			'</div>'
		);
		$charts_row.append($chart4);

		var prog_labels = chart_data.progress_ranges.map(function (d) { return d.range || 'Unknown'; });
		var prog_values = chart_data.progress_ranges.map(function (d) { return d.count; });

		setTimeout(function () {
			try {
				new frappe.Chart('#chart-progress', {
					data: { labels: prog_labels, datasets: [{ name: 'Tasks', values: prog_values, chartType: 'bar' }] },
					type: 'percentage', height: 200,
					colors: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'],
				});
			} catch (e) { console.error('Team Update Dashboard: Chart 4 error', e); }
		}, 200);
	}
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

function get_status_class(status) {
	var map = {
		Draft: 'tut-status-draft',
		Assigned: 'tut-status-assigned',
		'In Progress': 'tut-status-in-progress',
		Completed: 'tut-status-completed',
		'Under Review': 'tut-status-under-review',
		Approved: 'tut-status-approved',
		Rejected: 'tut-status-rejected',
	};
	return map[status] || 'tut-status-draft';
}

function get_chart_color(status) {
	var map = {
		Draft: '#6b7280', Assigned: '#8b5cf6', 'In Progress': '#f59e0b',
		Completed: '#3b82f6', 'Under Review': '#eab308', Approved: '#22c55e', Rejected: '#ef4444',
	};
	return map[status] || '#6b7280';
}

function fraetime(datetime) {
	if (!datetime) return '';
	var date = frappe.datetime.str_to_obj(datetime);
	var now = new Date();
	var diff = (now - date) / 1000;
	if (diff < 60) return 'just now';
	if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
	if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
	return frappe.datetime.str_to_user(datetime.split(' ')[0]);
}
