'use strict';

angular.module('conferenceApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.room1 = "";
    // $scope.room2 = "available";

    $http({
      method: 'GET',
      url: 'http://skynet.im/events/adcf9640-f71a-11e3-a289-c9c410d2a47e?token=0c4liaas7dum78pviw7ovh5pvc4k7qfr',
      headers: {
        'skynet_auth_uuid': 'adcf9640-f71a-11e3-a289-c9c410d2a47e',
        'skynet_auth_token': '0c4liaas7dum78pviw7ovh5pvc4k7qfr'
      }
    }).
      success(function(data, status, headers, config) {
        console.log(data);
        var i = 0;
        while(data.events[i].payload === undefined || data.events[i].payload.typ !== "room"){
          i++;
        }
        console.log(i);

        var dat = data.events[i].payload.dat
        console.log(dat);
        if(dat === "inactive"){
          $scope.room1 = "available";  
        } else {
          $scope.room1 = "unavailable";
        }
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.error("Unable to connect to Meshblu (formerly Skynet)");
      });

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
        if(message.payload.typ === "room" && message.payload.dat.num === "1"){
          var dat = message.payload.dat;
          console.log(dat);

          if(dat.motion === "active"){
            $scope.room1 = "unavailable";
          } else {
            $scope.room1 = "available";
          }
          $scope.$apply();
        }
      });

    });

  });
