"use strict";
exports.__esModule = true;
var https = require('https');
var SUCCESS = null;
var deviceMap = new Map();
var Dwelolock = /** @class */ (function () {
    function Dwelolock(api, id) {
        var _this = this;
        this.api = api;
        this.id = id;
        this.get = function (callback) {
            _this.api.getStatus(_this.id)
                .then(function (isOn) { return callback(SUCCESS, isOn); })["catch"](callback);
        };
        this.set = function (state, callback) {
            _this.api.togglelock(state, _this.id)
                .then(function () { return callback(SUCCESS); })["catch"](callback);
        };
    }
    return Dwelolock;
}());
var DweloApi = /** @class */ (function () {
    function DweloApi(home, token) {
        this.home = home;
        this.token = token;
    }
    DweloApi.prototype.createlock = function (id) {
        return new Dwelolock(this, id);
    };
    DweloApi.prototype.makeRequest = function (path) {
        var _headers = {
            'Authorization': "Token " + this.token
        };
        var _content = undefined;
        var makeRequest = function (method) {
            return new Promise(function (resolve) {
                var request = https.request({
                    host: 'api.dwelo.com',
                    path: path,
                    port: 443,
                    method: method,
                    headers: _headers
                }, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log("->::" + chunk);
                        resolve(JSON.parse(chunk));
                    });
                });
                _content && request.write(_content);
                request.end();
            });
        };
        return {
            POST: function (content) {
                _headers['Content-Type'] = 'application/json;charset=UTF-8';
                _headers['Content-Length'] = Buffer.byteLength(content);
                _content = content;
                return makeRequest('POST');
            },
            GET: function () {
                return makeRequest('GET');
            }
        };
    };
    DweloApi.prototype.togglelock = function (lock, id) {
        var command = "{\"command\":\"" + (lock ? 'lock' : 'unlock') + "\"}";
        var path = "/v3/device/" + id + "/command/";
        deviceMap.set(id, lock);
        return this.makeRequest(path).POST(command);
    };
    DweloApi.prototype.getStatus = function (deviceId) {
        return new Promise(function (resolve) {
            return resolve(!!deviceMap.get(deviceId));
        });
        // return this.makeRequest(`/v3/sensor/gateway/${this.home}/`).GET().then(r => {
        //     const device = r.results.find(s => s.deviceId == deviceId);
        //     if (!device) {
        //         return false;
        //     } else {
        //         return device.value == 'on';
        //     }
        // });
    };
    return DweloApi;
}());
exports.DweloApi = DweloApi;
