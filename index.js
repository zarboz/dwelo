"use strict";
exports.__esModule = true;
var request = require("request");
var locks_api_1 = require("./locks-api");
var Service, Characteristic;
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-dwelo-locks", "Dwelo Locks", DwelolocksAccessory);
};
var DwelolocksAccessory = /** @class */ (function () {
    function DwelolocksAccessory(log, config) {
        var _this = this;
        this.log = log;
        this.config = config;
        this.name = config.name;
        this.api = new locks_api_1.DweloApi(config.home, config.token);
        this.cachedLockState = true;
        this.services = config.lights
            .map(function (id) { return _this.api.createlock(id); })
            .map(function (lock) {
            var lockservice = new Service.LockMechanism(_this.name, lock.id);
            lockservice
            .getCharacteristic(Characteristic.LockCurrentState)
		    .on('get', lock.get.bind(lock));

            lockservice.getCharacteristic(Characteristic.LockTargetState)
    			.on('get', lock.get.bind(lock))
    			.on('set', lock.set.bind(lock));
    	DwelolocksAccessory.prototype.get = function(callback) {
    		callback(null,true);
    	}
    	DwelolocksAccessory.prototype.checkState = function() {
    		var self = lockservice;
    		self.cachedLockState = true;
    		var currentState = Characteristic.LockCurrentState.SECURED
    		self.lockservice.setCharacteristic(Characteristic.LockCurrentState, currentState);
    		self.lockservice.setCharacteristic(Characteristic.LockTargetState, currentState);
		}
		

            return lockservice;
        });
    }
    DwelolocksAccessory.prototype.getServices = function () {
        return this.services;
    };
    return DwelolocksAccessory;
}());

