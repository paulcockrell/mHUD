import { Injectable } from '@angular/core';
import { Geolocation } from 'ionic-native';
import { DeviceMotion } from 'ionic-native';
import { DeviceOrientation } from 'ionic-native';
import { Jsonp } from '@angular/http';

declare var cordova: any;

const request_url_road_information: string = 'https://route.cit.api.here.com/routing/7.2/getlinkinfo.json';
const here_map_app_id: string = 'UwStla46BWLH8ScOl6V3';
const here_map_app_code: string = '2fh5ihUvdlJ0csRT_pjnHQ';

export interface IDataObj {
  geolocation: any,
  acceleration: any,
  compass: any,
  speedLimit: number,
  gforce: number
}

@Injectable()
export class Sensors {

  private watchAcceleration: any;
  private watchGeolocation: any;
  private watchCompass: any;
  private acceleration: any;
  private compass: any;
  private gforce: number;
  private geolocation: any;
  private speedLimit: any;
  private delay: number = 10000;
  private polling: boolean = false;

  constructor(private jsonp: Jsonp) { }

  start(frequency: number): void {
    this.polling = true;

    this.startGeolocation();
    this.startCompass(frequency);
    this.startAcceleration(frequency);
    this.startRoadInfo();
  }

  stop(): void {
    this.stopGeolocation();
    this.stopCompass();
    this.stopAcceleration();
    this.stopRoadInfo();
  }

  startGeolocation(): void {
    this.watchGeolocation = Geolocation
      .watchPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true })
      .subscribe((geolocation) => {
        this.geolocation = geolocation;
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
        this.compass = this.translateCompass(data);
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
        this.gforce = this.calculateGforce(acceleration);
      });
  }

  stopAcceleration(): void {
    this.acceleration = null;
    if (this.watchAcceleration) this.watchAcceleration.unsubscribe();
  }

  startRoadInfo() {
    if (!this.polling) return;

    let geolocation = this.data().geolocation;
    if (geolocation.coords.latitude && geolocation.coords.longitude)
      this.getSpeedLimit(geolocation.coords.latitude, geolocation.coords.longitude).then(res => {
        let cleanSpeedLimit = Math.round(res / 10) * 10;
        this.speedLimit = this.formatRoadSpeed(cleanSpeedLimit, 'mph');
        setTimeout(() => this.startRoadInfo(), this.delay);
      });
    else
      setTimeout(() => this.startRoadInfo(), this.delay);
  }

  stopRoadInfo() {
    this.polling = false;
  }

  private calculateGforce(acceleration: any): number {
    let x = acceleration.x;
    let y = acceleration.y;
    let z = acceleration.z;

    let gforce = Math.sqrt(x * x + y * y + z * z) / 9.80665;
    return gforce;
  }

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

  private getSpeedLimit(latitude: number, longitude: number) {
    let url: string = request_url_road_information;
    let waypoint = `${latitude},${longitude}`;

    return new Promise((resolve, reject) => {
      if (waypoint === null) resolve(null);

      url += `?waypoint=${waypoint}&app_id=${here_map_app_id}&app_code=${here_map_app_code}&jsoncallback=JSONP_CALLBACK`;
      this.jsonp.get(url)
        .subscribe(res => {
          if (res && res.status === 200) {
            resolve(res.json().response.link[0].speedLimit);
          }
          else {
            reject(null);
          }
        });
    });
  }

  private translateCompass(data) {
    let name: string;
    let shortName: string;
    let input: number;

    input = data.trueHeading > 0 ? ( data.trueHeading || 1 ) / 11.25 : 1 / 11.25
    input = input + .5 | 0
    name = this.calculatePoint(input)
    shortName = this.getShortName(name)
    name = name[0].toUpperCase() + name.slice(1)

    return {
      name: name,
      shortName: shortName
    }
  }

  private calculatePoint(input: number) {
    input = (input / 8) | 0 % 4;
    let j: number = input % 8;
    let cardinal: string[] = ['north', 'east', 'south', 'west'];
    let pointDesc: string[] = ['1', '1 by 2', '2-C', 'C by 1', 'C', 'C by 2', '2-C', '2 by 1'];
    let str1: string;
    let str2: string;
    let strC: string;
    let point;

    str1 = cardinal[input];
    str2 = cardinal[(input + 1) % 4];
    strC = (str1 == cardinal[0] || str1 == cardinal[2]) ? str1 + str2 : str2 + str1;

    point =pointDesc[j]
      .replace( /1/, str1 )
      .replace( /2/, str2 )
      .replace( /C/, strC );

    return point;
  }

  private getShortName(name: string) {
    let short_name = name
      .replace( /north/g, 'N' )
      .replace( /east/g, 'E' )
      .replace( /south/g, 'S' )
      .replace( /west/g, 'W' )
      .replace( /by/g, 'b' )
      .replace( /[\s-]/g, '');

    return short_name;
  }

  data(): IDataObj {
    return {
      acceleration: this.acceleration || this.blank_acceleration(),
      compass: this.compass || this.blank_compass(),
      geolocation: this.geolocation || this.blank_geolocation(),
      speedLimit: this.speedLimit || this.blank_speedLimit(),
      gforce: this.gforce || this.blank_gforce()
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
      x: 0,
      y: 0,
      z: 0
    }
  }

  private blank_compass(): Object {
    return {
      name: "",
      shortName: ""
    }
  }

  private blank_speedLimit(): number {
    return 0;
  }

  private blank_gforce(): number {
    return 0;
  }

}
