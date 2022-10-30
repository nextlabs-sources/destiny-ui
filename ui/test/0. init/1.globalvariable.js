var fields = {
  "statusCode": "1004",
  "message": "Data loaded successfully",
  "data": {
    "status": {
      "name": "status",
      "label": "Status"
    },
    "statusOptions": [{
      "name": "PENDING",
      "label": "Pending"
    }, {
      "name": "SAVED",
      "label": "Saved"
    }, {
      "name": "APPROED",
      "label": "Approved"
    }, {
      "name": "SUBMITTED",
      "label": "Submitted"
    }, {
      "name": "DEPLOYED",
      "label": "Deployed"
    }, {
      "name": "DE_ACTIVATED",
      "label": "Deactivated"
    }],
    "policyEffect": {
      "name": "effectType",
      "label": "Policy Effect"
    },
    "policyEffectOptions": [{
      "name": "ALLOW",
      "label": "Allow"
    }, {
      "name": "DENY",
      "label": "Deny"
    }],
    "modifiedDate": {
      "name": "lastUpdatedDate",
      "label": "Modified Date"
    },
    "modifiedDateOptions": [{
      "name": "PAST_7_DAYS",
      "label": "Past 7 days"
    }, {
      "name": "PAST_30_DAYS",
      "label": "Past 30 days"
    }, {
      "name": "PAST_3_MONTHS",
      "label": "Past 3 months"
    }, {
      "name": "PAST_6_MONTHS",
      "label": "Past 6 months"
    }, {
      "name": "PAST_1_YEAR",
      "label": "Past 1 Year"
    }, {
      "name": "CUSTOM",
      "label": "Custom Period"
    }],
    "moreFieldOptions": [{
      "name": "name",
      "label": "Name"
    }],
    "sort": {
      "name": "sortBy",
      "label": "Sort By"
    },
    "sortOptions": [{
      "name": "lastUpdatedDate",
      "label": "Last Updated"
    }, {
      "name": "createdDate",
      "label": "Created Date"
    }, {
      "name": "name",
      "label": "Name"
    }, {
      "name": "status",
      "label": "Status"
    }, {
      "name": "effectType",
      "label": "Policy Effect"
    }],
    "tags": {
      "name": "tags",
      "label": "Tags"
    },
    "subPolicySearch": {
      "name": "hasSubPolicies",
      "label": "Include Sub Policies "
    }
  }
}
var tags = {
  "statusCode": "1003",
  "message": "Data found successfully",
  "data": [{
    "id": 654,
    "key": "name",
    "label": "TAG-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 655,
    "key": "name",
    "label": "ITAR",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 656,
    "key": "name",
    "label": "TAG-B",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 657,
    "key": "name",
    "label": "ITAR",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 659,
    "key": "name",
    "label": "ITAR-1",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 658,
    "key": "name",
    "label": "ITAR-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 660,
    "key": "name",
    "label": "ITAR-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 655,
    "key": "name",
    "label": "TAG-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 656,
    "key": "name",
    "label": "TAG-C",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 657,
    "key": "name",
    "label": "ITAR",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 659,
    "key": "name",
    "label": "ITAR-1",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 658,
    "key": "name",
    "label": "ITAR-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }, {
    "id": 660,
    "key": "name",
    "label": "ITAR-A",
    "type": "POLICY_TAG",
    "status": "ACTIVE"
  }],
  "startFrom": 0,
  "pageSize": -1,
  "totalNoOfRecords": 7
};

