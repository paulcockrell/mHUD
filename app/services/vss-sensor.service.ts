import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';

@Injectable()
export class VssSensorService extends SensorService {
	static PID = "0D";

	sensor = {
	  MODE: "01",
	  PID: "0D",
	  BYTES: 1,
	  NAME: "vss",
	  MIN: 0,
	  MAX: 255,
	  UNIT: "kmh",
	  DESCRIPTION: "Vehicle speed sensor",
	  REPLIES: 1,
	  raw_data: null
	};

  constructor(private unit: string = 'Mph') {
    super();
  }

	value() {
		let _value = 0;

	  if (typeof this.unit === 'undefined' || this.unit === null || this.sensor.raw_data === null) {
      return null;
    }

    if (this.unit.toLowerCase() === 'kmh')
	    _value = parseInt(this.sensor.raw_data[2], 16) // raw->kmh
    else {
      _value = parseInt(this.sensor.raw_data[2], 16) * 0.621371 // raw->mph
    }

    if (_value > this.sensor.MAX) return _value;
    if (_value < this.sensor.MIN) return this.sensor.MIN;

    return _value;
	}
}
