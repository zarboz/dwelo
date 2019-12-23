const https = require('https');

const SUCCESS = null;

const deviceMap = new Map<number, boolean>();

class Dwelolock {
    constructor(private readonly api, public readonly id) {
    }

    get = (callback) => {
        this.api.getStatus(this.id)
            .then(isOn => callback(SUCCESS, isOn))
            .catch(callback);
    }

    set = (state, callback) => {
        this.api.togglelock(state, this.id)
            .then(() => callback(SUCCESS))
            .catch(callback);
    }
}

export class DweloApi {
    constructor(private readonly home, private readonly token) {
    }

    createlock(id) {
        return new Dwelolock(this, id);
    }

    makeRequest(path) {
        const _headers = {
            'Authorization': "Token " + this.token
        };
        let _content = undefined;

        const makeRequest = (method) => {
            return new Promise<{[key: string]: any}>((resolve) => {
                const request = https.request({
                    host: 'api.dwelo.com',
                    path: path,
                    port: 443,
                    method: method,
                    headers: _headers
                }, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log("->::"+chunk);
                        resolve(JSON.parse(chunk));
                    });
                });

                _content && request.write(_content);
                request.end();
            });
        }

        return {
            POST: (content) => {
                _headers['Content-Type'] = 'application/json;charset=UTF-8';
                _headers['Content-Length'] = Buffer.byteLength(content);
                _content = content;
                return makeRequest('POST');
            },
            GET: () => {
                return makeRequest('GET');
            }
        }
    }

    togglelock(lock: boolean, id: number) {
        const command = `{"command":"${lock ? 'locked' : 'unlocked'}"}`;
        const path = `/v3/device/${id}/command/`;
        deviceMap.set(id, lock);
        return this.makeRequest(path).POST(command);
    }

    getStatus(deviceId: number) {
        return new Promise<boolean>((resolve) => {
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
    }
}