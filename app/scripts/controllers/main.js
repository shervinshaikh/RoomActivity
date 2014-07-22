'use strict';

angular.module('conferenceApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.room1 = "available";
    // $scope.room2 = "available";



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
      console.log(data.data);
      $scope.motion1Data = data.data;
      $scope.motion1 = (data.data[0].motion === "active") ? true : false;

      // var i = 0;
      // while(data.events[i].payload === undefined || data.events[i].payload.typ !== "room"){
      //   i++;
      // }
      // console.log(i);

      // var dat = data.events[i].payload.dat
      // console.log(dat);
      // if(dat === "inactive"){
      //   $scope.room1 = "available";  
      // } else {
      //   $scope.room1 = "unavailable";
      // }
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
      console.log(data.data);
      $scope.motion2Data = data.data;

      var diff = $scope.timeDiff(data);
      $scope.motion2d = (diff < 100000) ? true : false;

      $scope.motion2 = (data.data[0].motion === "active") ? true : false;
      $scope.room1 = ($scope.motion1 && $scope.motion2d) ? "unavailable" : "available";
    })
    .error(function(data, status, headers, config) { console.error("Unable to connect to Meshblu (formerly Skynet)"); });

    $scope.timeDiff = function(data) {
      var diff = 0;
      for(var i=0; i<data.data.length; i++){
        console.log(data.data[i].motion);
        var t = Date.parse(data.data[i].timestamp);
        console.log(t);
        if(i === 0){
          diff = t;
        } else if(i === 9){
          diff = diff - t;
        }
      }
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
      console.log('Ready');
      conn.status(function (data) {
        // console.log(data);
      });

      conn.on('message', function(message) {
        // console.log(message);
        console.log(message.payload.dat);

        if(message.payload.typ === "room"){
          if(message.payload.dat.num === "1"){
            

            var dat = message.payload.dat;
            console.log(dat);
            console.log(Date.parse(message.timestamp));

            $scope.motion1 = (message.payload.dat.motion === "active") ? true : false;
            $scope.room1 = ($scope.motion1 && $scope.motion2d) ? "unavailable" : "available";
            $scope.$apply();
          } else if(message.payload.dat.num === "2") {
            console.log("here");
            console.log($scope.motion2Data);
            $scope.motion2Data.unshift({
              "motion": message.payload.dat.motion,
              "timestamp": message.payload.timestamp
            });
            console.log($scope.motion2Data);
            $scope.motion2Data.pop();
            console.log($scope.motion2Data);

            $scope.motion2 = (message.payload.dat.motion === "active") ? true : false;
            $scope.$apply();
          }
        }
      });

    });

  });
