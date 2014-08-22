'use strict';

angular.module('conferenceApp')
  .controller('MainCtrl', function ($scope, $http, $interval, $window) {
    if($window.location.search === '?active=true'){
      $scope.room1 = "unavailable";
      $scope.roomIsActive = true;
      console.log('sdfsd')
    } else {
      $scope.room1 = "available";
      $scope.roomIsActive = false;
    }

    var THRESHOLD = 100000;

    // Motion sensor 1
    $http({
      method: 'GET',
      url: 'http://skynet.im/data/fd4a7a21-112b-11e4-a6fc-2d0cfe3a0468',
      headers: {
        'skynet_auth_uuid': 'adcf9640-f71a-11e3-a289-c9c410d2a47e',
        'skynet_auth_token': '0c4liaas7dum78pviw7ovh5pvc4k7qfr'
      }
    })
    .success(function(data, status, headers, config) {
      $scope.motion1Data = data.data;
      $scope.motion1 = (data.data[0].motion === "active") ? true : false;
    })
    .error(function(data, status, headers, config) { console.error("Unable to connect to Meshblu (formerly Skynet)"); });



    // Motion sensor 2 (Aeon)
    $http({
      method: 'GET',
      url: 'http://skynet.im/data/b6391e20-112b-11e4-a6fc-2d0cfe3a0468',
      headers: {
        'skynet_auth_uuid': 'adcf9640-f71a-11e3-a289-c9c410d2a47e',
        'skynet_auth_token': '0c4liaas7dum78pviw7ovh5pvc4k7qfr'
      }
    })
    .success(function(data, status, headers, config) {
      $scope.motion2Data = data.data;

      var diff = $scope.timeDiff(data.data);
      $scope.motion2d = (diff < THRESHOLD) ? true : false;

      $scope.motion2 = (data.data[0].motion === "active") ? true : false;
      $scope.updateRoom();
    })
    .error(function(data, status, headers, config) { console.error("Unable to connect to Meshblu (formerly Skynet)"); });

    $scope.timeDiff = function(data) {
      var diff = Date.parse(data[0].timestamp) - Date.parse(data[data.length-1].timestamp);
      console.log("Difference:", diff);
      return diff;
    }



    // Receive update messages here
    var conn = skynet.createConnection({
      "uuid": "adcf9640-f71a-11e3-a289-c9c410d2a47e",
      "token": "0c4liaas7dum78pviw7ovh5pvc4k7qfr",
      "protocol": "websocket"
    });

    conn.on('ready', function(data){
      // console.log('Ready');
      conn.status(function (data) {
        // console.log(data);
      });

      conn.on('message', function(message) {
        // console.log(message);
        console.log(message.payload.dat);

        if(message.payload.typ === "room"){
          if(message.payload.dat.num === "1"){
            

            var dat = message.payload.dat;
            // console.log(dat);
            // console.log(Date.parse(message.timestamp));

            $scope.motion1 = (message.payload.dat.motion === "active") ? true : false;
            $scope.updateRoom();
            $scope.$apply();
          } else if(message.payload.dat.num === "2") {
            $scope.motion2Data.unshift({
              "motion": message.payload.dat.motion,
              "timestamp": message.timestamp
            });
            $scope.motion2Data.pop();

            var d = $scope.timeDiff($scope.motion2Data);
            console.log("Diference:", d);

            $scope.motion2 = (message.payload.dat.motion2 === "active") ? true : false;

            $scope.motion2d = (d < THRESHOLD) ? true : false;
            $scope.updateRoom();
            $scope.$apply();
          }
        }
      });

    });

    $interval(function(){
      if($scope.motion2d === true){
        var idiff = Date.now() - Date.parse($scope.motion2Data[0].timestamp);
        console.log("INTER Diff:", idiff);

        $scope.motion2d = (idiff < 20000) ? true : false;
        $scope.updateRoom();
      }
    }, 5000);

    $scope.sendYo = function(){
      var username = prompt("Please enter your YO username");
      if(username !== undefined){
        $scope.username = username;
        $scope.yo = true;
        console.log($scope.username);

        $window.alert("Will send a YO to " + username + " when the table is free.  Please keep this browser tab open to be able to receive the YO.");
      }
    };

    $scope.updateRoom = function(){
      if($window.location.search === '?active=true'){
        return;
      }

      $scope.room1 = ($scope.motion1 && $scope.motion2d) ? "unavailable" : "available";
      $scope.roomIsActive = ($scope.motion1 && $scope.motion2d);

      if($scope.roomIsActive === false && $scope.yo){
        $scope.yo = false;

        var data = {
          'api_token': '07a20287-6848-7bfc-fb8f-1cc06ae4c468',
          'username': $scope.username
        }
        $http.post('http://api.justyo.co/yo/', data)
        .success(function(data, status, headers, config) {
          console.log("Succesfully sent Yo!");
        })
        .error(function(data, status, headers, config) { console.error("Unable to send Yo"); });
      }
    };

  });
