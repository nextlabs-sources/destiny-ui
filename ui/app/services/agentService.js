controlCenterConsoleApp.factory('agentService', ['networkService', 'configService', '$q',
    function (networkService, configService, $q) {
        var findAgents = function (types, value) {
            var deferred = $q.defer();
            networkService.get(configService.getUrl("agent.find"),
                function (data) {
                    deferred.resolve(data);
                },
                null,
                {
                    value: value,
                    type: types
                });
            return deferred.promise
        }
        return {
            findAgents: findAgents,
        }
    }
]);