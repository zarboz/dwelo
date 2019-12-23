var request = require("request");
import {DweloApi} from "./locks-api";
var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-dwelo-locks", "Dwelo Locks", DwelolocksAccessory);
}

class DwelolocksAccessory {
    log: any;
    config: any;
    name: string;
    api: DweloApi;
    services: any[];

    constructor(log, config) {
        this.log = log;
        this.config = config;
        this.name = config.name;
        this.api = new DweloApi(config.home, config.token);

        this.services = config.lights
            .map(id => this.api.createlock(id))
            .map(lock => {
                const service = new Service.Lightbulb(this.name, lock.id);
                service.getCharacteristic(Characteristic.On)
                    .on('get', lock.get.bind(lock))
                    .on('set', lock.set.bind(lock));
                return service;
            });
    }

    getServices() {
        return this.services;
    }
}
