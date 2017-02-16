import { Component } from '@angular/core';
import { Clock } from '../../components/clock/clock';
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
      })
  }

  startReadSensorData(): void {
    this.requestData = setInterval(() => {
      this.data = this.sensors.data();  
      console.log(this.data);
    }, 200);
  }

  stopReadSensorData(): void {
    if (this.requestData) clearInterval(this.requestData);
  }

  ngOnDestroy(): void {
    this.stopReadSensorData();
    this.sensors.stop();
  }

}
