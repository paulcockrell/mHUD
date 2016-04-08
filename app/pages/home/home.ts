import {NavController, NavParams, Page} from 'ionic-angular';
import {Component, OnInit} from 'angular2/core';
import {DashboardPage} from '../dashboard/dashboard';
import {Device} from '../../services/device';
import {BtobdiiService} from '../../services/btobdii.service';
import {RpmSensorService} from '../../services/rpm-sensor.service';
import {VssSensorService} from '../../services/vss-sensor.service';

@Page({
  templateUrl: 'build/pages/home/home.html',
})
export class HomePage implements OnInit {
  devices: Device[];
  selectedDevice: Device;
  wait: boolean = false;
  bluetoothEnabled: boolean = true;

  constructor(private _btobdii: BtobdiiService, public nav: NavController) {}

  ngOnInit() {
    this.connectToBluetooth();
  }

  connectToBluetooth() {
    this.wait = true;
    this._btobdii.enabled()
      .then(() => this.getDevices())
      .catch(() => this.fail());
  }

  getDevices() {
    this._btobdii.getDevices()
      .subscribe((devices) => {
        this.bluetoothEnabled = true;
        this.wait = false;
        this.devices = devices;
      })
  }

  fail() {
    this.bluetoothEnabled = false;
    this.wait = false;
  }

  onSelect(device: Device) {
    this.selectedDevice = device
    this.nav.push(DashboardPage, { device: this.selectedDevice })
  }
}
