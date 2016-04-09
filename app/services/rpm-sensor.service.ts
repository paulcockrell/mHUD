import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';

@Injectable()
export class RpmSensorService extends SensorService {
  static PID = "0C";

  sensor = {
     MODE: "01",
     PID: "0C",
     BYTES: 2,
     NAME: "rpm",
     MIN: 0,
     MAX: 16383.75,
     UNIT: "rev/min",
     DESCRIPTION: "Engine RPM",
     REPLIES: 1,
     raw_data: null
  };

  value() {
    if (this.sensor.raw_data === null) {
      return null;
    }

    let _value = ((parseInt(this.sensor.raw_data[2], 16) * 256) + parseInt(this.sensor.raw_data[3], 16)) / 4;
    if (_value > this.sensor.MAX) return _value;
    if (_value < this.sensor.MIN) return this.sensor.MIN;

    return _value;
  }
}
