import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';

@Injectable()
export class FuelLevelSensorService extends SensorService {
  sensor = {
    MODE: "01",
    PID: "2F",
    BYTES: 1,
    NAME: "fuel level",
    MIN: 0,
    MAX: 100,
    UNIT: "%",
    DESCRIPTION: "Fuel level",
    REPLIES: 1,
    raw_data: null
  };

	value() {
	  if (this.sensor.raw_data === null) {
      return null;
    }
    
	  return (parseInt(this.sensor.raw_data[0], 16) * 100 / 255).toFixed(2);
	}
}
