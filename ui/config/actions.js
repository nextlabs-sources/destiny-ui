var implicitActionsMap = {
  "Create Policy": [
    { name: "View Policy", mandatory: true },
    { name: "Edit Policy", mandatory: false },
    { name: "Create Policy Tags", mandatory: false }
  ],
  "Delete Policy": [
    { name: "View Policy", mandatory: true },
    { name: "Deploy Policy", mandatory: true }
  ],
  "Deploy Policy": [
    { name: "View Policy", mandatory: true },
    { name: "Deploy Component", mandatory: false }
  ],
  "Edit Policy": [
    { name: "View Policy", mandatory: true },
    { name: "Create Policy Tags", mandatory: false }
  ],
  "View Policy": [],
  "Move Policy": [
    {name: "View Policy", mandatory: true }
  ],
  "Migrate Policy": [
    { name: "View Policy", mandatory: true },
    { name: "View Component", mandatory: true },
    { name: "View Policy Model", mandatory: true }
  ],
  "Create Component": [
    { name: "View Component", mandatory: true },
    { name: "Edit Component", mandatory: false },
    { name: "Create Component Tags", mandatory: false }
  ],
  "Delete Component": [
    { name: "View Component", mandatory: true },
    { name: "Edit Policy", mandatory: false },
    { name: "Deploy Policy", mandatory: false },
    { name: "Edit Component", mandatory: false },
    { name: "Deploy Component", mandatory: true }
  ],
  "Deploy Component": [
    { name: "View Component", mandatory: true }
  ],
  "Edit Component": [
    { name: "View Component", mandatory: true },
    { name: "Create Component Tags", mandatory: false }
  ],
  "View Component": [],
  "Move Component": [
    {name: "View Component", mandatory: true }
  ],
  "Create Policy Model": [
    { name: "View Policy Model", mandatory: true },
    { name: "Edit Policy Model", mandatory: false },
    { name: "Create Policy Model Tags", mandatory: false }
  ],
  "Delete Policy Model": [
    { name: "View Policy Model", mandatory: true }
  ],
  "Edit Policy Model": [
    { name: "View Policy Model", mandatory: true },
    { name: "Create Policy Model Tags", mandatory: false }
  ],
  "View Policy Model": [],
  "Manage Delegation Policies": [
    { name: "View Component Folder", mandatory: true },
    { name: "View Policy Folder", mandatory: true }
  ],
  "Manage Users": [],
  "Manage Reports": [
    { name: "View Reports", mandatory: true }
  ],
  "View Reports": [],
  "Manage Server & Enforcer": [],
  "Create Component Tags": [
    { name: "View Component", mandatory: false },
    { name: "Create Component", mandatory: false, or: true },
    { name: "Edit Component", mandatory: false, or: true },
    { name: "Manage Delegation Policies", mandatory: false, or: true }
  ],
  "Create Policy Model Tags": [
    { name: "View Policy Model", mandatory: false },
    { name: "Create Policy Model", mandatory: false, or: true },
    { name: "Edit Policy Model", mandatory: false, or: true },
    { name: "Manage Delegation Policies", mandatory: false, or: true }
  ],
  "Create Policy Tags": [
    { name: "View Policy", mandatory: false },
    { name: "Create Policy", mandatory: false, or: true },
    { name: "Edit Policy", mandatory: false, or: true },
    { name: "Manage Delegation Policies", mandatory: false, or: true }
  ],
  "Policy Tester": [
    { name: "View Policy", mandatory: false },
    { name: "View Component", mandatory: false }
  ],
  "Manage System Configuration": [],
  "Manage Server Log Configuration": [],
  "Manage Enrollment": [],
  "Manage Certificate": [],
  "Create Policy Folder/Sub-folders": [
    { name: "View Policy Folder", mandatory: true },
    { name: "Edit Policy Folder", mandatory: false }
  ],
  "Delete Policy Folder": [
    { name: "View Policy Folder", mandatory: true }
  ],
  "Rename Policy Folder": [
    { name: "View Policy Folder", mandatory: true }
  ],
  "Edit Policy Folder": [
    { name: "View Policy Folder", mandatory: true }
  ],
  "View Policy Folder": [],
  "Move Policy Folder": [
    { name: "View Policy Folder", mandatory: true }
  ],
  "Create Component Folder/Sub-folders": [
    { name: "View Component Folder", mandatory: true },
    { name: "Edit Component Folder", mandatory: false }
  ],
  "Delete Component Folder": [
    { name: "View Component Folder", mandatory: true }
  ],
  "Rename Component Folder": [
    { name: "View Component Folder", mandatory: true }
  ],
  "Edit Component Folder": [
    { name: "View Component Folder", mandatory: true }
  ],
  "Move Component Folder": [
    { name: "View Component Folder", mandatory: true }
  ],
  "View Component Folder": [],
  "View Environment Configuration": [],
  "Create Environment Configuration": [
    { name: "View Environment Configuration", mandatory: true },
    { name: "Edit Environment Configuration", mandatory: false }
  ],
  "Edit Environment Configuration": [
    { name: "View Environment Configuration", mandatory: true }
  ],
  "Delete Environment Configuration": [
    { name: "View Environment Configuration", mandatory: true }
  ],
  "Review Policy Workflow": [
    { name: "View Policy", mandatory: true },
    { name: "View Component", mandatory: false },
    { name: "View Policy Model", mandatory: false },
  ],
  "Manage Policy Controller": [],
  "Manage Policy Controller Profile": [
    { name: "Manage Policy Controller", mandatory: true },
    { name: "Manage ICENet", mandatory: true }
  ],
  "Manage ICENet": []
};