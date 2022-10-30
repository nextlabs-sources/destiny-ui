controlCenterConsoleApp.factory('userManualTranslateService', ['networkService', 'configService', '$timeout', function(networkService, configService, $timeout) {
    var loading = false;
    var dictionary = null;
    var translate = function(option, callback) {
        if (!option || !dictionary) {
            loadHelp(function() {
                var msg = dictionary;
                option.app && msg && (msg = msg[option.app]);
                option.section && msg && (msg = msg[option.section]);
                option.page && msg && (msg = msg[option.page]);
                option.key && msg && (msg = msg[option.key]);
                if (angular.isString(msg)) callback && callback(msg);
            });
        } else {
            var msg = dictionary;
            option.app && msg && (msg = msg[option.app]);
            option.section && msg && (msg = msg[option.section]);
            option.page && msg && (msg = msg[option.page]);
            option.key && msg && (msg = msg[option.key]);
            if (angular.isString(msg)) callback && callback(msg);
            // return msg;
        }
    }
    var pageOptionList = function(option, callback) {
        if (!dictionary) {
            loadHelp(function() {
                var pageOption = dictionary;
                option.app && pageOption && (pageOption = pageOption[option.app]);
                option.section && pageOption && (pageOption = pageOption[option.section]);
                option.page && pageOption && (pageOption = pageOption[option.page]);
                callback && callback(pageOption);
            })
            return;
        };
        var pageOption = dictionary;
        option.app && pageOption && (pageOption = pageOption[option.app]);
        option.section && pageOption && (pageOption = pageOption[option.section]);
        option.page && pageOption && (pageOption = pageOption[option.page]);
        callback && callback(pageOption);
    }
    var criteria = {}
    criteria.fields = [];
    criteria.sortFields = [];
    criteria.pageNo = 0;
    criteria.pageSize = 65535;
    var loadHelp = function(callback) {
        if (!dictionary) {
            if (loading) {
                $timeout(function() {
                    loadHelp(callback)
                }, 100);
                return;
            }
            loading = true;
            networkService.post(configService.getUrl("help"), {
                criteria: criteria
            }, function(response) {
                if (response && response.data) {
                    angular.forEach(response.data, function(helpItem) {
                        !dictionary && (dictionary = {});
                        !dictionary[helpItem.appName] && (dictionary[helpItem.appName] = {});
                        !dictionary[helpItem.appName][helpItem.module] && (dictionary[helpItem.appName][helpItem.module] = {});
                        !dictionary[helpItem.appName][helpItem.module][helpItem.sectionTitle] && (dictionary[helpItem.appName][helpItem.module][helpItem.sectionTitle] = {});
                        dictionary[helpItem.appName][helpItem.module][helpItem.sectionTitle][helpItem.field] = helpItem.helpText;
                    })
                    loading = false;
                    callback && callback();
                }
            });
        } else callback && callback();
    }
    loadHelp();
    return {
        translate: translate,
        pageOptionList: pageOptionList,
        init: loadHelp
    }
}]);