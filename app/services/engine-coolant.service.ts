import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';

@Injectable()
export class EngineCoolantService extends SensorService {
  sensor = {
    MODE: "01",
    PID: "05",
    BYTES: 1,
    NAME: "water",
    MIN: -40,
    MAX: 215,
    UNIT: "°C",
    DESCRIPTION: "Engine coolant temperature",
    REPLIES: 1,
    raw_data: null
  };

  value() {
	  if (this.sensor.raw_data === null) {
      return null;
    }

    return (parseInt(this.sensor.raw_data[2], 16) - 40);
  }
}
