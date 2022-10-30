delegationApp.controller('createUserController', 
  ['$scope', 'dialogService', 'configService', 'loggerService', '$location', '$anchorScroll', '$state', 
  '$stateParams', '$rootScope', '$filter', 'delegationService', '$q', '$window','delegationUserService', 'userManualTranslateService', 
  'userService','$timeout',
  function($scope, dialogService, configService, loggerService, $location, $anchorScroll, $state, $stateParams,
   $rootScope, $filter, delegationService, $q, $window,delegationUserService, userManualTranslateService, userService,$timeout) {
      var logger = loggerService.getLogger();
      $scope.isEditMode = angular.isDefined($stateParams.userId);
      userService.goBackIfAccessDenied('MANAGE_USERS');
      $scope.$parent.$parent.isCreatePage = true;
      $scope.userForm = {
        val: null,
      }
      $scope.User = {
        id : null,
        userCategory: '',
        username:'',
        firstName:'',
        lastName:'',
        password:'',
        confirmPassword:'',
        oldPassword:'',
        attributes:[]
      }
      $scope.userEditable = true;
      $scope.pasSwordmatChing = true;
      $scope.validateForm = function() {
        $scope.pasSwordmatChing = $scope.currentUser.newPassword == $scope.currentUser.confirmNewPassword;
      }

      $scope.userCategories = [{
        name:"Administrator",
        value: "ADMIN"
      }, {
        name: "General User",
        value: "CONSOLE"
      }, {
        name: "API Account",
        value: "API"
      }];

      $scope.setUserCategory = function(category){
        $scope.selectedUserCategory = category;
        $scope.User.userCategory = category.value;
     }

      var getEmptyAttribute = function(){
        return{
          id:null,
          key:'',
          value:''
        }
      }
      $scope.addAttribute = function(key){
        //$scope.User.attributes.push(getEmptyAttribute());
        var c=getEmptyAttribute();
        c.$$hashKey = key;
        $scope.User.attributes.push(c);
        $scope.editItem = c;
        $scope.editItem.isEdit = false;
        $scope.attributeTable.notify = false;
      }
      $scope.removeAttribute = function(index,fromViewTable){
         //$scope.User.attributes.splice(index,1);
         if(fromViewTable){
            $scope.User.attributes.splice(index,1);
            $scope.attributeTable.notify = false;
            return;
          }
          var errorList = []; 
          if(!$scope.editItem.isEdit ){
            $scope.User.attributes.splice(index,1);
           
          }else{
            errorList = validateAttributeTable();
          }

          if(!errorList.length){
            $scope.attributeTable.dirty = false;
            $scope.attributeTable.notify = false;
            $scope.editItem = {};
          }else{
            $scope.attributeTable.error = true;
            $scope.attributeTable.success = false;
            $scope.attributeTable.notify = true;
            $scope.attributeTable.message = errorList.join(', ');
          }
      }
      var currentTarget = 'userinfo';
      $scope.scrollTo = function(target) {
        $anchorScroll(target);
        currentTarget = target;
      }
      $scope.isActive = function(newTarget) {
        return currentTarget == newTarget;
      }
      $scope.highlightGrammar = function(target) {
        currentTarget = target;
      }
      var implicitAttr = {
        'username': true,
        'firstname': true,
        'lastname': true,
        'email': true,
        'password': true,
      }
      $scope.implicitAttrFilter = function(implicit) {
        return function(attrname) {
          return implicit ? implicitAttr[attrname.toLowerCase()] : !implicitAttr[attrname.toLowerCase()]
        }
      }
      $scope.userAttributeOptions = [];
      var userAttributePromise = delegationService.getDelegationSubject(function(response) {
        var subject = response.data && response.data[0];
        angular.forEach(subject.attributes, function(attr) {
          if(attr.dataType != 'MULTIVAL') {
            $scope.userAttributeOptions.push(attr.name)
          }
        });
        $scope.userAttributeOptions.sort();
      });
      var prepareRequestPayload = function(){
        var payload = {};
        // console.log($scope.User);
        payload.id = $scope.User.id;
        payload.userCategory = $scope.User.userCategory;
        payload.username = $scope.User.username;
        payload.firstName = $scope.User.firstName;
        payload.lastName = $scope.User.lastName;
        payload.password = $scope.User.password;
        payload.email = $scope.User.email;
        payload.properties = [];
        angular.forEach($scope.User.attributes,function(attr){
           payload.properties.push({
              key:attr.key,
              value:attr.value,
              id:null
           })
        })

        return payload;
      }
      $scope.setDirty = function() {
        $scope.userForm.val && $scope.userForm.val.$setDirty();
      }
      $scope.model_error = false;


      var saveUserPayload = function(frm){
        var payload = prepareRequestPayload();
        var action = $scope.isEditMode ? delegationUserService.modifyUser : delegationUserService.addUser;
        action(payload, function(response) {
          frm.$setPristine();
          $scope.User.id = response.data;
          
          $state.go('Users.edituser',{userId:$scope.User.id}) 
         
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')($scope.isEditMode ? 'delegation.createuser.modified.confirm' : 'delegation.createuser.added.confirm'),
            backLink: 'Users.userlist',
            backLabel: $filter('translate')('BACK TO USER LIST')
          });
        })
      }

      var confirmResetPwd = function(frm){
        var buttonListForResetPwdConfirm = [{
          label: $filter('translate')('YES'),
          class: 'cc-btn-discard',
          onClick: function(callback) {
            saveUserPayload(frm);
            callback && callback();
            $scope.User.confirmPassword = "";
            $scope.User.password = "";
          }
        }, {
          label: $filter('translate')('NO'),
          class: 'cc-btn-primary',
          onClick: function(callback) {
            callback && callback();
          }
        }];
        
        dialogService.confirm({
          msg: $filter('translate')('delegation.loginConfig.msg.resetPwd.confirm'),
          buttonList: buttonListForResetPwdConfirm
        });
      }

      $scope.saveUser = function() {
      var frm = $scope.userForm.val;
      if ($scope.userEditable && frm.$invalid) {
        frm.$setDirty();
        for (var field in frm) {
          if (field[0] == '$') continue;
          logger.log(field);
          frm[field].$touched = true;
        }
        $scope.$broadcast('scrollto');
        return;
      }
      if($scope.saveEdit()){
        $scope.$broadcast('scrollto');
        return;
      }
      if($scope.User.confirmPassword != $scope.User.password) {
        return;
      }

      if($scope.isEditMode){
        if(!($scope.User.password == "" && $scope.User.confirmPassword == "")){
           confirmResetPwd(frm);
        }
      }

      //Saving user's details when adding new user or when the password has not been modified by administrator.
      if(!$scope.isEditMode || $scope.User.password == ""){
        saveUserPayload(frm);
      }
    }

    var setUser = function(resp){
      $q.all(userAttributePromise).then(function(){
        var user = resp.data;
         $scope.User = {
          id : user.id,
          username:user.username,
          firstName:user.firstName,
          lastName:user.lastName,
          email: user.email,
          password:'',
          confirmPassword:'',
          oldPassword:'',
          attributes: user.properties.map(function(attr){
             return{
              id:attr.id,
              key:attr.key,
              value:attr.value
             }
          })
        }
        $scope.setUserCategory($scope.userCategories.filter(function(category) {return category.value == user.userCategory;})[0]);
        $scope.userEditable = user.userType != "imported";
      })
    }

    $rootScope.immediateStateChange = function () {
      return $scope.userForm.val.$pristine;
    }
    $rootScope.stateChangeHook = function (state) {
      dialogService.confirm({
        msg: $filter('translate')('common.discard.confirm'),
        confirmLabel: $filter('translate')('Proceed'),
        cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
        ok: function () {
          $scope.userForm.val.$setPristine();
          $state.go(state.name, state.params)
        },
        cancel: function () {
        }
      })
    }

    var buttonListForBackToList = [{
      label: $filter('translate')('BACK TO USER LIST'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        $scope.userForm.val.$setPristine();
        $state.go('Users.userlist');
        callback && callback();
      }
    }, {
      label: $filter('translate')('STAY ON THIS PAGE'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        // console.log('stay');
        callback && callback();
      }
    }];
    var buttonListForDiscarding = [{
      label: $filter('translate')('RESET'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        $scope.userForm.val.$setPristine();
        $state.reload();
        callback && callback();
      }
    }, {
      label: $filter('translate')('CANCEL'),
      class: 'cc-btn-primary',
      onClick: function(callback) {
        callback && callback();
      }
    }];
    $scope.discardUser = function() {
      if ($scope.userForm.val.$pristine) {
        // $state.go('Users.userlist');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('delegation.createuser.reset.confirm'),
          buttonList: buttonListForDiscarding
        });
      }
    };
    $scope.backToUserList = function() {
      if ($scope.userForm.val.$pristine) {
        $state.go('Users.userlist');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('delegation.createuser.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };
    if($stateParams.userId){
      delegationUserService.findUserById($stateParams.userId,setUser);
    }

    $scope.userManualOption = {
      app: 'Delegated Administration',
      section: 'Users',
      page: 'Create User',
    }
    $scope.pageOptionList = null;
    $scope.showUserManual = {};
    userManualTranslateService.pageOptionList($scope.userManualOption, function(pageOptionList) {
      $scope.pageOptionList = pageOptionList;
      $rootScope.hasUserManual = pageOptionList;
      for (var key in pageOptionList) {
        $scope.showUserManual[key] = false;
      }
      for (var key in $scope.showUserManual) {
        if (!pageOptionList[key])
          delete $scope.showUserManual[key];
      }
    });
    var showAllManual = function(show) {
      for (var key in $scope.showUserManual) {
        $scope.showUserManual[key] = show;
      }
    }
    $scope.$watch(function() {
      return $rootScope.showAboutPage;
    }, function(newValue, oldValue) {
      // console.log('showAboutPage', newValue, oldValue);
      if(newValue == oldValue) return;
      showAllManual(newValue);
    });
    $scope.$watch(function() {
      return $scope.showUserManual;
    }, function(newValue, oldValue) {
      // console.log('showUserManual', newValue, oldValue);
      if(newValue == oldValue) return;
      var showAboutPage = false;
      for (var key in $scope.showUserManual) {
        showAboutPage = showAboutPage || $scope.showUserManual[key];
      }
      $rootScope.showAboutPage && ($rootScope.showAboutPage = showAboutPage);
    }, true);

    var itemBeforeEdit = null;
    $scope.editItem = {};
    $scope.setEdit = function(item) {
      if($scope.editItem.$$hashKey ){
         $scope.saveEdit();
         if($scope.attributeTable.error) return;
      }
      itemBeforeEdit = JSON.parse(JSON.stringify(item));
      $scope.editItem = item;
      $scope.editItem.isEdit = true;
      $scope.attributeTable.dirty = true;
      $scope.attributeTable.notify = false;
      
      
    }
    var setNotification = function(table){
      table.notify = true;
      $timeout(function(){
           table.notify = false;
      },3000);
    }
    $scope.saveEdit = function() {

      var errList = [];
      
      // Only validate user's attribute if this is internal user
      if($scope.userEditable) {
        errList = validateAttributeTable();
        if(errList.length){
          $scope.attributeTable.error = true;
          $scope.attributeTable.success = false;
          //$scope.attributeTable.notify = true;
          $scope.attributeTable.message = errList.join(', ');
        }else{
          $scope.attributeTable.success = true;
          $scope.attributeTable.error = false;
          $scope.attributeTable.message = 'Atrribute added to the table successfully';
          //$scope.attributeTable.notify = true;
          $scope.editItem = {};
        }
        setNotification($scope.attributeTable);
      }
      return errList.length;
    }
    var deepCopyWith$ = function(src, target) {
      angular.copy(src, target);
      for (var field in src) {
        // if(angular.isObject(itemBeforeEdit[field])) {
        // } else if(angular.isObject(itemBeforeEdit[field])) {
        // }
        target[field] = src[field];
      }
    }
    $scope.cancelEdit = function() {
        if($scope.editItem.isEdit) {
          deepCopyWith$(itemBeforeEdit, $scope.editItem);
        } else {
          $scope.User.attributes.splice($scope.User.attributes.length - 1);
        }
        $scope.editItem = {};
    }
    var validateAttributeTable = function(){
      $scope.model_error = false;
      var errMsgs = [];
      for(var i=0;i < $scope.User.attributes.length; i++){
        var atrribute = $scope.User.attributes[i];
        if(!atrribute.key)
          errMsgs.push($filter('translate')('delegation.createuser.validation.attr.key.required'));
        if(implicitAttr[atrribute.key.toLowerCase()])
          errMsgs.push($filter('translate')('delegation.createuser.validation.attrname.is.implicit', {
            attrname: atrribute.key
          }));
        if(!atrribute.value)
          errMsgs.push($filter('translate')('delegation.createuser.validation.attr.value.required'));
      }
      errMsgs.length && ($scope.model_error = true);
      return errMsgs;
    }

    if($scope.selectedUserCategory == undefined
      && $scope.userCategories.length > 0) {
      $scope.setUserCategory($scope.userCategories[1]); //console user
    }

    $scope.attributeTable = {
      dirty :false,
      success:true,
      error:false,
      notify:false,
      message:''
    };
  }]);
