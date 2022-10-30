policyStudio.controller('ldif-sync-dialog-controller',  ['$scope', function ($scope) {
        var inputButton = document.getElementById("input-enrollment-ldif-sync-file");
        var browseButton = document.getElementById("btn-ldif-sync-browse-button-extra");
        var browseText = document.getElementById("input-ldif-sync-browse-text-extra");
        var browseSuccess = document.getElementById("input-ldif-sync-browse-text-upload-success");
        var disabledConfirmButton = document.getElementById("btn-modal-disabled-confirm");
        var enableConfirmButton = document.getElementById("btn-modal-confirm");

        browseButton.addEventListener("click", function () {
            inputButton.click();
        })

        inputButton.addEventListener("change", function () {
            browseText.value = inputButton.value ? inputButton.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1] : "Upload a file";
            if(inputButton.value) {
                browseText.style.display = 'inline-block';
                browseSuccess.style.display = 'none';
                disabledConfirmButton.style.display = "none";
                enableConfirmButton.style.display = "inline-block";
            } else {
                browseText.style.display = 'none';
                browseSuccess.style.display = 'inline-block';
                disabledConfirmButton.style = "inline-block";
                enableConfirmButton.style = "none";
            }

           var getFilename = inputButton.files[0].name.match(/[^\.]+/);
           var completeButton = document.getElementById("btn-complete-type");
           var deltaButton = document.getElementById("btn-delta-type");

           if (getFilename.includes('delta')) {
                deltaButton.checked = true;
                completeButton.checked = false;
                $scope.ldifData.ldifSyncType = "delta";
           } else {
                deltaButton.checked = false;
                completeButton.checked = true;
                $scope.ldifData.ldifSyncType = "complete";
           }
        })
    }
]);