var savedSearch = {
  "statusCode": "1003",
  "message": "Data found successfully",
  "data": [{
    "id": 1420,
    "name": "All Allow Policy",
    "desc": "All Allow Policy",
    "criteria": {
      "fields": [{
        "field": "effectType",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["ALLOW"]
        }
      }],
      "sortFields": [],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 1421,
    "name": "All Deny Policy with name 'test'",
    "desc": "All Deny Policy with name 'test'",
    "criteria": {
      "fields": [{
        "field": "effectType",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["DENY"]
        }
      }, {
        "field": "text",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "test"
        }
      }],
      "sortFields": [],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 1524,
    "name": "All Allow Policy",
    "desc": "All Allow Policy",
    "criteria": {
      "fields": [{
        "field": "effectType",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["ALLOW"]
        }
      }, {
        "field": "hasSubPolicies",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "true"
        }
      }],
      "sortFields": [{
        "field": "lastUpdatedDate",
        "order": "DESC"
      }],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 1525,
    "name": "all Allow with name test",
    "desc": "all Allow with name test",
    "criteria": {
      "fields": [{
        "field": "effectType",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["ALLOW"]
        }
      }, {
        "field": "name",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "test"
        }
      }, {
        "field": "hasSubPolicies",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "true"
        }
      }],
      "sortFields": [{
        "field": "lastUpdatedDate",
        "order": "DESC"
      }],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 2028,
    "name": "All Approved with word 'test'",
    "desc": "All Approved with word 'test'",
    "criteria": {
      "fields": [{
        "field": "status",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["APPROVED"]
        }
      }, {
        "field": "",
        "type": "TEXT",
        "nestedField": null,
        "value": {
          "type": "Text",
          "value": "TEST",
          "fields": ["name", "desc"]
        }
      }, {
        "field": "hasSubPolicies",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "true"
        }
      }],
      "sortFields": [{
        "field": "lastUpdatedDate",
        "order": "DESC"
      }],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 2029,
    "name": "All Approved with word 'test'",
    "desc": "All Approved with word 'test'",
    "criteria": {
      "fields": [{
        "field": "status",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["APPROVED"]
        }
      }, {
        "field": "",
        "type": "TEXT",
        "nestedField": null,
        "value": {
          "type": "Text",
          "value": "TEST",
          "fields": ["name", "desc"]
        }
      }, {
        "field": "hasSubPolicies",
        "type": "SINGLE",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": "true"
        }
      }],
      "sortFields": [{
        "field": "lastUpdatedDate",
        "order": "DESC"
      }],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }, {
    "id": 2496,
    "name": "all allow with 'test'",
    "desc": "all allow with 'test'",
    "criteria": {
      "fields": [{
        "field": "effectType",
        "type": "MULTI",
        "nestedField": null,
        "value": {
          "type": "String",
          "value": ["ALLOW"]
        }
      }, {
        "field": "",
        "type": "TEXT",
        "nestedField": null,
        "value": {
          "type": "Text",
          "value": "test",
          "fields": ["name", "desc"]
        }
      }],
      "sortFields": [],
      "columns": [],
      "pageNo": 0,
      "pageSize": 10
    },
    "status": "ACTIVE",
    "sharedMode": "PUBLIC",
    "userIds": []
  }],
  "pageNo": 0,
  "pageSize": 10,
  "totalPages": 1,
  "totalNoOfRecords": 7
}
var policyList = {
  "statusCode": "1004",
  "message": "Data loaded successfully",
  "data": [{
    "id": 981111,
    "name": "COMM_SUB_POLICY_2",
    "policyFullName": "TEST/TEST_COMM_POLICY/COMM_SUB_POLICY/COMM_SUB_POLICY_2",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451368531348,
    "hasParent": true,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": {
      "id": 977,
      "policyFullName": "TEST/TEST_COMM_POLICY/COMM_SUB_POLICY",
      "name": "COMM_SUB_POLICY",
      "parent": true
    },
    "subPolicies": []
  }, {
    "id": 980,
    "name": "TEST_COMM_POLICY",
    "policyFullName": "TEST/TEST_COMM_POLICY",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451368450379,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [{
      "id": null,
      "key": "COMM_POLICY_TAG",
      "label": "URGENT",
      "type": "POLICY_TAG",
      "status": "ACTIVE"
    }, {
      "id": null,
      "key": "COMM_POLICY_FLAG",
      "label": "FLAGGED",
      "type": "POLICY_TAG",
      "status": "ACTIVE"
    }],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 979,
    "name": "TEST_RENAME",
    "policyFullName": "TEST/TEST_RENAME",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451368033072,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 977,
    "name": "COMM_SUB_POLICY",
    "policyFullName": "TEST/TEST_COMM_POLICY/COMM_SUB_POLICY",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451367402770,
    "hasParent": true,
    "hasSubPolicies": true,
    "tags": [],
    "parentPolicy": {
      "id": 980,
      "policyFullName": "TEST/TEST_COMM_POLICY",
      "name": "TEST_COMM_POLICY",
      "parent": true
    },
    "subPolicies": [{
      "id": 981,
      "policyFullName": "TEST/TEST_COMM_POLICY/COMM_SUB_POLICY/COMM_SUB_POLICY_2",
      "name": "COMM_SUB_POLICY_2"
    }]
  }, {
    "id": 948,
    "name": "DYNAMIC_ACCESS_CONTROL_SUBPOLICY",
    "policyFullName": "TEST/TEST_DYNAMIC_ACCESS_CONTROL_POLICY/DYNAMIC_ACCESS_CONTROL_SUBPOLICY",
    "description": null,
    "status": "EMPTY",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451363315567,
    "hasParent": true,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": {
      "id": 947,
      "policyFullName": "TEST/TEST_DYNAMIC_ACCESS_CONTROL_POLICY",
      "name": "TEST_DYNAMIC_ACCESS_CONTROL_POLICY",
      "parent": true
    },
    "subPolicies": []
  }, {
    "id": 909,
    "name": "TEST_SUB_POLICY_Q3",
    "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICY_Q3",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1451359091692,
    "hasParent": true,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": {
      "id": 665,
      "policyFullName": "TEST/TEST_DENY_POLICY",
      "name": "TEST_DENY_POLICY",
      "parent": true
    },
    "subPolicies": []
  }, {
    "id": 895,
    "name": "test_sub_allow_3",
    "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICYQ/TEST_SUB_POLICY_2/test_sub_allow_3",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254446,
    "createdDate": 1451285418536,
    "hasParent": true,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": {
      "id": 889,
      "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICYQ/TEST_SUB_POLICY_2",
      "name": "TEST_SUB_POLICY_2",
      "parent": true
    },
    "subPolicies": []
  }, {
    "id": 665,
    "name": "TEST_DENY_POLICY",
    "policyFullName": "TEST/TEST_DENY_POLICY",
    "description": null,
    "status": "DRAFT",
    "effectType": "allow",
    "lastUpdatedDate": 1452494238290,
    "createdDate": 1447920160484,
    "hasParent": false,
    "hasSubPolicies": true,
    "tags": [{
      "id": null,
      "key": "DOC_POLICY_TAG",
      "label": "ITAR",
      "type": "POLICY_TAG",
      "status": "ACTIVE"
    }],
    "parentPolicy": null,
    "subPolicies": [{
      "id": 888,
      "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICYQ",
      "name": "TEST_SUB_POLICYQ"
    }, {
      "id": 908,
      "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICY_Q2",
      "name": "TEST_SUB_POLICY_Q2"
    }, {
      "id": 909,
      "policyFullName": "TEST/TEST_DENY_POLICY/TEST_SUB_POLICY_Q3",
      "name": "TEST_SUB_POLICY_Q3"
    }]
  }, {
    "id": 599,
    "name": "P9",
    "policyFullName": "Perf/P9",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486370,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 596,
    "name": "P6",
    "policyFullName": "Perf/P6",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486354,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 597,
    "name": "P7",
    "policyFullName": "Perf/P7",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486354,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 598,
    "name": "P8",
    "policyFullName": "Perf/P8",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486354,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 592,
    "name": "P2",
    "policyFullName": "Perf/P2",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486339,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 593,
    "name": "P3",
    "policyFullName": "Perf/P3",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486339,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 594,
    "name": "P4",
    "policyFullName": "Perf/P4",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486339,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 595,
    "name": "P5",
    "policyFullName": "Perf/P5",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486339,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 590,
    "name": "P0",
    "policyFullName": "Perf/P0",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486323,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }, {
    "id": 591,
    "name": "P1",
    "policyFullName": "Perf/P1",
    "description": null,
    "status": "APPROVED",
    "effectType": "allow",
    "lastUpdatedDate": 1452153254477,
    "createdDate": 1447841486323,
    "hasParent": false,
    "hasSubPolicies": false,
    "tags": [],
    "parentPolicy": null,
    "subPolicies": []
  }],
  "pageNo": 0,
  "pageSize": 20,
  "totalPages": 1,
  "totalNoOfRecords": 18
}