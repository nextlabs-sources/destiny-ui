controlCenterConsoleApp.constant("constants", {
  agentTypes: [
    { key: "FILE_SERVER", value: "File Server" },
    { key: "PORTAL", value: "Portal" },
    { key: "DESKTOP", value: "Win Desktop" },
  ],
  memberTypeFilters: {
    user: [
      { key: "USER", value: "Users" },
      { key: "USER_GROUP", value: "User Groups" },
    ],
    host: [
      { key: "HOST", value: "Hosts" },
      { key: "HOST_GROUP", value: "Host Groups" },
    ],
    application: [{ key: "APPLICATION", value: "Applications" }],
    subject: [{ key: "COMPONENT", value: "Components" }],
    resource: [],
    action: [],
  },

  policyStudioMenus: [
    {
      name: "Analytics",
      permission: ["AUTHORISED"],
      items: [
        {
          name: "Dashboard",
          url: "Dashboard",
          type: "link",
          permission: "AUTHORISED",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/dashboard.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "Policy model",
      permission: [
        "PolicyStudio.Policies",
        "PolicyStudio.Components",
        "XACML_POLICY",
        "PolicyStudio.PolicyModel",
        "POLICY_VALIDATOR",
      ],
      items: [
        {
          name: "Component types",
          url: `PolicyStudio/PolicyModel`,
          type: "link",
          permission: "PolicyStudio.PolicyModel",
          img: `${window.location.origin}/console/ui/css/img/component-types.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Components",
          url: "",
          type: "title",
          permission: "PolicyStudio.Components",
          img: `${window.location.origin}/console/ui/css/img/component.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Subjects",
          url: `PolicyStudio/Components/Subject`,
          type: "list",
          permission: "PolicyStudio.Components",
          img: `${window.location.origin}/console/ui/css/img/subject.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Resources",
          url: `PolicyStudio/Components/Resource`,
          type: "list",
          permission: "PolicyStudio.Components",
          img: `${window.location.origin}/console/ui/css/img/resource.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Actions",
          url: `PolicyStudio/Components/Action`,
          type: "list",
          permission: "PolicyStudio.Components",
          img: `${window.location.origin}/console/ui/css/img/action.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Policies",
          url: `PolicyStudio/Policies`,
          type: "link",
          permission: "PolicyStudio.Policies",
          img: `${window.location.origin}/console/ui/css/img/policies.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "XACML policies",
          url: `PolicyStudio/Tools/XacmlPolicy/list`,
          type: "link",
          permission: "XACML_POLICY",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/xacml_policy.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Policy validator",
          url: `policy-validator`,
          type: "link",
          permission: "POLICY_VALIDATOR",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/policy_validator.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "Attributes",
      permission: ["PolicyStudio.Enrollment"],
      items: [
        {
          name: "Properties",
          url: `PolicyStudio/Tools/EnrollmentManagement/Property/list`,
          type: "link",
          permission: "PolicyStudio.Enrollment",
          img: `${window.location.origin}/console/ui/css/img/properties.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Data sources",
          url: `PolicyStudio/Tools/EnrollmentManagement/Enrollments`,
          type: "link",
          permission: "PolicyStudio.Enrollment",
          img: `${window.location.origin}/console/ui/css/img/data_source.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Password encryption",
          url: `PolicyStudio/Tools/EnrollmentManagement/password-encryption`,
          type: "link",
          permission: "PolicyStudio.Enrollment",
          img: `${window.location.origin}/console/ui/css/img/password_encryp.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Data viewer",
          url: `PolicyStudio/Tools/EnrollmentManagement/EnrolledDataViewer`,
          type: "link",
          permission: "PolicyStudio.Enrollment",
          img: `${window.location.origin}/console/ui/css/img/data_viewer.svg`,
          imgHeight: "Small", // To adjust align of the image and word
        },
        {
          name: "Locations",
          url: `PolicyStudio/Tools/EnrollmentManagement/Locations/list`,
          type: "link",
          permission: "PolicyStudio.Enrollment",
          img: `${window.location.origin}/console/ui/css/img/location.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
  ],

  auditReportMenus: [
    {
      items: [
        {
          name: "Dashboard",
          url: `reporter`,
          type: "link",
          permission: "AUTHORISED",
          menuType: "User Access",
        },
      ],
    },
    {
      name: "Reports",
      permission: "Reporter",
      items: [
        {
          name: "Activity logs",
          url: `reporter/monitors/myMonitors.jsf`,
          type: "link",
          permission: "Reporter",
        },
        {
          name: "Audit logs",
          url: `reporter/reports/auditLogReports.jsf`,
          type: "link",
          permission: "Reporter",
        },
      ],
    },
    {
      name: "Monitoring",
      permission: "Reporter",
      items: [
        {
          name: "Alerts",
          url: `reporter/monitors/myAlerts.jsf`,
          type: "link",
          permission: "Reporter",
        },
      ],
    },
  ],
  systemAdminstrationMenus: [
    {
      name: "Analytics",
      permission: ["AUTHORISED"],
      menuType: "User Access",
      items: [
        {
          name: "Dashboard",
          url: "/services/#/dashboard",
          type: "link",
          permission: "AUTHORISED",
          UiType: "Administrator",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/dashboard.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "Policy controllers",
      menuType: "User Access",
      permission: [
        "MANAGE_POLICY_CONTROLLER",
        "MANAGE_PDP_PLUGIN",
        "MANAGE_POLICY_CONTROLLER_PROFILE",
      ],
      items: [
        {
          name: "Status",
          url: "/policy-controllers/#/status",
          type: "link",
          permission: "MANAGE_POLICY_CONTROLLER",
          UiType: "Administrator",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/status.svg`,
          imgHeight: "Small", // To adjust align of the image and word
        },
        {
          name: "Profiles",
          url: "/policy-controllers/#/profiles",
          type: "link",
          permission: "MANAGE_POLICY_CONTROLLER_PROFILE",
          UiType: "Administrator",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/profiles.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Plugins",
          url: "PolicyStudio/Tools/PDPPlugin",
          type: "link",
          permission: "MANAGE_PDP_PLUGIN",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/plugins.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "ICENets",
      menuType: "User Access",
      permission: ["MANAGE_ICENET"],
      items: [
        {
          name: "Status",
          url: "/services/#/icenet/status",
          type: "link",
          permission: "MANAGE_ICENET",
          UiType: "Administrator",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/status.svg`,
          imgHeight: "Small", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "Application users",
      permission: ["MANAGE_USERS", "MANAGE_DELEGATION_POLICIES"],
      menuType: "User Access",
      items: [
        {
          name: "User sources",
          url: "loginconfig/usersource",
          type: "link",
          permission: "MANAGE_USERS",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/user_sources.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Users",
          url: "Users/userlist",
          type: "link",
          permission: "MANAGE_USERS",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/user.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Groups",
          url: "Users/grouplist",
          type: "link",
          permission: "MANAGE_USERS",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/groups.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Delegation policies",
          url: "Delegations/",
          type: "link",
          permission: "MANAGE_DELEGATION_POLICIES",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/delegation-policies.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
    {
      name: "Configuration",
      permission: [
        "MANAGE_SYSTEM_CONFIGURATION",
        "MANAGE_SECURE_STORE",
        "VIEW_ENVIRONMENT_CONFIGURATION",
        "MANAGE_LOGGING_CONFIGURATION",
      ],
      menuType: "User Access",
      items: [
        {
          name: "Authentication settings",
          url: "PolicyStudio/Configuration/System",
          type: "link",
          permission: "MANAGE_SYSTEM_CONFIGURATION",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/setting.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Logging",
          url: "PolicyStudio/Configuration/Log",
          type: "link",
          permission: "MANAGE_LOGGING_CONFIGURATION",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/logging.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Key & certification",
          url: "PolicyStudio/Tools/SecureStore",
          type: "link",
          permission: "MANAGE_SECURE_STORE",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/key-certification.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
        {
          name: "Enviroment hosts",
          url: "PolicyStudio/Configuration/Environment",
          type: "link",
          permission: "VIEW_ENVIRONMENT_CONFIGURATION",
          menuType: "User Access",
          img: `${window.location.origin}/console/ui/css/img/enviroment-host.svg`,
          imgHeight: "Big", // To adjust align of the image and word
        },
      ],
    },
  ],
  appList: [
    {
      img: `${window.location.origin}/console/ui/css/img/policy-studio.svg`,
      name: "Policy Studio",
      url: "#/Dashboard",
      permission: [
        "PolicyStudio.Policies",
        "PolicyStudio.Components",
        "PolicyStudio.XacmlPolicy",
        "PolicyStudio.Enrollment",
        "PolicyStudio.PolicyModel",
        "POLICY_VALIDATOR",
      ],
      type: "PolicyStudio",
    },
    {
      img: `${window.location.origin}/console/ui/css/img/audit-and-report.svg`,
      name: "Audit and Report",
      url: "/reporter",
      type: "Reporter",
      permission: "Reporter",
    },
    {
      img: `${window.location.origin}/console/ui/css/img/system-administration.svg`,
      name: "System Administration",
      url: "/services/#/dashboard",
      type: "Administrator",
      permission: [
        "MANAGE_USERS",
        "MANAGE_ICENET",
        "MANAGE_POLICY_CONTROLLER",
        "MANAGE_POLICY_CONTROLLER_PROFILE",
        "MANAGE_PDP_PLUGIN",
        "MANAGE_DELEGATION_POLICIES",
        "MANAGE_SECURE_STORE",
        "MANAGE_LOGGING_CONFIGURATION",
        "MANAGE_SYSTEM_CONFIGURATION",
        "VIEW_ENVIRONMENT_CONFIGURATION",
      ],
    },
  ],
  routeList: [
    // Administrator
    {
      url: "policy-controllers/status",
      application: "Administrator",
    },
    {
      url: "policy-controllers/profiles",
      application: "Administrator",
    },
    {
      url: "PolicyStudio/Tools/PDPPlugin",
      application: "Administrator",
    },
    {
      url: "services/#/icenet/profiles",
      application: "Administrator",
    },
    {
      url: "loginconfig/usersource/list",
      application: "Administrator",
    },
    {
      url: "loginconfig/usersource",
      application: "Administrator",
    },
    {
      url: "Users/userlist",
      application: "Administrator",
    },
    {
      url: "Users/userlist/importuser",
      application: "Administrator",
    },
    {
      url: "Users/grouplist",
      application: "Administrator",
    },
    {
      url: "Users/grouplist/importgroup",
      application: "Administrator",
    },
    {
      url: "Delegations/",
      application: "Administrator",
    },
    {
      url: "Configuration/System",
      application: "Administrator",
    },
    {
      url: "Configuration/System/general",
      application: "Administrator",
    },
    {
      url: "Configuration/System/security",
      application: "Administrator",
    },
    {
      url: "Configuration/Log",
      application: "Administrator",
    },
    {
      url: "Tools/SecureStore",
      application: "Administrator",
    },
    {
      url: "Configuration/Environment",
      application: "Administrator",
    },

    // Audit And Report
    {
      url: "reporter",
      application: "Reporter",
    },
    {
      url: "reporter/monitors/myMonitors.jsf",
      application: "Reporter",
    },
    {
      url: "reporter/reports/auditLogReports.jsf",
      application: "Reporter",
    },
    {
      url: "reporter/monitors/myAlerts.jsf",
      application: "Reporter",
    },

    // Policy Studio
    {
      url: "Dashboard",
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/PolicyModel`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Components/Subject`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Components/Resource`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Components/Action`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Policies`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/XacmlPolicy/list`,
      application: "Policy Studio",
    },
    {
      url: `policy-validator`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/EnrollmentManagement/Property/list`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/EnrollmentManagement/Enrollments`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/EnrollmentManagement/EnrolledDataViewer`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/EnrollmentManagement/Locations/list`,
      application: "Policy Studio",
    },
    {
      url: `PolicyStudio/Tools/EnrollmentManagement/password-encryption`,
      application: "Policy Studio",
    },
    {
      url: "Tools/EnrollmentManagement/Property/list",
      application: "Policy Studio",
    },
    {
      url: "Tools/EnrollmentManagement/Enrollments",
      application: "Policy Studio",
    },
    {
      url: "Tools/EnrollmentManagement/Enrollments/create",
      application: "Policy Studio",
    },
    {
      url: "Tools/EnrollmentManagement/Locations/list",
      application: "Policy Studio",
    },
    {
      url: "Tools/EnrollmentManagement/EnrolledDataViewer",
      application: "Policy Studio",
    },
  ],
});