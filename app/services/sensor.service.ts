declare var Buffer: any;

export class SensorService {
  sensor = {
    MODE: null,
    PID: null,
    BYTES: null,
    NAME: null,
    MIN: null,
    MAX: null,
    UNIT: null,
    DESCRIPTION: null,
    REPLIES: null,
    raw_data: null
  };

  constructor() {}

  value() {}

  setValue(value) {
    this.sensor.raw_data = value;
  }

  toString() {
    return this.value() + " " + this.sensor.UNIT;
  }

  encode() {
    return new Buffer(`${this.sensor.MODE}${this.sensor.PID}${this.sensor.REPLIES}\r`);
  }
}
