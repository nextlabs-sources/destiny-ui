let values = [
    {
        id: 1,
        version: 0,
        name: "enroll.users",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 2,
        version: 0,
        name: "server",
        type: "ST",
        value: "qapf1-ad02.qapf1.qalab01.nextlabs.com",
        enrollmentId: 1
    },
    {
        id: 3,
        version: 0,
        name: "contact.string.lastname",
        type: "ST",
        value: "sn",
        enrollmentId: 1
    },
    {
        id: 4,
        version: 0,
        name: "delete.inactive.group.members",
        type: "ST",
        value: "false",
        enrollmentId: 1
    },
    {
        id: 5,
        version: 0,
        name: "login",
        type: "ST",
        value: "Administrator@qapf1.qalab01.nextlabs.com",
        enrollmentId: 1
    },
    {
        id: 6,
        version: 0,
        name: "entry.attributefor.staticid",
        type: "ST",
        value: "objectGUID",
        enrollmentId: 1
    },
    {
        id: 7,
        version: 0,
        name: "contact.multi-string.mail",
        type: "ST",
        value: "proxyAddresses",
        enrollmentId: 1
    },
    {
        id: 8,
        version: 0,
        name: "computer.string.dnsname",
        type: "ST",
        value: "dnsHostName",
        enrollmentId: 1
    },
    {
        id: 9,
        version: 0,
        name: "password",
        type: "ST",
        value: "sa1f78f49e437288039751654ece96ede",
        enrollmentId: 1
    },
    {
        id: 10,
        version: 0,
        name: "group.attributefor.enumeration",
        type: "ST",
        value: "member",
        enrollmentId: 1
    },
    {
        id: 11,
        version: 0,
        name: "user.string.displayname",
        type: "ST",
        value: "name",
        enrollmentId: 1
    },
    {
        id: 12,
        version: 0,
        name: "contact.string.principalname",
        type: "ST",
        value: "mail",
        enrollmentId: 1
    },
    {
        id: 13,
        version: 0,
        name: "contact.string.firstname",
        type: "ST",
        value: "firstName",
        enrollmentId: 1
    },
    {
        id: 14,
        version: 0,
        name: "enroll.computers",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 15,
        version: 0,
        name: "user.string.lastname",
        type: "ST",
        value: "sn",
        enrollmentId: 1
    },
    {
        id: 16,
        version: 0,
        name: "other.requirements",
        type: "ST",
        value: "(|(objectClass=serviceConnectionPoint)(objectClass=connectionPoint))",
        enrollmentId: 1
    },
    {
        id: 17,
        version: 0,
        name: "user.string.principalname",
        type: "ST",
        value: "userPrincipalName",
        enrollmentId: 1
    },
    {
        id: 18,
        version: 0,
        name: "user.cs-string.windowssid",
        type: "ST",
        value: "objectSid",
        enrollmentId: 1
    },
    {
        id: 19,
        version: 0,
        name: "contact.requirements",
        type: "ST",
        value: "objectClass=contact",
        enrollmentId: 1
    },
    {
        id: 20,
        version: 0,
        name: "user.requirements",
        type: "ST",
        value: "(&(objectClass=user)(!(objectClass=computer)))",
        enrollmentId: 1
    },
    {
        id: 21,
        version: 0,
        name: "user.string.firstname",
        type: "ST",
        value: "givenName",
        enrollmentId: 1
    },
    {
        id: 22,
        version: 0,
        name: "application.string.uniquename",
        type: "ST",
        value: "uniqueName",
        enrollmentId: 1
    },
    {
        id: 23,
        version: 0,
        name: "roots",
        type: "SA",
        value: ":ou=presidents, dc=qapf1,dc=qalab01,dc=nextlabs,dc=com:",
        enrollmentId: 1
    },
    {
        id: 24,
        version: 0,
        name: "enroll.groups",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 25,
        version: 0,
        name: "store.missing.attributes",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 26,
        version: 0,
        name: "secure.transport.mode",
        type: "ST",
        value: null,
        enrollmentId: 1
    },
    {
        id: 27,
        version: 0,
        name: "filter",
        type: "ST",
        value: "objectclass=*",
        enrollmentId: 1
    },
    {
        id: 28,
        version: 0,
        name: "computer.cs-string.windowssid",
        type: "ST",
        value: "objectSid",
        enrollmentId: 1
    },
    {
        id: 29,
        version: 0,
        name: "user.multi-string.mail",
        type: "ST",
        value: "proxyAddresses",
        enrollmentId: 1
    },
    {
        id: 30,
        version: 0,
        name: "port",
        type: "NM",
        value: "389",
        enrollmentId: 1
    },
    {
        id: 31,
        version: 0,
        name: "always.trust.ad",
        type: "ST",
        value: "false",
        enrollmentId: 1
    },
    {
        id: 32,
        version: 0,
        name: "enroll.contacts",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 33,
        version: 0,
        name: "application.requirements",
        type: "ST",
        value: "objectClass=Application",
        enrollmentId: 1
    },
    {
        id: 34,
        version: 0,
        name: "structure.requirements",
        type: "ST",
        value: "(|(objectClass=organizationalUnit)(objectClass=domain)(objectClass=container))",
        enrollmentId: 1
    },
    {
        id: 35,
        version: 0,
        name: "scheduledsyncinterv",
        type: "NM",
        value: "0",
        enrollmentId: 1
    },
    {
        id: 36,
        version: 0,
        name: "contact.string.displayname",
        type: "ST",
        value: name,
        enrollmentId: 1
    },
    {
        id: 37,
        version: 0,
        name: "group.requirements",
        type: "ST",
        value: "objectClass=Group",
        enrollmentId: 1
    },
    {
        id: 38,
        version: 0,
        name: "computer.requirements",
        type: "ST",
        value: "objectClass=computer",
        enrollmentId: 1
    },
    {
        id: 39,
        version: 0,
        name: "enableaddirchgreplication",
        type: "ST",
        value: "false",
        enrollmentId: 1
    },
    {
        id: 40,
        version: 0,
        name: "ispagingenabled",
        type: "ST",
        value: "true",
        enrollmentId: 1
    },
    {
        id: 41,
        version: 0,
        name: "enroll.applications",
        type: "ST",
        value: "true",
        enrollmentId: 1
    }
]