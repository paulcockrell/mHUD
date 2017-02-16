import { Injectable } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { DeviceMotion } from 'ionic-native';
import { DeviceOrientation } from 'ionic-native';
import { Jsonp } from '@angular/http';

declare var cordova: any;

const request_url_road_information: string = 'https://legacy.route.cit.api.here.com/routing/6.2/getlinkinfo.json';
const here_map_app_id: string = '';
const here_map_app_code: string = '';

export interface IDataObj {
  geolocation: any,
  acceleration: any,
  compass: any,
  roadInfo: any
}

@Injectable()
export class Sensors {

  private watchAcceleration: any;
  private watchGeolocation: any;
  private watchCompass: any;
  private acceleration: any;
  private compass: any;
  private geolocation: any;
  private roadInfo: any;
  private delay: number = 10000;
  private polling: boolean = false;

  constructor(private jsonp: Jsonp) { }

  start(frequency: number): void {
    this.startGeolocation();
    this.startCompass(frequency);
    this.startAcceleration(frequency);
  }

  stop(): void {
    this.stopGeolocation();
    this.stopCompass();
    this.stopAcceleration();
  }

  startGeolocation(): void {
    this.watchGeolocation = Geolocation
      .watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true })
      .subscribe((geolocation) => {
        this.geolocation = geolocation;
        this.getRoadInformation().then(res => this.roadInfo = res);
      });
  }

  stopGeolocation(): void {
    this.geolocation = null;
    if (this.watchGeolocation) this.watchGeolocation.unsubscribe();
  }

  startCompass(frequency: number): any {
    this.watchCompass = DeviceOrientation
      .watchHeading({frequency: frequency})
      .subscribe((data: any) => {
        this.compass = data;
      });
  }

  stopCompass(): void {
    this.compass = null;
    if (this.watchCompass) this.watchCompass.unsubscribe();
  }

  startAcceleration(frequency: number): any {
    this.watchAcceleration = DeviceMotion
      .watchAcceleration({frequency: frequency})
      .subscribe((acceleration: any) => {
        this.acceleration = acceleration;
      });
  }

  stopAcceleration(): void {
    this.acceleration = null;
    if (this.watchAcceleration) this.watchAcceleration.unsubscribe();
  }

  startPolling() {
    this.polling = true;
    this.poll();
  }

  poll() {
    let geolocation = this.data().geolocation;
    if (!this.polling || !geolocation.coords.latitude || !geolocation.coord.longitude) return;

    this.getRoadInformation().then(res => this.roadInfo = res);
    setTimeout(() => this.poll(), this.delay);
  }

  stopPolling() {
    this.polling = false;
  }

  // Get speed limit via roadInfo.SpeedLimit
  public formatRoadSpeed(value: number, unit: string = '') {
    switch (unit.toLowerCase()) {
      case 'kph':
        return value * 3.6;
      case 'mph':
        return value * 2.23693629;
      default:
        throw new Error('Unknown unit');
    }
  }

  private getRoadInformation() {
    let url: string = request_url_road_information;
    let geolocation = this.data().geolocation;
    let waypoint = (geolocation.coords && geolocation.coords.latitude && geolocation.coords.longitude) ? `${geolocation.coords.latitude},${geolocation.coords.longitude}` : null;

    return new Promise((resolve, reject) => {
      if (waypoint === null) resolve(null);

      url += `?waypoint=${waypoint}&app_id=${here_map_app_id}&app_code=${here_map_app_code}&jsoncallback=JSONP_CALLBACK`;
      this.jsonp.get(url)
        .subscribe(res => {
          if (res && res.status === 200) {
            resolve(res.json().Response.Link[0]);
          }
          else {
            reject(null);
          }
        });
    });
  }

  data(): IDataObj {
    return {
      acceleration: this.acceleration || this.blank_acceleration(),
      compass: this.compass || this.blank_compass(),
      geolocation: this.geolocation || this.blank_geolocation(),
      roadInfo: this.roadInfo || this.blank_roadInfo()
    }
  }

  private blank_geolocation(): Object {
    return {
      coords: {
        latitude: null,
        longitude: null,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      }
    }
  }

  private blank_acceleration(): Object {
    return {
      x: null,
      y: null,
      z: null
    }
  }

  private blank_compass(): Object {
    return {
      magneticHeading: null,
      trueHeading: null,
      headingAccuracy: null
    }
  }

  private blank_roadInfo(): Object {
    return {
      speedLimit: null
    }
  }

}
