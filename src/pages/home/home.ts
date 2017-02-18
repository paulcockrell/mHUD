import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { Sensors, IDataObj } from '../../providers/sensors';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private requestData: number;
  public data: IDataObj;
  private interval: number = undefined;
  private current_theme_idx = 0;
  private themes = [
    'light',
    'dark',
    'green',
    'red',
    'blue',
  ]

  theme: string = this.themes[0];
  digit_to_name: string[] = [
    'zero', 'one', 'two', 'three', 'four',
    'five', 'six', 'seven', 'eight', 'nine'
  ];
  segment_numbers: number[] = [
    1, 2, 3, 4, 5, 6, 7
  ];

  speed_unit: string = "MPH";
  rpm_unit: string = "x1000 RPM";
  heading_unit: string = "HEADING";
  gforce_unit: string = "GFORCE";
  speed_limit_unit: string = "SPEED LIMIT"

  speed_hundreds;
  speed_tens;
  speed_ones;
  speed_limit_tens;
  speed_limit_ones;
  gforce_tens;
  gforce_ones;
  gforce_tens_idx: number = 0;

  speed: number = 0;
  speedLimit: number = 0;

  gforce: number =0;

  heading: string = "N";
  mirrored: boolean = false;

  constructor(
    public navCtrl: NavController,
    private sensors: Sensors,
    private platform: Platform
  ) {
    platform
      .ready()
      .then(() => {
        console.log("Starting sensors");
        this.sensors.start(200);
        this.startReadSensorData(); 
        this.interval = setInterval(() => this.updateReadings(), 100);
      })
  }

  mirror() {
    this.mirrored = !this.mirrored;
  }

  startReadSensorData(): void {
    this.requestData = setInterval(() => {
      let data = this.sensors.data();  
      this.speed = this.sensors.formatRoadSpeed(data.geolocation.coords.speed, 'mph');
      this.heading = data.compass.trueHeading;
      this.gforce = data.gforce;
      this.speedLimit = data.speedLimit;
      
    }, 100);
  }

  stopReadSensorData(): void {
    if (this.requestData) clearInterval(this.requestData);
  }

  updateReadings() {
    let speed_limit_string = ("00" + Math.round(this.speedLimit)).slice(-2);
    let speed_string = ("000" + Math.round(this.speed)).slice(-3);

    // Gforce is a decimal number, so make a whole number where we treat the first
    // digit as an integer and the second number as the decimal
    let gforce_string = ("00" + Math.round(Number(this.gforce.toFixed(1)) * 10)).slice(-2);

    let speed_limit_tens_idx = Number(speed_limit_string.charAt(0));
    let speed_limit_ones_idx = Number(speed_limit_string.charAt(1));

    let speed_hundreds_idx = Number(speed_string.charAt(0));
    let speed_tens_idx = Number(speed_string.charAt(1));
    let speed_ones_idx = Number(speed_string.charAt(2));

    let gforce_tens_idx = Number(gforce_string.charAt(0));
    let gforce_ones_idx = Number(gforce_string.charAt(1));

    this.speed_limit_tens = this.digit_to_name[speed_limit_tens_idx];
    this.speed_limit_ones = this.digit_to_name[speed_limit_ones_idx];

    this.speed_hundreds = this.digit_to_name[speed_hundreds_idx];
    this.speed_tens = this.digit_to_name[speed_tens_idx];
    this.speed_ones = this.digit_to_name[speed_ones_idx];

    this.gforce_tens = this.digit_to_name[gforce_tens_idx];
    this.gforce_ones = this.digit_to_name[gforce_ones_idx];
    this.gforce_tens_idx = gforce_tens_idx;
  }

  changeTheme() {
    this.current_theme_idx++
    if (this.current_theme_idx > (this.themes.length - 1)) {
      this.current_theme_idx = 0
    }
    this.theme = this.themes[this.current_theme_idx];
  }

  ngOnDestroy(): void {
    this.stopReadSensorData();
    this.sensors.stop();
  }
}
