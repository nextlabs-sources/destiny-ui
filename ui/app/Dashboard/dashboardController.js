dashboardApp.controller('dasboardController',
  ['$scope', 'networkService', 'configService', 'loggerService', '$location', '$state', '$rootScope','dashboardService', '$filter','$window', '$timeout', '$state', 'userService', 'versionService','constants',
  function($scope, networkService, configService, loggerService, $location, $state, $rootScope,dashboardService, $filter, $window, $timeout, $state, userService, versionService, constants) {
  	var timeoutForChart = 300;
  	var defaultRefreshInterval = 30;
    var logger = loggerService.getLogger();
    var systemConfigTimeout;
    var activityStreamTimeout;
    var enrollmentDetailsTimeout;
    var policySummaryStatusTimeout;
    $scope.requestChart = {};
  	$scope.pdpChart = {};
  	$scope.numOfMonitors = "";
    $scope.menuAccess = null;
    $scope.loadingWidgets = [];
    $scope.dashboardWidgetConfig = [];
    $scope.showed = false;
    $scope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams){
          systemConfigTimeout && clearTimeout(systemConfigTimeout);
          activityStreamTimeout && clearTimeout(activityStreamTimeout);
          enrollmentDetailsTimeout && clearTimeout(enrollmentDetailsTimeout);
          policySummaryStatusTimeout && clearTimeout(policySummaryStatusTimeout);
        })
    configService.getUIConfigs().then(function (uiConfig) {
      $scope.dashboardWidgetConfig = uiConfig;
    });
    var setMenuAccess = function(){
      $scope.menuAccess = {
        'PolicyStudio' : {},
        'PolicyStudio.Policies' : {},
        'PolicyStudio.Components' : {},
        'PolicyStudio.PolicyModel' : {},
        'DelegatedAdministration':{},
        'PolicyStudio.SecureStore': {},
        'PolicyStudio.XacmlPolicy': {},
        'PolicyStudio.RemoteEnvironment':{},
        'PolicyStudio.PDPPlugin':{},
        'PolicyStudio.SysConfiguration': {},
        'PolicyStudio.LogConfiguration': {}
      }
      angular.forEach($scope.menuAccess, function(obj,menu) {
        userService.getMenuAccess(menu, function(accessible) {
            $scope.menuAccess[menu].menuAccessible = accessible;
            $scope.menuAccess[menu].dynaAttr = accessible ? [] : userService.defaultMenuAccessibleBehavior
             //// console.log($scope.menuAccess);
             if (menu == "PolicyStudio.XacmlPolicy") {
               $scope.menuAccess[menu].menuAccessible =
                 $scope.checkUserAccess("XACML_POLICY");
               $scope.menuAccess[menu].dynaAttr = $scope.checkUserAccess(
                 "XACML_POLICY"
               )
                 ? []
                 : userService.defaultMenuAccessibleBehavior;
             }
        });
      })
    }
    $scope.appAccess = null;
    userService.getFullAppAccess(function(appAccess) {
      $scope.appAccess = {};
      for(var i in appAccess) {
        $scope.appAccess[i] = {};
        $scope.appAccess[i].result = appAccess[i];
        $scope.appAccess[i].dynaAttr = appAccess[i] ? [] : userService.defaultMenuAccessibleBehavior;
      }
      setMenuAccess();
    });

    // get dashboard config
    var dashboardConfig = $scope.dashboardConfig = configService.configObject.dashboard;
    var showNoDataMask = $scope.showNoDataMask = dashboardConfig.showNoDataMask;
    logger.log('showNoDataMask', showNoDataMask)
    var showDummyDataIfMissing = true;
    var getDateNDaysAgo = function(n) {
      var from = new Date();
      from.setDate(from.getDate() - n);
      from.setHours(0);
      from.setMinutes(0);
      from.setSeconds(0);
      return from;
    }

    // widget: policy status
    $scope.policyStatusStat = null;
    var setPolicyStatusStat = function (uiConfig) {
      dashboardService.getPolicyStatusChart(function (response) {
        if (!$scope.policyStatusStat) {
          $scope.policyStatusStat = {};
        }
        for (var obj in response.data.results) {
          $scope.policyStatusStat[response.data.results[obj].term] = response.data.results[obj].count;
        }
        $scope.policyStatusStat['TOTAL'] = ($scope.policyStatusStat["DRAFT"] || 0) + ($scope.policyStatusStat["DEPLOYED"] || 0) + ($scope.policyStatusStat["UNDEPLOYED"] || 0);
        var to = new Date();
        var from = new Date();
        from.setDate(from.getDate() - 7);
        dashboardService.getPolicyStatusChartPeriod(from, to, function (response) {
          if (!$scope.policyStatusStat.lastweek) {
            $scope.policyStatusStat.lastweek = {};
          }
          for (var obj in response.data.results) {
            $scope.policyStatusStat.lastweek[response.data.results[obj].term] = response.data.results[obj].count;
          }
          $scope.policyStatusStat.lastweek['TOTAL'] = ($scope.policyStatusStat.lastweek["DRAFT"] || 0)
              + ($scope.policyStatusStat.lastweek["DEPLOYED"] || 0) + ($scope.policyStatusStat.lastweek["UNDEPLOYED"] || 0);
        });
        policySummaryStatusTimeout = setTimeout(function(){ setPolicyStatusStat(uiConfig) },
            (uiConfig['dashboard.widget.refresh.interval'] || defaultRefreshInterval) * 1000);
      });
    }


    //Check if user can access the menu or not
    $scope.checkUserAccess = function (permission) {
      if (permission == "AUTHORISED"){
        return true;
      }
        return userService.checkUserMenuAccess(permission);
    };

    $scope.handleApplicationPermision = function (applicationDetails) {
      let allowed = false;
      if (applicationDetails.type == "Reporter") {
        allowed = $scope.appAccess[applicationDetails.permission].result;
      } else if (applicationDetails.type == "Administrator") {
        applicationDetails.permission.forEach((details) => {
          if ($scope.checkUserAccess(details)) {
            allowed = true;
          }
        });
      } else {
        applicationDetails.permission.forEach((detail) => {
          if (
            $scope.menuAccess[detail] &&
            $scope.menuAccess[detail].menuAccessible
          ) {
            allowed = true;
          }

          if ($scope.checkUserAccess(detail)) {
            allowed = true;
          }
        });
      }

      return allowed;
    };

    configService.getUIConfigs().then(function (uiConfig) {

      dashboardConfig.enablePolicyStatusChart && setPolicyStatusStat(uiConfig);
    });

    // widget: alert
    $scope.alertChartD3 = {
      options: {
        chart: {
          type: 'discreteBarChart',
          height: 220,
          margin : {
              top: 20,
              right: 20,
              bottom: 20,
              left: 30
          },
          x: function(d){
            return d.label;
          },
          color: function() {
            return '#35AA8F'
          },
          showYAxis: true,
          y: function(d){
            return d.value;
          },
          yAxis: {
            tickFormat: function(d){
                return d3.format(',.0f')(d);
            }
          },
          valueFormat: d3.format(',.0f'),
          showValues: true,
          duration: 500,
          xAxis: {
              // axisLabel: 'X Axis'
          }
        }
      },
      data: [{
          values: []
        }],
      noData: showNoDataMask
    }    
    var alertDate = getDateNDaysAgo(6);
    if(showDummyDataIfMissing) for(var i = 1; i < 8; i++) {
      var count = parseInt(100 * Math.random());
      $scope.alertChartD3.data[0].values.push({
        label: $filter('date')(alertDate, 'dd MMM yy'),
        value: count
      })
      alertDate.setDate(alertDate.getDate() + 1)
    }
    
    $scope.handleUserAccess = function() {
      //Check Application Permission
      let applicationDetails = constants.appList.find(
        (app) => app.name == "Policy Studio"
      );
      let isAppAllowed = $scope.handleApplicationPermision(applicationDetails);

      if (!isAppAllowed) {

        return false;
      }
      return true;
    }
    var setAlertChartD3 = function() {
      var now = new Date();
      var from = getDateNDaysAgo(6);
      $scope.loadingWidgets.push("AlertChart");
      dashboardService.getAlertChart(from, now, 'DAYS', function(response){
        let indexToRemove = $scope.loadingWidgets.indexOf("AlertChart");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        var value = [];
        var hasData = false;
        for(key in response.data.results){
          var count = 0;
          angular.forEach(response.data.results[key], function(alert) {
            count = alert.count;
            count > 0 && (hasData = true)
          })
          var v = {};
          v.label = $filter('date')(key, 'ddMMMyy');
          // v.color = '#FF9999';
          v.value = count;
          value.push(v);
        }
        if(hasData) {
          $scope.alertChartD3.data[0].values = value;
          $scope.alertChartD3.noData = false;
        }
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess(); 

      if(!isAllowed) {
        
        if(!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return 
      }
      dashboardConfig.enableAlertChart && uiConfig['dashboard.widget.activity-alerts.enabled'] == 'true' && setAlertChartD3();
    });
    // widget: PDP throughput
    $scope.throughputTotal = 0;
    $scope.throughputD3 = {
      options: {
        chart: {
          type: 'discreteBarChart',
          // type: 'multiBarChart',
          height: 180,
          margin : {
              top: 20,
              right: 20,
              bottom: 15,
              left: 25
          },
          x: function(d){
            return d.label;
          },
          // staggerLabels: true,
          reduceXTicks: true,
          color: function() {
            return '#34B5E0'
          },
          showYAxis: true,
          y: function(d){
            return d.value;
          },
          valueFormat: d3.format(',.0f'),
          // xRange : [1,2,3,4,5],
          // xScale: d3.linear(0.5),          
          duration: 500,
          xAxis: {
            tickSubdivide   : [2]
          },
          yAxis: {
            tickFormat: function(d){
                return d3.format(',.0f')(d);
            }
          }
        }
      },
      data: [{
          values: null
        }],
      noData: showNoDataMask
    }
    var now = new Date();
    now.setHours(now.getHours() - 23);
    now.setMinutes(0);
    now.setSeconds(0);
    if(showDummyDataIfMissing) {
      var d3Data = [];
      $scope.throughputTotal = 0;
      for(var i = 1; i < 25; i++) {
          var count = parseInt(100 * Math.random());
          $scope.throughputTotal += count;
          var label = $filter('date')(now, 'HH:mm');
          d3Data.push({
            label: label,
            value: count
          })
          now.setHours(now.getHours() + 1);
        }
        $scope.throughputD3.data[0].values = d3Data;
      }
    var setThroughputD3 = function() {
      var now = new Date();
      var from = new Date();
      from.setHours(from.getHours() - 23);
      from.setMinutes(0);
      from.setSeconds(0);
      $scope.loadingWidgets.push("PdpThroughput");
      dashboardService.getPdpThroughput(from, now, 'HOURS', function(response){
        let indexToRemove = $scope.loadingWidgets.indexOf("PdpThroughput");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        var d3Data = [], hasData = false, total = 0;
        for(key in response.data.results){
          var value = response.data.results[key].count;
          value && (hasData = true);
          total += value;
          d3Data.push({
            label: $filter('date')(key, 'HH:mm'),
            value: value
          })
        }
        if(hasData) {
          $scope.throughputD3.data[0].values = d3Data;
          $scope.throughputD3.noData = false;
          $scope.throughputD3.total = total;
          $scope.throughputTotal = total;
        }
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      dashboardConfig.enableThroughput && uiConfig['dashboard.widget.pdp-throughput.enabled'] == 'true' && setThroughputD3();
    });

    // widget: PDP status & IceNet status
    $scope.pdpTotal = 0;
    $scope.pdpLegend = [];
    $scope.iceNetTotal = 0;
    var pdpMetaInfo = {
      'active_pdps': {
        color: '#35AA8F',
        title: 'active PDPs'
      }, 'failed_pdps': {
        color: '#E2413E',
        title: 'heartbeat failed'
      }, 'bundle_update_success': {
        color: '#2FCBFF',
        title: 'PDPs up to date'
      }, 'bundle_update_failed': {
        color: '#999999',
        title: 'PDPs not up to date'
      }, 
    }
    $scope.iceNetLegend = [{
      color: '#118D9A',
      title: 'active IceNets',
      style: {
        'background-color': '#118D9A'
      },
      contentStyle: {
        color: '#118D9A',
      }
    }, {
      color: '#E2413E',
      title: 'heartbeat failed',
      style: {
        'background-color': '#E2413E'
      },
      contentStyle: {
        color: '#E2413E',
      }
    }]
    angular.forEach(pdpMetaInfo, function(info) {
      $scope.pdpLegend.push({
        color: info.color,
        title: info.title,
        style: {
          'background-color': info.color
        },
        contentStyle: {
          'color': info.color,
        }
      })
    });
    $scope.pdpStatD3Inner = {
      options: {
        chart: {
            type: 'pieChart',
            height: 222,
            margin : {
              top: 25,
              left: -75
            },
            x: function(d){return d.key;},
            y: function(d){return d.y;},
            valueFormat: d3.format(',.0f'),
            color: ['#35AA8F', '#E2413E'],
            showLabels: false,
            showLegend: false,
            growOnHover: false,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            donut: true,
            donutRatio: 0.45,
        }
      },
      data: [],
      noData: showNoDataMask
    }
    $scope.pdpStatD3Outer = {
      options: {
        chart: {
            type: 'pieChart',
            height: 255,
            margin : {
              top: -10,
              left: -105
            },
            x: function(d){return d.key;},
            y: function(d){return d.y;},
            valueFormat: d3.format(',.0f'),
            color: ['#2FCBFF', '#999999'],
            showLabels: false,
            showLegend: false,
            growOnHover: false,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            donut: true,
            donutRatio: 0.57,
        }
      },
      data: [],
      noData: showNoDataMask
    }
    $scope.iceNetStatD3 = {
      options: {
        chart: {
            type: 'pieChart',
            height: 255,
            margin : {
              top: -10,
              left: -70
            },
            x: function(d){return d.key;},
            y: function(d){return d.y;},
            valueFormat: d3.format(',.0f'),
            color: ['#118D9A', '#E2413E'],
            showLabels: false,
            showLegend: false,
            growOnHover: false,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            // legendPosition: 'right',
            donut: true,
            donutRatio: 0.55,
            legend: {
                updateState: false,
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
      },
      data: [],
      noData: showNoDataMask
    }
    if(showDummyDataIfMissing) {
      var active_pdps = parseInt(100 * (0.5 + Math.random() * 0.5));
      var failed_pdps = parseInt(100 * (0.3 + Math.random() * 0.2));
      var total = active_pdps + failed_pdps;
      var bundle_update_success = parseInt(active_pdps * (0.5 + Math.random() * 0.5));
      var bundle_update_failed = total - bundle_update_success;
      $scope.pdpTotal = total;
      $scope.pdpLegend[0].count = active_pdps;
      $scope.pdpLegend[1].count = failed_pdps;
      $scope.pdpLegend[2].count = bundle_update_success;
      $scope.pdpLegend[3].count = bundle_update_failed;
      var failCount = parseInt(100 * (0.3 + Math.random() * 0.2));
      var activeCount = parseInt(100 * (0.5 + Math.random() * 0.5))
      $scope.iceNetTotal = failCount + activeCount;
      $scope.iceNetLegend[0].count = activeCount;
      $scope.iceNetLegend[1].count = failCount;
      $scope.pdpStatD3Inner.data.push({key: pdpMetaInfo['active_pdps'].title, y: active_pdps});
      $scope.pdpStatD3Inner.data.push({key: pdpMetaInfo['failed_pdps'].title, y: failed_pdps});
      $scope.pdpStatD3Outer.data.push({key: pdpMetaInfo['bundle_update_success'].title, y: bundle_update_success});
      $scope.pdpStatD3Outer.data.push({key: pdpMetaInfo['bundle_update_failed'].title, y: bundle_update_failed});
      $scope.iceNetStatD3.data.push({key: 'active IceNets'.title, y: activeCount});
      $scope.iceNetStatD3.data.push({key: 'heartbeat failed', y: failCount});
      // logger.log($scope.iceNetStatD3.data)
    }
    var setIceNetStatD3 = function(response) {
      var failCount = response.data.ice_net_summary.failed_icenets;
      var activeCount = response.data.ice_net_summary.active_icenets;
      var data = [{key: 'active IceNets', y: activeCount}, {key: 'heartbeat failed', y: failCount}];
      var iceNetTotal = failCount + activeCount;
      if(iceNetTotal) {
        $scope.iceNetTotal = iceNetTotal;
        $scope.iceNetStatD3.noData = false;
        $scope.iceNetStatD3.data = data;
        $scope.iceNetLegend[0].count = activeCount;
        $scope.iceNetLegend[1].count = failCount;
      }
    }
    var setSystemConfigD3 = function(uiConfig) {
      $scope.loadingWidgets.push("SystemConfigStatus");
      dashboardService.getSystemConfigStatus(function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("SystemConfigStatus");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        versionService.installMode(function(installMode) {
          if('SAAS' != installMode.data) setIceNetStatD3(response);
        });
        var hasData = false;
        var active_pdps = response.data.pdp_config_summary.active_pdps;
        var failed_pdps = response.data.pdp_config_summary.failed_pdps;
        var total = active_pdps + failed_pdps;
        var bundle_update_success = response.data.pdp_config_summary.bundle_update_success;
        var bundle_update_failed = total - bundle_update_success;
        total && (hasData = true);
        if(hasData) {
          $scope.pdpStatD3Inner.noData = false;
          $scope.pdpStatD3Inner.data = [];
          $scope.pdpStatD3Outer.data = [];
          $scope.pdpStatD3Inner.data.push({key: pdpMetaInfo['active_pdps'].title, y: active_pdps});
          $scope.pdpStatD3Inner.data.push({key: pdpMetaInfo['failed_pdps'].title, y: failed_pdps});
          $scope.pdpStatD3Outer.data.push({key: pdpMetaInfo['bundle_update_success'].title, y: bundle_update_success});
          $scope.pdpStatD3Outer.data.push({key: pdpMetaInfo['bundle_update_failed'].title, y: bundle_update_failed});
          $scope.pdpTotal = total;
          $scope.pdpLegend[0].count = active_pdps;
          $scope.pdpLegend[1].count = failed_pdps;
          $scope.pdpLegend[2].count = bundle_update_success;
          $scope.pdpLegend[3].count = bundle_update_failed;
        }
        systemConfigTimeout = setTimeout( function() { setSystemConfigD3(uiConfig) },
            (uiConfig['dashboard.widget.refresh.interval'] || defaultRefreshInterval) * 1000);
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      dashboardConfig.enableSystemConfig && uiConfig['dashboard.widget.system-configuration-status.enabled'] == 'true' && setSystemConfigD3(uiConfig);
    });

    // widget: system details
    $scope.sysDetails = null;
    var setSysDetails = function() {
      $scope.loadingWidgets.push("SystemDetails");
      dashboardService.getSystemDetails(function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("SystemDetails");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        $scope.sysDetails = response.data;
        if($scope.sysDetails.pdp_sys_info) {
          $scope.sysDetails.pdp_sys_info_summary = {
            count: $scope.sysDetails.pdp_sys_info.length,
            vcpu: $scope.sysDetails.pdp_sys_info[0].vcpu
          }
          // var vcpuTotal = 0, vcpuIdentical = true;
          // angular.forEach($scope.sysDetails.pdp_sys_info, function(pdp) {
          //   vcpuTotal += pdp.vcpu;
          //   if(pdp.vcpu != $scope.sysDetails.pdp_sys_info[0].vcpu) vcpuIdentical = false;
          // })
          // if(!vcpuIdentical) $scope.sysDetails.pdp_sys_info_summary.vcpuTotal = vcpuTotal;
        }
      })
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      dashboardConfig.enableSystemDetail && uiConfig['dashboard.widget.system-details.enabled'] == 'true' && setSysDetails();
    });

    // widget: user activities - allow
    $scope.userAllowActivitiesD3 = {
      options: {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 280,
            duration: 250,
            x: function(d){return d.label.length > 9 ? (d.label.substring(0, 6) + '...') : d.label;},
            y: function(d){return d.value;},
            valueFormat: d3.format(',.0f'),
            color: ['#A5CE84'],
            //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
            showControls: false,
            legend: {
              rightAlign: false
            },
            reduceXTicks: false,
            groupSpacing: 0.4,
            showLegend: true,
            showValues: false,
            duration: 500,
            xAxis: {
                // showMaxMin: false
                orient: 'left',
            },
            // showYAxis: true,
            showXAxis: true,
            yAxis: {
              tickFormat: function(d){
                  return parseInt(d);
              }
            },
            tooltip: {
              contentGenerator: function(obj) {
                return '<table><thead><tr><td colspan="3"><strong class="x-value">' + obj.data.label.substring(obj.data.index == 10 ? 3 : 2).trim() + '</strong></td></tr></thead><tbody><tr><td class="legend-color-guide"><div style="background-color: ' + obj.color + ';"></div></td><td class="key">Allow activities</td><td class="value">' + obj.data.value + '</td></tr></tbody></table>'
                // return JSON.stringify(obj);
              }
            }
        }
      },
      data: [{
        key: 'Allow activities',
        color: '#86AA3F',
      }],
      noData: showNoDataMask
    };
    // widget:  user activities - deny
    $scope.userDenyActivitiesD3 = {
      options: {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 280,
            duration: 250,
            x: function(d){return d.label.length > 9 ? (d.label.substring(0, 6) + '...') : d.label;},
            y: function(d){return d.value;},
            valueFormat: d3.format(',.0f'),
            color: ['#A5CE84'],
            //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
            showControls: false,
            reduceXTicks: false,
            groupSpacing: 0.4,
            showLegend: true,
            legend: {
              rightAlign: false
            },
            showValues: false,
            duration: 500,
            xAxis: {
                // showMaxMin: false
            },
            showYAxis: true,
            yAxis: {
              tickFormat: function(d){
                  return parseInt(d);
              }
            },
            tooltip: {
              contentGenerator: function(obj) {
                return '<table><thead><tr><td colspan="3"><strong class="x-value">' + obj.data.label.substring(obj.data.index == 10 ? 3 : 2).trim() + '</strong></td></tr></thead><tbody><tr><td class="legend-color-guide"><div style="background-color: ' + obj.color + ';"></div></td><td class="key">Deny activities</td><td class="value">' + obj.data.value + '</td></tr></tbody></table>'
                // return JSON.stringify(obj);
              }
            }
        }
      },
      data: [{
        key: 'Deny activities',
        color: '#EE6869',
      }],
      noData: showNoDataMask
    };
    if(showDummyDataIfMissing) {
      var denyData = [], allowData = [];
      for(var i = 1; i <= 10; i++) {
        var count = parseInt(100 * Math.random());
        allowData.push({
          label: i + ' Activity ' + i, 
          index: i,
          value: count
        });
        var count = parseInt(100 * Math.random());
        denyData.push({
          label: i + ' Activity ' + i, 
          index: i,
          value: count
        });
      }
      $scope.userAllowActivitiesD3.data[0].values = allowData;
      $scope.userDenyActivitiesD3.data[0].values = denyData;
    }
    var setUserActivitiesD3 = function() {
      var now = new Date();
      var sixDaysBack = getDateNDaysAgo(6);
      $scope.loadingWidgets.push("AllowUserActivities");
      dashboardService.getAllowUserActivities(sixDaysBack, now, function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("AllowUserActivities");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        if(!response.data.results.length) return;
        var sortedResults = response.data.results.sort(function(a, b) { 
          return b.count - a.count;
        });
        if(!sortedResults[0].count) return;
        $scope.userAllowActivitiesD3.noData = false;
        sortedResults = sortedResults.splice(0, 10);
        $scope.userAllowActivitiesD3.data[0].values = sortedResults.map(function(item, index) {
          return {
            label: (index + 1) + ' ' + item.display_name,
            index: index + 1,
            value: item.count
          }
        });
        if(sortedResults.length < 10) {
          for(var index = 1; index <= 10 - sortedResults.length; index++) {
            $scope.userAllowActivitiesD3.data[0].values.push({
              label: Array(index + 1).join(' '), 
              index: index + sortedResults.length - 1,
              value: 0
            })
          }
        }
      })
      $scope.loadingWidgets.push("DenyUserActivities");
      dashboardService.getDenyUserActivities(sixDaysBack, now, function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("DenyUserActivities");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        if(!response.data.results.length) return;
        var sortedResults = response.data.results.sort(function(a, b) { 
          return b.count - a.count;
        });
        if(!sortedResults[0].count) return;
        $scope.userDenyActivitiesD3.noData = false;
        sortedResults = sortedResults.splice(0, 10);
        $scope.userDenyActivitiesD3.data[0].values = sortedResults.map(function(item, index) {
            return {
              label: (index + 1) + ' ' + item.display_name,
              index: index + 1,
              value: item.count
            }
        })
        if(sortedResults.length < 10) {
          for(var index = 1; index <= 10 - sortedResults.length; index++) {
            $scope.userDenyActivitiesD3.data[0].values.push({
              label: Array(index + 1).join(' '), 
              index: index + sortedResults.length - 1,
              value: 0
            })
          }            
        }
      })
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      if (uiConfig['dashboard.widget.active-users.enabled'] == 'true') {
        setUserActivitiesD3();
      }
    });

    // widget: activities by resource
    $scope.activitiesByResourceD3 = {
      options: {
        chart: {
            type: 'multiBarHorizontalChart',
            duration: 250,
            height: 280,
            x: function(d){return d.label.length > 9 ? (d.label.substring(0, 6) + '...') : d.label;},
            y: function(d){return d.value;},
            valueFormat: d3.format(',.0f'),
            color: ['#A5CE84'],
            groupSpacing: 0.5,
            //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
            showControls: false,
            showLegend: false,
            showValues: true,
            duration: 500,
            showYAxis: true,
            reduceXTicks: false,
            stacked: true,
            xAxis: {
                // showMaxMin: false
            },
            yAxis: {
              tickFormat: function(d){
                  return d3.format(',.0f')(d);
              }
            },
            multiBar: {
              height: 2000,
              width: 2000,
              valueFormat: d3.format(',.0f'),
              showValues: true
            },
            tooltip: {
              contentGenerator: function(obj) {
                return '<table><thead><tr><td colspan="3"><strong class="x-value">' + obj.data.label.substring(obj.data.index == 10 ? 3 : 2).trim() + '</strong></td></tr></thead><tbody><tr><td class="legend-color-guide"><div style="background-color: ' + obj.color + ';"></div></td><td class="key">' + (obj.data.series ? 'Deny' : 'Allow') + '</td><td class="value">' + obj.data.value + '</td></tr></tbody></table>'
                // return JSON.stringify(obj);
              }
            }
        }
      }, 
      data: null,
      noData: showNoDataMask
    };
    if(showDummyDataIfMissing) {
      var allowSeries = {
          color: '#86AA3F',
          values: []
        }, denySeries =  {
          color: '#EE6869',
          values: []
        };
      for(var i = 1; i <= 10; i++) {
        var countAllow = parseInt(100 * Math.random());
        var countDeny = parseInt(100 * Math.random());
        allowSeries.values.push({
          label: i + ' Resource + i',
          index: i,
          value: countAllow
        });
        denySeries.values.push({
          label: i + ' Resource + i',
          index: i,
          value: countDeny
        })
      }
      $scope.activitiesByResourceD3.data = [allowSeries, denySeries]
      var spacing = (200 - 12 * allowSeries.values.length) / (allowSeries.values.length + 1);
      $scope.activitiesByResourceD3.options.chart.groupSpacing = spacing / (12 + spacing);
    }
    var setActivitiesByResourceD3 = function() {
      var now = new Date();
      var sixDaysBack = getDateNDaysAgo(6);
      $scope.loadingWidgets.push("ActivitiesByResource");
      dashboardService.getActivitiesByResource(sixDaysBack, now, function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("ActivitiesByResource");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        if(!response.data.results.length) return;
        var sortedResults = response.data.results.sort(function(a, b) { 
          return b.total_count - a.total_count;
        });
        if(!sortedResults[0].total_count) return;
        $scope.activitiesByResourceD3.noData = false;
        var allowSeries = {
          color: '#86AA3F',
          values: []
        }
        var denySeries = {
          color: '#EE6869',
          values: []
        }
        var sortedResults = sortedResults.splice(0, 10);
        angular.forEach(sortedResults, function(item, index) {
          allowSeries.values.push({
            label: (index + 1) + ' ' + item.resource_name,
            index: index + 1,
            value: item.allow_count
          })
          denySeries.values.push({
            label: (index + 1) + ' ' + item.resource_name,
            index: index + 1,
            value: item.deny_count
          })
        });
        if(sortedResults.length < 10) {
          for(var index = 1; index <= 10 - sortedResults.length; index++) {
            allowSeries.values.push({
              label: Array(index + 1).join(' '), 
              index: sortedResults.length + index - 1,
              value: 0
            });
            denySeries.values.push({
              label: Array(index + 1).join(' '), 
              index: sortedResults.length + index - 1,
              value: 0
            });
          }
        }
        $scope.activitiesByResourceD3.data = [allowSeries, denySeries]
      })
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      dashboardConfig.enableActivitiesByResource && uiConfig['dashboard.widget.activities-by-resource.enabled'] == 'true' && setActivitiesByResourceD3();
    });

    // widget: activities by policy
    var policyEffectColors = ['#86AA3F', '#E2413E'];
    $scope.frequentlyPoliciesD3 = {
      options: {
        chart: {
            type: 'multiBarHorizontalChart',
            height: 280,
            duration: 250,
            x: function(d){return d.label.length > 9 ? (d.label.substring(0, 6) + '...') : d.label;},
            y: function(d){return d.value;},
            valueFormat: d3.format(',.0f'),
            // color: ['#A5CE84'],
            groupSpacing: 0.4,
            //yErr: function(d){ return [-Math.abs(d.value * Math.random() * 0.3), Math.abs(d.value * Math.random() * 0.3)] },
            showControls: false,
            showLegend: false,
            showValues: true,
            duration: 500,
            showYAxis: true,
            reduceXTicks: false,
            stacked: true,
            
            xAxis: {
                // showMaxMin: false
            },
            yAxis: {
              tickFormat: function(d){
                  return d3.format(',.0f')(d);
              }
            },
            tooltip: {
              contentGenerator: function(obj) {
                return '<table><thead><tr><td colspan="3"><strong class="x-value">' + obj.data.label.substring(obj.data.index == 10 ? 3 : 2).trim() + '</strong></td></tr></thead><tbody><tr><td class="legend-color-guide"><div style="background-color: ' + obj.color + ';"></div></td><td class="key">' + (obj.data.series ? 'Deny' : 'Allow') + '</td><td class="value">' + obj.data.value + '</td></tr></tbody></table>'
                // return JSON.stringify(obj);
              }
            }
        }
      }, 
      data: [{
        key: 'Allow',
        color: '#86AA3F',
        values: []
      }, {
        key: 'Deny',
        color: '#E2413E',
        values: []
      }, ],
      noData: showNoDataMask
    }
    if(showDummyDataIfMissing) {
      for(var i = 1; i <= 10; i++) {
        var count = parseInt(100 * Math.random());
        var index = parseInt(132456789 * Math.random()) % 2;
        $scope.frequentlyPoliciesD3.data[index].values.push({
          label: i + ' Policy ' + i, 
          index: i,
          value: count, 
        });
        $scope.frequentlyPoliciesD3.data[1 - index].values.push({
          label: i + ' Policy ' + i, 
          index: i,
          value: 0, 
        });
      }
      // $scope.frequentlyPoliciesD3.options.chart.groupSpacing = 4 /  $scope.frequentlyPoliciesD3.data.length;
    }
    var setActivityByPoliciesD3 = function() {
      var now = new Date();
      var sixDaysBack = getDateNDaysAgo(6);
      $scope.loadingWidgets.push("ActivityByPolicies");
      dashboardService.getActivityByPolicies(sixDaysBack, now, function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("ActivityByPolicies");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        if(!response.data.results.length) return;
        var sortedResults = response.data.results.sort(function(a, b) {
          return b.count - a.count;
        })
        $scope.frequentlyPoliciesD3.data[0].values = [];
        $scope.frequentlyPoliciesD3.data[1].values = [];
        var sortedResults = sortedResults.splice(0, 10);
        angular.forEach(sortedResults, function(item, index) {
          var allow = item.decision == 'A' ? 0 : 1;
          $scope.frequentlyPoliciesD3.data[allow].values.push({
            label: (index + 1) + ' ' + item.policy_name, 
            index: index + 1,
            value: item.count, 
          });
          $scope.frequentlyPoliciesD3.data[1 - allow].values.push({
            label: (index + 1) + ' ' + item.policy_name, 
            index: index + 1,
            value: 0, 
          });
        });
        if(sortedResults.length < 10) {
          for(var index = 1; index <= 10 - sortedResults.length; index++) {
            $scope.frequentlyPoliciesD3.data[0].values.push({
              label: Array(index + 1).join(' '), 
              index: sortedResults.length + index - 1,
              value: 0
            });
            $scope.frequentlyPoliciesD3.data[1].values.push({
              label: Array(index + 1).join(' '), 
              index: sortedResults.length + index - 1,
              value: 0
            });
          }
        }
        $scope.frequentlyPoliciesD3.noData = false;
      })
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      uiConfig['dashboard.widget.frequently-evaluated-policies.enabled'] == 'true' && setActivityByPoliciesD3();
    });

    // widget: policies by tags
    $scope.policyByTagsD3 = {
      options:{},
      data:[],
      noData: showNoDataMask
    }
    var tagsD3Color = ['#999999', '#49C3A3', '#45CBFD', '#DE89A6', '#9DD5EC', '#FCC248', '#5BE0BE', '#E1BB5F', '#D37A7C', '#FCAE63'];
    $scope.policyByTagsD3.options={
      "chart": {
        "type": "pieChart",
        valueFormat: d3.format(',.0f'),
        "height": 260,
        "showLabels": false,
        "showLegend": false,
        "duration": 500,
        "labelThreshold": 0.01,
        "labelSunbeamLayout": true,
        color: tagsD3Color,
        margin : {
          top: 0,
          left: -75
        },
        "donut":true,
        "donutRatio":0.4
      }
    }
    $scope.tagsD3Legend = [];
    angular.forEach(tagsD3Color, function(color) {
      $scope.tagsD3Legend.push({
        contentStyle: {
          color: color
        }, style: {
          'background-color': color
        },
      })
    })
    
    var setPolicyByTagsD3 = function(){
      $scope.loadingWidgets.push("PolicyByTags");
      dashboardService.getPolicyByTags(function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("PolicyByTags");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        var hasData = true;
        if(!response.data.results.length) hasData = false;
        var sortedResults = response.data.results.sort(function(a, b) { 
          return b.count - a.count;
        });
        if(!sortedResults[0].count) {
          // console.log('data is all 0 for policy by tags');
          hasData = false;
        }
        sortedResults = sortedResults.splice(0, 10);
        if(hasData){
          angular.forEach($scope.tagsD3Legend, function(legend) {
            legend.count = 0;
          })
          $scope.policyByTagsD3.noData = false;
          angular.forEach(sortedResults, function(item, index) {
            item.count && $scope.policyByTagsD3.data.push({
              x: item.term + ':' + item.count,
              y: item.count
            });
            $scope.tagsD3Legend[index].count = item.count;
            $scope.tagsD3Legend[index].tag = item.term;
          });
        } else {
          if(showDummyDataIfMissing) {
            var data = [];
            for(var i = 1; i <= 10; i++) {
              var count = parseInt(100 * Math.random());
              data.push({
                x: 'Tag ' +i,
                y:count
              });
              $scope.tagsD3Legend[i - 1].count = count;
              $scope.tagsD3Legend[i - 1].tag = 'Tag ' +i;
            }
            $scope.policyByTagsD3.data = data;
          }
        }
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      dashboardConfig.enablePolicyByTagsChart && uiConfig['dashboard.widget.policies-grouped-by-tags.enabled'] == 'true' && setPolicyByTagsD3();
    });

    // widget: policies not matched
    $scope.policiesNotMatchedShowSize = {
      val:10
    };
    $scope.policiesNotMatched = null;
    var setNotMatchingPolicies = function() {
      var now = new Date();
      var sixDaysBack = getDateNDaysAgo(6);
      $scope.loadingWidgets.push("NotMatchingPolicies");
      dashboardService.getNotMatchingPolicies(sixDaysBack, now, function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("NotMatchingPolicies");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        $scope.policiesNotMatched = response.data.results;
      })
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      uiConfig['dashboard.widget.policies-not-matched-in-any-request.enabled'] == 'true' && setNotMatchingPolicies();
    });

    // widget: enrollments
    $scope.enrollmentList = null;
    $scope.enrollmentsShowSize = {
      val:10
    };
    var enrollmentTypeTranslate = {
      "ACTIVE_DIRECTORY": 'Active Directory',
      "AZURE_ACTIVE_DIRECTORY": 'Azure Active Directory',
      "LDIF": 'LDIF',
      "SHAREPOINT": 'Sharepoint',
      "UNKNOWN": 'Unknown',
    }
    $scope.loadingWidgets.push("EnrollmentDetails");
    var setEnrollmentDetails = function(uiConfig) {
      dashboardService.getEnrollmentDetails(function(response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("EnrollmentDetails");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        $scope.enrollmentList = [];
        angular.forEach(response.data.enrollments, function(enroll) {
          enroll.type = enrollmentTypeTranslate[enroll.enrollment_type];
          $scope.enrollmentList.push(enroll)
        })
        enrollmentDetailsTimeout = setTimeout(function(){ setEnrollmentDetails(uiConfig) },
            (uiConfig['dashboard.widget.refresh.interval'] || defaultRefreshInterval) * 1000);
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      uiConfig['dashboard.widget.enrollment.enabled'] == 'true' && setEnrollmentDetails(uiConfig);
    });

    // widget: activities
    $scope.activities = []
    var getActivityStream = function(uiConfig) {
      $scope.loadingWidgets.push("ActivityStream");
      dashboardService.getActivityStream(function (response) {
        let indexToRemove = $scope.loadingWidgets.indexOf("ActivityStream");
        if (indexToRemove > -1) {
          $scope.loadingWidgets.splice(indexToRemove, 1);
        }
        $scope.activities = response.data.results;
        angular.forEach($scope.activities, function (activity) {
          var msg = $('<div/>');
          msg.append($('<span/>').addClass('activity-user').text(activity.ownerDisplayName));
          msg.html(msg.html() + activity.activityMsg);
          var msgReassembled = $('<div/>');
          angular.forEach(msg[0].childNodes, function (child, index) {
            if (child.nodeType == 3) {
              msgReassembled.append($('<span/>').text(child.textContent))
            } else {
              msgReassembled.append($('<span/>').text($(child).text()).addClass($(child).attr('class')));
            }
          })
          activity.msgIncludeUser = msgReassembled.html();//[0].outerHTML;
        });
        activityStreamTimeout = setTimeout(function(){ getActivityStream(uiConfig) },
            (uiConfig['dashboard.widget.refresh.interval'] || defaultRefreshInterval) * 1000);
      });
    }
    configService.getUIConfigs().then(function (uiConfig) {
      let isAllowed = $scope.handleUserAccess();

      if (!isAllowed) {
        if (!$scope.showed) {
          userService.showWarningAndGoBack();
          $scope.showed = true;
        }
        return;
      }
      uiConfig['dashboard.widget.recent-activities.enabled'] == 'true' && getActivityStream(uiConfig);
    });
  }
]);
