# Complete reset script - run via bench console
import frappe

def execute():
    # List of all doctypes to delete
    doctypes_to_delete = [
        'Team', 'Team Member', 'Technology', 'Project Category', 'Project Status',
        'Project', 'Project Update', 'Project Files', 'Project Screenshots', 'Project Technology',
        'GitHub Repository',
        'Project Summary Report', 'Team Activity Report', 'Completed Projects Report', 'GitHub Repository Report',
        'New Project Uploaded', 'Project Approved', 'Project Status Updated',
        'Team Update Tool'  # Workspace
    ]
    
    for dt_name in doctypes_to_delete:
        if frappe.db.exists('DocType', dt_name):
            try:
                frappe.delete_doc('DocType', dt_name, force=True)
                print(f"Deleted: {dt_name}")
            except Exception as e:
                print(f"Error deleting {dt_name}: {e}")
    
    # Also delete from PropertySetter
    frappe.db.sql("DELETE FROM `tabPropertySetter` WHERE doc_type IN ('{}')".format("','".join(doctypes_to_delete)))
    
    # Clear all caches
    frappe.clear_cache()
    frappe.db.commit()
    print("\nAll doctypes deleted. Now run: bench --site team.update.bizaxl.local migrate")
