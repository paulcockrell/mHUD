import {NavController, NavParams, Page} from 'ionic-angular';
import {GeolocationService} from '../../services/geolocation.service';
import {BtobdiiService} from '../../services/btobdii.service';
import {RpmSensorService} from '../../services/rpm-sensor.service';
import {VssSensorService} from '../../services/vss-sensor.service';
import {Clock} from '../../components/clock/clock';
import {Output} from 'angular2/core';
import {Device} from '../../services/device';

@Page({
  templateUrl: 'build/pages/dashboard/dashboard.html',
  directives: [Clock]
})
export class DashboardPage {
  private device: Device;
  private interval_device: number;

  failedToConnect: boolean = false;
  speed: number = 0;
  speedlimit: number = 0;
  rpm: number = 0;
  wait: boolean = true;
  mirrored: boolean = false;

  constructor(private _btobdii: BtobdiiService, private _gps: GeolocationService, private params: NavParams, private nav: NavController) {
    this.device = params.data.device;
  }

  ngOnInit() {
    this.connect();
  }

  ngOnDestroy() {
    this.disconnect();
  }

  connect() {
    this.connectBluetooth();
    this.connectGeolocation();
  }

  mirror() {
    this.mirrored = !this.mirrored;
  }

  deviceName() {
    return this.device.name;
  }

  private connectBluetooth() {
    let btobdii = this._btobdii;

    btobdii.connectDevice(this.device.address)
    .then(() => btobdii.initializeDevice())
    .then(() => {
      let rpmSensor = new RpmSensorService();
      let vssSensor = new VssSensorService();
      btobdii.registerSensors([rpmSensor, vssSensor]).startPolling();
      this.wait = false;
      this.update();
    })
    .catch(err => {
      this.failedToConnect = true;
      this.disconnect();
    });
  }

  private connectGeolocation() {
    let gps = this._gps;

    if (gps.gpsEnabled()) {
      gps.startPolling();
    }
  }

  private update() {
    this.interval_device = setInterval(() => {
      this.speed = this._btobdii.registry[VssSensorService.PID].value() || 0;
      this.speedlimit = this._gps.getRoadSpeedLimit();
      this.rpm = this._btobdii.registry[RpmSensorService.PID].value() || 0;
    }, 100)
  }

  private disconnect() {
    this.interval_device = null;
    this._gps.stopPolling();
    this._btobdii.disconnectDevice();
  }

}
