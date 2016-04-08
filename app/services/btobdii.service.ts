import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import {CommandService} from './command.service';
import {Device} from './device';
import {DEVICES} from './mock-devices';
import {Platform} from 'ionic-angular';

declare var bluetoothSerial: any;

@Injectable()
export class BtobdiiService {
  private init_commands: string[] = ["ATZ", "ATL0", "AT50", "AT50", "ATH0", "ATE0", "ATAT2", "ATSP0"];

  registry: Object = {}; // Hold all command/sensor objects
  write_delay: number = 50; // Constant for defining delay between writes.
  wait_delay: number = 300; // Constant for defining delay between queue processing
  connected: boolean = false;
  initialized: boolean = false;
  polling: boolean = false;
  received_data: string = "";
  devices: Device[];

  constructor(public platform: Platform) {}

  enabled() {
    return new Promise((resolve, reject) => {
      bluetoothSerial.isEnabled(
        resolve,
        reject
      )
    });
  }

  registerSensors(sensors) {
    let obj = {};
    sensors.forEach((sensor) => this.registry[sensor.sensor.PID] = sensor);

    return this;
  }

  buildQueue() {
    let registry = this.registry
    if (this.initialized === true) {
      return Object.keys(registry).map((key) => registry[key]);
    }
    else {
      return [];
    }
  }

  poll() {
    if (!this.polling) return;

    setTimeout(() => {
      let queue = this.buildQueue();
      this.createIntervalWriter(queue)
        .then(() => this.poll());
    }, this.wait_delay);
  }

  startPolling() {
    this.polling = true;
    this.listen();
    this.poll();
  }

  stopPolling() {
    this.polling = false;
  }

  createIntervalWriter(queue) {
    return new Promise((resolve, reject) => {
      if (!this.connected || typeof queue === "undefined" ) {
        resolve()
      }
      else {
        this.writer(queue, resolve);
      }
    });
  }

  writer(queue, resolve) {
    if (queue.length < 1) {
      resolve()
    }
    else {
      setTimeout(() => {
        let obj = queue.shift();

        this.bluetoothWrite(obj.encode())
          .then(response => this.writer(queue, resolve));
      }, this.write_delay);
    }
  }

  bluetoothWrite(data) {
    return new Promise((resolve, reject) => {
      bluetoothSerial.write(data, function (response) {
        resolve(response);
      }, function (err) {
        reject(err);
      });
    });
  }

  containsData(hex_string) {
    if (hex_string === "NO DATA" ||
        hex_string === "OK" ||
        hex_string === "?" ||
        hex_string === "UNABLE TO CONNECT" ||
        hex_string === "SEARCHING..." ) {
      return false;
    }
    else {
      return true;
    }
  }

  buildResponseArray(hex_string) {
    hex_string = hex_string.replace( / /g, '' );
    return hex_string.match( /.{2}/g );
  }

  /**
   * Parses a hexadecimal string to a reply object. Uses PIDS. (obdInfo.js)
   */
  parseOBDCommand(hex_string) {
    // No data or OK is the response, return directly.
    if (!this.containsData(hex_string)) return hex_string;

    let response_array = this.buildResponseArray(hex_string);
    let mode = response_array[0];
    let pid = response_array[1];

    if (mode === "41") {
      return {
        pid: pid,
        response: response_array
      }
    }
    else if (mode === "43") {
      return {
        pid: null,
        response: null
      }
    }
    else {
      return null
    }
  }

  /**
   * Connect/Open the bluetooth serial port and add events to bluetooth-serial-port.
   * @this {BtOBDII}
   */
  connectDevice(mac_address) {
    let that = this

    return new Promise((resolve, reject) => {
      bluetoothSerial.connect(mac_address, function () {
        that.connected = true;
        resolve();
      }, function (err) {
        reject(err);
      });
    });
  }

  initializeDevice() {
    let ic = this.init_commands.map((command) => {
      return new CommandService(command);
    })

    return new Promise((resolve, reject) => {
      this.createIntervalWriter(ic)
        .then(() => {
          this.initialized = true
          resolve()
        })
    });
  }

  listen() {
    let current_string = ""
    let received_data = ""
    let array_of_commands
    let for_string
    let multiple_messages
    let message_string
    let command_obj
    let that = this

    bluetoothSerial.subscribe(">", (data) => {
      current_string = data.toString("utf8").replace(/(>|\r)/g, '');
      command_obj = that.parseOBDCommand(current_string);

      if (command_obj === undefined || command_obj === null || command_obj.pid === null) {
        console.log("Data was obdii init command response only");
      }
      else {
        let sensor_pid = command_obj.pid;
        let sensor_value = command_obj.response;
        let sensor = that.registry[sensor_pid];
        if (sensor) {
          sensor.setValue(sensor_value);
        }
      }
    }, function (error) {
      console.log("Error receiving data: ", error);
    })
  }

  /**
   * Disconnects/closes the port.
   * @this {BtOBDII}
   */
  disconnectDevice() {
    return new Promise((resolve, reject) => {
      bluetoothSerial.unsubscribe(function () {
        bluetoothSerial.disconnect(function () {
          this.connected = false;
          this.initialized = false;
          resolve();
        }, function () {
          this.connected = true;
          reject();
        })
      }, function () {
        reject();
      });
    })
  }

  /*
   Gets paired bluetooth device
   {"name":"OBDII","address":"88:18:56:68:98:EB","id":"88:18:56:68:98:EB","class":7936}
  */
  getDevices() {
    return Observable.create(observer => {
      this.platform.ready().then(() => {
        bluetoothSerial.list( data => {
          observer.next(data);
          observer.complete();
        });
      });
    });
  }

  getMockDevices() {
    return Observable.create(observer => {
      observer.next(DEVICES);
      observer.complete();
    });
  }
}
