delegationApp.controller('createLoginConfigController', 
  ['$scope', 'dialogService', 'loggerService', '$anchorScroll', '$state', 
  '$stateParams', '$rootScope', '$filter', 'delegationService', '$window', 'userManualTranslateService', 
  'userService','$timeout', 'loginConfigService',
  function($scope, dialogService, loggerService, $anchorScroll, $state, $stateParams,
   $rootScope, $filter, delegationService, $window, userManualTranslateService, userService,$timeout, loginConfigService) {
      var logger = loggerService.getLogger();
      $scope.isEditMode = angular.isDefined($stateParams.id);
      userService.goBackIfAccessDenied('MANAGE_USERS');
      $scope.$parent.$parent.isCreatePage = true;
      $scope.configForm = {
        val: null,
      }
      $rootScope.immediateStateChange = function() {
        return $scope.configForm.val.$pristine;
      }
      $rootScope.stateChangeHook = function(state) {
        dialogService.confirm({
          msg: $filter('translate')('common.discard.confirm'),
          confirmLabel: $filter('translate')('Proceed'),
          cancelLabel: $filter('translate')('STAY ON THIS PAGE'),
          ok: function() {
            $scope.configForm.val.$setPristine();
            $state.go(state.name, state.params)
          },
          cancel: function() {
          }
        })
      }
      $scope.configTypes = [{
        name:"Active Directory/LDAP",
        value:'LDAP'
      }, {
        name: "Microsoft Azure AD",
        value: 'OIDC'
      }, {
        name: "SAML 2.0",
        value: 'SAML2'
      }/*, {
        name:"Database",
        value:'DB'
      }*/];
      $scope.authenticationContextClassReferences = [
        {name: "Internet Protocol", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocol"}, 
        {name: "Internet Protocol Password", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocolPassword"}, 
        {name: "Kerberos", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:Kerberos"}, 
        {name: "Mobile One Factor Unregistered", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:MobileOneFactorUnregistered"}, 
        {name: "Mobile Two Factor Unregistered", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:MobileTwoFactorUnregistered"}, 
        {name: "Mobile One Factor Contract", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:MobileOneFactorContract"}, 
        {name: "Mobile Two Factor Contract", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:MobileTwoFactorContract"}, 
        {name: "Password", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:Password"}, 
        {name: "Password Protected Transport", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"}, 
        {name: "Previous Session", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:PreviousSession"}, 
        {name: "X509", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:X509"}, 
        {name: "PGP", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:PGP"}, 
        {name: "SPKI", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:SPKI"}, 
        {name: "XML DSig", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:XMLDSig"}, 
        {name: "Smartcard", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:Smartcard"}, 
        {name: "Smartcard PKI", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:SmartcardPKI"}, 
        {name: "Software PKI", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:SoftwarePKI"}, 
        {name: "Telephony", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:Telephony"}, 
        {name: "Nomad Telephony", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:NomadTelephony"}, 
        {name: "Personal Telephony", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:PersonalTelephony"}, 
        {name: "Authenticated Telephony", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:AuthenticatedTelephony"}, 
        {name: "Secure Remote Password", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:SecureRemotePassword"}, 
        {name: "TLS Client", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:TLSClient"}, 
        {name: "Time Sync Token", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:TimeSyncToken"}, 
        {name: "unspecified", value: "urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified"}
      ];
      $scope.authenticationContextComparisonTypes = [
        {name: "exact", value: "exact"}, 
        {name: "minimum", value: "minimum"}, 
        {name: "maximum", value: "maximum"}, 
        {name: "better", value: "better"}
      ];
      $scope.nameIdPolicyFormats = [
        {name: "SAML 1.1: unspecified", value: "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"}, 
        {name: "SAML 1.1: emailAddress", value: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"}, 
        {name: "SAML 1.1: WindowsDomainQualifiedName", value: "urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName"}, 
        {name: "SAML 1.1: X509SubjectName", value: "urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName"}, 
        {name: "SAML 2.0: entity", value: "urn:oasis:names:tc:SAML:2.0:nameid-format:entity"}, 
        {name: "SAML 2.0: kerberos", value: "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos"}, 
        {name: "SAML 2.0: persistent", value: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"}, 
        {name: "SAML 2.0: transient", value: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient"}
      ];
      $scope.signatureAlgorithms = [
        {name: "RSA with SHA1", value: "http://www.w3.org/2000/09/xmldsig#rsa-sha1"}, 
        {name: "RSA with SHA224", value: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha224"}, 
        {name: "RSA with SHA256", value: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"}, 
        {name: "RSA with SHA384", value: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384"}, 
        {name: "RSA with SHA512", value: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512"}
      ];
      $scope.signatureReferenceDigestMethods = [
        {name: "SHA1", value: "http://www.w3.org/2000/09/xmldsig#sha1"}, 
        {name: "SHA224", value: "http://www.w3.org/2001/04/xmldsig-more#sha224"}, 
        {name: "SHA256", value: "http://www.w3.org/2001/04/xmlenc#sha256"}, 
        {name: "SHA384", value: "http://www.w3.org/2001/04/xmldsig-more#sha384"}, 
        {name: "SHA512", value: "http://www.w3.org/2001/04/xmlenc#sha512"}
      ];
      $scope.signatureCanonicalizationAlgorithms = [
        {name: "Canonical XML 1.0 (omit comments)", value: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"}, 
        {name: "Canonical XML 1.0 (with comments)", value: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315#WithComments"}, 
        {name: "Canonical XML 1.1 (omit comments)", value: "http://www.w3.org/2006/12/xml-c14n11"}, 
        {name: "Canonical XML 1.1 (with comments)", value: "http://www.w3.org/2006/12/xml-c14n11#WithComments"}, 
        {name: "Exclusive XML Canonicalization 1.0 (omit comments)", value: "http://www.w3.org/2001/10/xml-exc-c14n#"}, 
        {name: "Exclusive XML Canonicalization 1.0 (with comments)", value: "http://www.w3.org/2001/10/xml-exc-c14n#WithComments"}
      ];
      $scope.attributeNameFormats = [
        "urn:oasis:names:tc:SAML:2.0:attrname-format:basic", 
        "urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified", 
        "urn:oasis:names:tc:SAML:2.0:attrname-format:uri"
      ];
      $scope.requiredAttributeOptions = [
        {name: "Yes", value: true}, 
        {name: "No", value: false}
      ];
      $scope.setConfigType = function(type){
        $scope.selectedConfigType = type;
        $scope.config = {
          secure: false,
          inUse: false,
          attributes:[],
          configData: {
            enabled : "true"
          }
        }
        $scope.config.type = type.value;

        if(type.value == 'LDAP') {
          $scope.config.configData.useStartTLS = true;
          $scope.config.configData.connectionTimeout = 30;
        } else if(type.value == 'SAML2') {
          $scope.config.maximumAuthenticationLifetime = 1200;
          $scope.config.configData.destinationBinding = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";
          $scope.setAuthContextComparisonType($scope.authenticationContextComparisonTypes[0]);
          $scope.setNameIdPolicyFormat($scope.nameIdPolicyFormats[0]);
          $scope.setSignatureCanonicalizationAlgorithm($scope.signatureCanonicalizationAlgorithms[3]);
          $scope.config.configData.forceAuthentication = false;
          $scope.config.configData.passive = false;
          $scope.config.configData.signAssertion = false;
          $scope.config.configData.signResponse = false;
          $scope.config.configData.disableAllSignatureValidation = false;
          $scope.config.configData.signServiceProviderMetadata = false;
          $scope.config.configData.useNameQualifier = false;
          $scope.config.configData.allowNameIdPolicyCreation = false;
          $scope.config.configData.signAuthenticationRequest = false;
          $scope.config.configData.signServiceProviderLogoutRequest = false;
        }
      }
      $scope.setAuthContextComparisonType = function(authenticationContextComparisonType) {
        $scope.config.configData.authenticationContextComparisonType = authenticationContextComparisonType;
      }
      $scope.setNameIdPolicyFormat = function(nameIdPolicyFormat) {
        $scope.config.configData.nameIdPolicyFormat = nameIdPolicyFormat;
      }
      $scope.setSignatureCanonicalizationAlgorithm = function(signatureCanonicalizationAlgorithm) {
        $scope.config.configData.signatureCanonicalizationAlgorithm = signatureCanonicalizationAlgorithm;
      }
      $scope.addEventListener = function () {
        let loginImageElement = document.getElementById('selectLoginImage');
        loginImageElement.addEventListener('change', $scope.setLoginImageFile);

        let idpMetadataElement = document.getElementById('selectIdpMetadata');
        idpMetadataElement.addEventListener('change', $scope.setIdpMetadataFile);
      };
      $scope.setLoginImageFile = function($event) {
        $scope.config.loginImageFile = $event.target.files[0];
        $scope.config.loginImageFileName = $scope.config.loginImageFile.name;
        $scope.setDirty();
        $scope.$digest();
        $scope.loginImageFileRequired = false;
      }
      $scope.setIdpMetadataFile = function($event) {
        $scope.config.idpMetadataFile = $event.target.files[0];
        $scope.config.idpMetadataFileName = $scope.config.idpMetadataFile.name;
        $scope.setDirty();
        $scope.$digest();
        $scope.idpMetadataFileRequired = false;
      }
      $scope.downloadFileResource = function(resourceKey, contentType) {
        loginConfigService.downloadFileResource(resourceKey, function (url) {
          loginConfigService.getFileAsBlob(url, function (data) {
            if (navigator.msSaveBlob) {
              navigator.msSaveBlob(data, url.substr(url.lastIndexOf("/") + 1));
            } else {
              loginConfigService.getFileAsBlob(url, function (data) {
                let blob = new Blob([data], {type: contentType});
                let downloadLink = angular.element('<a></a>');
                downloadLink.attr('href', window.URL.createObjectURL(blob));
                downloadLink.attr('download', url.substr(url.lastIndexOf("/") + 1));
                downloadLink[0].click();
              });
            }
          });
        }); 
      }
      var mandatoryFields = ['username', 'firstName'];
      $scope.config = {
        secure: false,
        inUse: false,
        attributes:[],
        configData: {
          enabled: "true"
        }
      }

      $scope.formInvalid = function() {
        if($scope.config.inUse) {
          return true;
        }
        var hasError = false;
        angular.forEach($scope.configForm.val.$error, function(f) {
          hasError = true;
        });
        return hasError;
      }
      $scope.loadAttributesForAzure = function(){
        $scope.externalAttributeList = ["givenName", "jobTitle", "mail", "surname", "userPrincipalName"];

      }
      $scope.externalAttributeList = [];
      $scope.internalAttributeList = [];
      delegationService.getDelegationSubject(function(response) {
        var subject = response.data && response.data[0];
        angular.forEach(subject.attributes, function(attr) {
          if(attr.dataType != 'MULTIVAL') {
            $scope.internalAttributeList.push(attr.name)
          }
        });
        $scope.internalAttributeList.sort();
      });
      $scope.notSelected = function(item) {
        var selectedLength = $filter('filter')($scope.config.attributes, {
          internalAttribute: item
        }).length
        return selectedLength == 0;
      }
      var getEmptyAttribute = function() {
        return{
          key:'',
          value:''
        }
      }
      var getEmptyComplexAttribute = function() {
        return{
          required: $scope.requiredAttributeOptions[1],
          name: '',
          friendlyName: '',
          nameFormat: '',
          mappedAs: ''
        }
      }
      $scope.addAttribute = function(key){
        if(!$scope.externalAttributeList.length) {
          dialogService.notify({
            msg: $filter('translate')('delegation.loginConfig.msg.noattr.notify'),
          })
          return;
        }
        var c=getEmptyAttribute();
        c.$$hashKey = key;
        !$scope.config.attributes && ($scope.config.attributes = [])
        $scope.config.attributes.push(c);
        $scope.editItem = c;
        $scope.editItem.isEdit = false;
        $scope.attributeTable.notify = false;
      }
      $scope.addComplexAttribute = function(key) {
        var c=getEmptyComplexAttribute();
        c.$$hashKey = key;
        !$scope.config.complexAttributes && ($scope.config.complexAttributes = [])
        $scope.config.complexAttributes.push(c);
        $scope.editItem = c;
        $scope.editItem.isEdit = false;
        $scope.complexAttributeTable.notify = false;
      }

      $scope.removeAttribute = function(index,fromViewTable){
         if(fromViewTable){
            $scope.config.attributes.splice(index,1);
            $scope.attributeTable.notify = false;
            return;
          }
          var errorList = []; 
          if(!$scope.editItem.isEdit ){
            $scope.config.attributes.splice(index,1);
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
      $scope.removeComplexAttribute = function(index,fromViewTable){
        if(fromViewTable){
           $scope.config.complexAttributes.splice(index,1);
           $scope.complexAttributeTable.notify = false;
           return;
         }
         var errorList = []; 
         if(!$scope.editItem.isEdit ){
           $scope.config.complexAttributes.splice(index,1);
         }else{
           errorList = validateComplexAttributeTable();
         }

         if(!errorList.length){
           $scope.complexAttributeTable.dirty = false;
           $scope.complexAttributeTable.notify = false;
           $scope.editItem = {};
         }else{
           $scope.complexAttributeTable.error = true;
           $scope.complexAttributeTable.success = false;
           $scope.complexAttributeTable.notify = true;
           $scope.complexAttributeTable.message = errorList.join(', ');
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
      $scope.configAttributeOptions = [];
      var userAttributePromise = delegationService.getDelegationSubject(function(response) {
        var subject = response.data && response.data[0];
        angular.forEach(subject.attributes, function(attr) {
          $scope.configAttributeOptions.push(attr.name);
        });
      });
      var prepareRequestPayload = function(){
        var payload = {};
        payload.id = $scope.config.id;
        payload.type = $scope.selectedConfigType.value;
        payload.accountId = payload.type;
        payload.name = $scope.config.name;
        payload.configData = angular.copy($scope.config.configData);
        if (payload.type == "LDAP") {
          payload.accountId = 'CC_SYSTEM';
        } else if (payload.type == "OIDC") {
          payload.accountId = 'AZURE';
          payload.configData.code = "AzureAD";
          payload.configData.displayOder = "1";
          payload.configData.authorizeService = "/oauth2/authorize";
          payload.configData.apiUri = "https://graph.microsoft.com";
          payload.configData.tokenClaimService = "/oauth2/token?";
        } else if (payload.type == "SAML2") {
          payload.configData.maximumAuthenticationLifetime = $scope.config.maximumAuthenticationLifetime;
          let selectedReferences = [];
          angular.forEach($scope.authenticationContextClassReferences, function(reference) {
            if(reference.selected) {
              selectedReferences.push(reference.value);
            }
          });
          payload.configData.authenticationContextClassReferences = selectedReferences.join();
          payload.configData.authenticationContextComparisonType = $scope.config.configData.authenticationContextComparisonType.value;
          payload.configData.nameIdPolicyFormat = $scope.config.configData.nameIdPolicyFormat.value;
          let selectedAlgorithms = [];
          angular.forEach($scope.signatureAlgorithms, function(algorithm) {
            if(algorithm.selected) {
              selectedAlgorithms.push(algorithm.value);
            }
          });
          payload.configData.signatureAlgorithms = selectedAlgorithms.join();
          let selectedMethods = [];
          angular.forEach($scope.signatureReferenceDigestMethods, function(method) {
            if(method.selected) {
              selectedMethods.push(method.value);
            }
          });
          payload.configData.signatureReferenceDigestMethods = selectedMethods.join();
          payload.configData.signatureCanonicalizationAlgorithm = $scope.config.configData.signatureCanonicalizationAlgorithm.value;
        }
        payload.userAttributes = {};
        angular.forEach($scope.config.attributes, function(attr) {
          payload.userAttributes[attr.internalAttribute] = attr.externalAttribute
        });
        payload.complexUserAttributes = [];
        angular.forEach($scope.config.complexAttributes, function(attr) {
          let complexAttribute = {
            required: attr.required.value,
            name: attr.name,
            friendlyName: attr.friendlyName,
            nameFormat: attr.nameFormat,
            mappedAs: attr.mappedAs
          };
          payload.complexUserAttributes.push(complexAttribute);
        });

        return payload;
      }
      $scope.setDirty = function() {
        $scope.configForm.val && $scope.configForm.val.$setDirty();
      }
      $scope.saveUserSource = function() {
        var frm = $scope.configForm.val;
        var proceed = true;
        if (frm.$invalid) {
          frm.$setDirty();
          for (var field in frm) {
            if (field[0] == '$') continue;
            frm[field].$touched = true;
          }
          proceed = false;
        }

        if($scope.selectedConfigType.value == "SAML2"
            && !$scope.isEditMode) {
          if(!$scope.config.idpMetadataFileName) {
            $scope.idpMetadataFileRequired = true;
            proceed = false;
          }

          if(!$scope.config.loginImageFileName) {
            $scope.loginImageFileRequired = true;
            proceed = false;
          }

          $scope.authenticationContextClassReferenceRequired = true;
          angular.forEach($scope.authenticationContextClassReferences, function(reference){
            if(reference.selected)
              $scope.authenticationContextClassReferenceRequired = false;
          });

          $scope.signatureAlgorithmRequired = true;
          angular.forEach($scope.signatureAlgorithms, function(algorithm) {
            if(algorithm.selected)
              $scope.signatureAlgorithmRequired = false;
          });

          $scope.signatureReferenceDigestMethodRequired = true;
          angular.forEach($scope.signatureReferenceDigestMethods, function(method) {
            if(method.selected)
              $scope.signatureReferenceDigestMethodRequired = false;
          });

          if($scope.authenticationContextClassReferenceRequired 
              || $scope.signatureAlgorithmRequired
              || $scope.signatureReferenceDigestMethodRequired)
            proceed = false;
        }
        if($scope.resetAttributeEdit()) {
          proceed = false;
        }
        if($scope.resetComplexAttributeEdit()) {
          proceed = false;
        }

        if(!proceed) {
          $scope.$broadcast('scrollto');
          return;
        }
        if(mandatoryFields){
          var mandatoryAttrsNotMapped = [];
          if($scope.selectedConfigType.value != "SAML2") {
            angular.forEach(mandatoryFields, function(attr) {
              var mapped = $filter('filter')($scope.config.attributes || [], {
                internalAttribute: attr
              }, true).length;
              if(mapped == 0) mandatoryAttrsNotMapped.push(attr)
            });
          } else {
            angular.forEach(mandatoryFields, function(attr) {
              var mapped = $filter('filter')($scope.config.complexAttributes || [], {
                mappedAs : attr
              }, true).length;
              if(mapped == 0) mandatoryAttrsNotMapped.push(attr)
            });
          }
          if(mandatoryAttrsNotMapped.length) {
            $scope.model_error = true;
            var errMsg = "There following attributes " + (mandatoryAttrsNotMapped.length == 1 ? 'is' : 'are') + " mandatory: " + mandatoryAttrsNotMapped.join(', ');
            
            if($scope.selectedConfigType.value != "SAML2") {
              $scope.attributeTable.error = true;
              $scope.attributeTable.success = false;
              $scope.attributeTable.message = errMsg;
              setNotification($scope.attributeTable); 
            } else {
              $scope.complexAttributeTable.error = true;
              $scope.complexAttributeTable.success = false;
              $scope.complexAttributeTable.message = errMsg;
              setNotification($scope.complexAttributeTable); 
            }
            $scope.$broadcast('scrollto');
            return;
          }
        }
        var payload = prepareRequestPayload();
        // Stop save action if does not pass verification
        if (payload.type != "SAML2") {
          loginConfigService.verifyLoginConfig(payload).then(function(response) {
            if(response.statusCode != '1011') {
              dialogService.notify({
                msg: $filter('translate')(response.message),
              })
              return;
            }
        
            var action = $scope.isEditMode ? loginConfigService.modifyLoginConfig : loginConfigService.addLoginConfig;
            $scope.saveConfig(frm, action, payload);
          });
        } else {
          var action = $scope.isEditMode ? loginConfigService.modifyLoginConfig : loginConfigService.addLoginConfig;
          $scope.saveConfig(frm, action, payload);
        }
      }
      $scope.saveConfig = function(frm, action, payload) {
        action(payload, $scope.config.loginImageFile, $scope.config.idpMetadataFile).then(function(response) {
          frm.$setPristine();
          $scope.config.id = response.data;
        
          $state.go('LoginConfig.modify',{id:$scope.config.id}) 
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')($scope.isEditMode ? 'delegation.loginConfig.msg.modified.confirm' : 'delegation.loginConfig.msg.added.confirm'),
            backLink: 'LoginConfig.list',
            backLabel: $filter('translate')('BACK TO USER SOURCE LIST')
          });
        })
      }

    $scope.connect = function() {
      var payload = prepareRequestPayload();
      loginConfigService.verifyLoginConfig(payload).then(function(response) {
        logger.log(response);
        if(response.statusCode[0] == '1') {
          dialogService.notifyWithoutBlocking({
            msg: $filter('translate')(response.message),
          });

          if(payload.type == 'LDAP') {
            $scope.externalAttributeList = [];
            loginConfigService.getAttributeList(payload).then(function(response) {
              $scope.externalAttributeList = response.data;
            })
          }
        } else {
          dialogService.notify({
            msg: $filter('translate')(response.message),
          })
        }
      })
    }
    var setConfig = function(resp){
      logger.log(resp);
      if(!resp.data) {
        dialogService.notify({
          msg: $filter('translate')('delegation.loginConfig.msg.unavailable'),
          ok: function() {
            $window.history.back();
            return;
          }
        });
        return;
      }
      $scope.config = resp.data;
      $scope.config.configData.enabled = $scope.config.configData.enabled == 'true';
      angular.forEach($scope.configTypes, function(type) {
        if(type.value == $scope.config.type) 
          $scope.selectedConfigType = type;
      });
      $scope.externalAttributeList = [];
      $scope.config.attributes = [];
      $scope.config.complexAttributes = [];

      if($scope.config.type == "OIDC"){
        $scope.loadAttributesForAzure();
        loadUserAttributes();
      } else if($scope.config.type == "LDAP"){
        loginConfigService.getExistingAttributeList($scope.config).then(function(response) {
          $scope.externalAttributeList = response.data;
          loadUserAttributes();
          if($scope.config.configData.useStartTLS) {
            $scope.config.configData.useStartTLS = ($scope.config.configData.useStartTLS === 'true');
          }
          if($scope.config.configData.userPrincipalFilter) {
            delete $scope.config.configData.userPrincipalFilter;
          }
          if($scope.config.configData.connectionTimeout == null) {
            $scope.config.configData.connectionTimeout = 30;
          }
        });
      } else if($scope.config.type == "SAML2"){
        if($scope.config.configData.spEntityId == null) {
          $scope.config.configData.spEntityId = "urn:mace:saml:pac4j.org";
        }
        $scope.config.maximumAuthenticationLifetime = parseInt($scope.config.configData.maximumAuthenticationLifetime);
        let selectedReferences = $scope.config.configData.authenticationContextClassReferences.split(",");
        angular.forEach($scope.authenticationContextClassReferences, function(reference) {
          reference.selected = false;
          angular.forEach(selectedReferences, function(selectedReference) {
            if(reference.value == selectedReference)
              reference.selected = true;
          });
        });
        angular.forEach($scope.authenticationContextComparisonTypes, function(type) {
          if(type.value == $scope.config.configData.authenticationContextComparisonType)
            $scope.config.configData.authenticationContextComparisonType = type;
        });
        angular.forEach($scope.nameIdPolicyFormats, function(format) {
          if(format.value == $scope.config.configData.nameIdPolicyFormat)
            $scope.config.configData.nameIdPolicyFormat = format;
        });
        let selectedAlgorithms = $scope.config.configData.signatureAlgorithms.split(",");
        angular.forEach($scope.signatureAlgorithms, function(algorithm) {
          algorithm.selected = false;
          angular.forEach(selectedAlgorithms, function(selectedAlgorithm) {
            if(algorithm.value == selectedAlgorithm)
              algorithm.selected = true;
          });
        });
        let selectedMethods = $scope.config.configData.signatureReferenceDigestMethods.split(",");
        angular.forEach($scope.signatureReferenceDigestMethods, function(method) {
          method.selected = false;
          angular.forEach(selectedMethods, function(selectedMethod) {
            if(method.value == selectedMethod)
              method.selected = true;
          });
        });
        angular.forEach($scope.signatureCanonicalizationAlgorithms, function(algorithm) {
          if(algorithm.value == $scope.config.configData.signatureCanonicalizationAlgorithm)
            $scope.config.configData.signatureCanonicalizationAlgorithm = algorithm;
        });
        $scope.config.configData.forceAuthentication = $scope.config.configData.forceAuthentication == 'true';
        $scope.config.configData.passive = $scope.config.configData.passive == 'true';
        $scope.config.configData.signAssertion = $scope.config.configData.signAssertion == 'true';
        $scope.config.configData.signResponse = $scope.config.configData.signResponse == 'true';
        $scope.config.configData.disableAllSignatureValidation = $scope.config.configData.disableAllSignatureValidation == 'true';
        $scope.config.configData.signServiceProviderMetadata = $scope.config.configData.signServiceProviderMetadata == 'true';
        $scope.config.configData.useNameQualifier = $scope.config.configData.useNameQualifier == 'true';
        $scope.config.configData.allowNameIdPolicyCreation = $scope.config.configData.allowNameIdPolicyCreation == 'true';
        $scope.config.configData.signAuthenticationRequest = $scope.config.configData.signAuthenticationRequest == 'true';
        $scope.config.configData.signServiceProviderLogoutRequest = $scope.config.configData.signServiceProviderLogoutRequest == 'true';

        loadComplexUserAttributes();
      }
    }

    var loadUserAttributes = function(){
      angular.forEach($scope.config.userAttributes, function(externalAttribute, internalAttribute) {
        $scope.config.attributes.push({
          internalAttribute: internalAttribute,
          externalAttribute: externalAttribute
        })
      });
    }

    var loadComplexUserAttributes = function() {
      let key = 1;
      angular.forEach($scope.config.complexUserAttributes, function(attribute) {
        let attr = {
          required: null,
          name: attribute.name,
          friendlyName: attribute.friendlyName,
          nameFormat: attribute.nameFormat,
          mappedAs: attribute.mappedAs
        }
        attr.$$hashKey = key;

        angular.forEach($scope.requiredAttributeOptions, function(option) {
          if(option.value == attribute.required)
            attr.required = option;
        });

        $scope.config.complexAttributes.push(attr);
        key++;
      });
    }

    var buttonListForBackToList = [{
      label: $filter('translate')('BACK TO LOGIN CONFIG LIST'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        $state.go('LoginConfig.list');
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
    var buttonListForReset = [{
      label: $filter('translate')('RESET'),
      class: 'cc-btn-discard',
      onClick: function(callback) {
        $scope.configForm.val.$setPristine();
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
    $scope.reset = function() {
      if ($scope.configForm.val.$pristine) {
        $state.reload();
      } else {
        dialogService.confirm({
          msg: $filter('translate')("Are you sure you want to reset all the changes?"),
          buttonList: buttonListForReset
        });
      }
    };
    $scope.backToConfigList = function() {
      if ($scope.configForm.val.$pristine) {
        $state.go('LoginConfig.list');
      } else {
        dialogService.confirm({
          msg: $filter('translate')('delegation.createuser.discard.confirm'),
          buttonList: buttonListForBackToList
        });
      }
    };
    if($scope.isEditMode){
      loginConfigService.getLoginConfig($stateParams.id).then(setConfig);
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

    $scope.editItem = {};
    $scope.setAttributeEdit = function(item) {
      if($scope.editItem.$$hashKey ){
         $scope.resetAttributeEdit();
         if($scope.attributeTable.error) return;
      }
      $scope.editItem.$$hashKey = item.$$hashKey;
      $scope.editItem.isEdit = true;
      $scope.attributeTable.dirty = true;
      $scope.attributeTable.notify = false;
    }
    $scope.setComplexAttributeEdit = function(item) {
      if($scope.editItem.$$hashKey ){
         $scope.resetComplexAttributeEdit();
         if($scope.complexAttributeTable.error) return;
      }
      $scope.editItem.$$hashKey = item.$$hashKey;
      $scope.editItem.isEdit = true;
      $scope.complexAttributeTable.dirty = true;
      $scope.complexAttributeTable.notify = false;
    }

    var setNotification = function(table){
      table.notify = true;
      $timeout(function(){
           table.notify = false;
      },3000);
    }
    $scope.resetAttributeEdit = function() {
      var errList = [];
      errList = validateAttributeTable();
      if(errList.length){
        $scope.attributeTable.error = true;
        $scope.attributeTable.success = false;
        $scope.attributeTable.message = errList.join(', ');
      }else{
        $scope.attributeTable.success = true;
        $scope.attributeTable.error = false;
        $scope.attributeTable.message = 'Atrribute added to the table successfully';
        $scope.editItem = {};
      }
      setNotification($scope.attributeTable); 
      return errList.length;
    }
    $scope.resetComplexAttributeEdit = function() {
      var errList = [];
      errList = validateComplexAttributeTable();
      if(errList.length){
        $scope.complexAttributeTable.error = true;
        $scope.complexAttributeTable.success = false;
        $scope.complexAttributeTable.message = errList.join(', ');
      }else{
        $scope.complexAttributeTable.success = true;
        $scope.complexAttributeTable.error = false;
        $scope.complexAttributeTable.message = 'Atrribute added to the table successfully';
        $scope.editItem = {};
      }
      setNotification($scope.complexAttributeTable); 
      return errList.length;
    }
    $scope.updateUseStartTLSCheck = function() {
      if($scope.config.configData.ldapUrl && $scope.config.configData.ldapUrl.toLowerCase().startsWith("ldaps:")) {
        $scope.isSecure = true;
        $scope.config.configData.useStartTLS = false;
      } else {
        $scope.isSecure = false;
        $scope.config.configData.useStartTLS = true;
      }
    }
    $scope.numberOnly = function (evt) {
      var ASCIICode = evt.which || evt.keyCode;
      if (ASCIICode > 31 && (ASCIICode != 37 && ASCIICode != 39 && ASCIICode != 46) && (ASCIICode < 48 || ASCIICode > 57)) {
		    evt.preventDefault();
	    }
    }
    var validateAttributeTable = function(){
      var errMsgs = [];
      if($scope.config.attributes) 
        for(var i=0;i < $scope.config.attributes.length; i++){
          var attribute = $scope.config.attributes[i];
          if(!attribute.internalAttribute)
            errMsgs.push($filter('translate')('delegation.loginConfig.validation.attr.internal.required'));
          else {
            var selectedLength = $filter('filter')($scope.config.attributes, {
              internalAttribute: attribute.internalAttribute
            }, true).length;
            if(selectedLength > 1){
              errMsgs.push($filter('translate')('There is already another attribute mapped on ' + attribute.internalAttribute));
              break;
            }
          }
        }
      
      return errMsgs;
    }
    var validateComplexAttributeTable = function(){
      var errMsgs = [];
      if($scope.config.complexAttributes) 
        for(var i=0;i < $scope.config.complexAttributes.length; i++){
          var attribute = $scope.config.complexAttributes[i];
          
          if(!attribute.name) {
            errMsgs.push($filter('translate')('delegation.loginConfig.validation.attr.name.required'));
          } else {
            var selectedLength = $filter('filter')($scope.config.complexAttributes, {
              name: attribute.name
            }, true).length;
            if(selectedLength > 1){
              errMsgs.push($filter('translate')('There is already another name mapped on ' + attribute.name));
              break;
            }
          }
          if(!attribute.friendlyName) {
            errMsgs.push($filter('translate')('delegation.loginConfig.validation.attr.friendlyName.required'));
          } else {
            var selectedLength = $filter('filter')($scope.config.complexAttributes, {
              friendlyName: attribute.friendlyName
            }, true).length;
            if(selectedLength > 1){
              errMsgs.push($filter('translate')('There is already another friendly name mapped on ' + attribute.friendlyName));
              break;
            }
          }
          if(!attribute.mappedAs) {
            errMsgs.push($filter('translate')('delegation.loginConfig.validation.attr.internal.required'));
          } else {
            var selectedLength = $filter('filter')($scope.config.complexAttributes, {
              mappedAs: attribute.mappedAs
            }, true).length;
            if(selectedLength > 1){
              errMsgs.push($filter('translate')('There is already another map to mapped on ' + attribute.mappedAs));
              break;
            }
          }
        }
      
      return errMsgs;
    }
    if($scope.selectedConfigType == undefined
      && $scope.configTypes.length > 0) {
      $scope.setConfigType($scope.configTypes[0]);
    }
  
    $scope.attributeTable = {
      dirty :false,
      success:true,
      error:false,
      notify:false,
      message:''
    };

    $scope.complexAttributeTable = {
      dirty :false,
      success:true,
      error:false,
      notify:false,
      message:''
    };
  }]);
