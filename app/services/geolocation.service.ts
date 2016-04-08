import {SensorService} from './sensor.service';
import {Injectable} from 'angular2/core';
import {Jsonp} from 'angular2/http';

@Injectable()
export class GeolocationService {
  private request_url_road_information: string = 'https://legacy.route.cit.api.here.com/routing/6.2/getlinkinfo.json';
  private here_map_app_id: string = '<here.map.app.id>';
  private here_map_app_code: string = '<here.map.app.code>';

  polling: boolean = false;
  delay: number = 10000;
  KEY: string = "gps";
  data: any = {
    coords: null,
    timestamp: null,
    roadInfo: null
  };
  options: any = {
    maximumAge: 3000,
    timeout: 25000,
    enableHighAccuracy: true
  };

  constructor(private jsonp: Jsonp) {}

	getShortName(name: string) {
	  let short_name = name
	    .replace( /north/g, "N" )
	    .replace( /east/g, "E" )
	    .replace( /south/g, "S" )
	    .replace( /west/g, "W" )
	    .replace( /by/g, "b" )
	    .replace( /[\s-]/g, "" );

	  return short_name;
	}

	calculatePoint(input: number) {
	  input = (input / 8) | 0 % 4;
	  let j: number = input % 8;
	  let cardinal: string[] = ['north', 'east', 'south', 'west'];
	  let pointDesc: string[] = ['1', '1 by 2', '1-C', 'C by 1', 'C', 'C by 2', '2-C', '2 by 1'];
	  let str1: string;
	  let str2: string;
	  let strC: string;
	  let point;

	  str1 = cardinal[input];
	  str2 = cardinal[( input + 1 ) % 4];
	  strC = (str1 == cardinal[0] || str1 == cardinal[2]) ? str1 + str2 : str2 + str1;

	  point = pointDesc[j]
	    .replace( /1/, str1 )
	    .replace( /2/, str2 )
	    .replace( /C/, strC );

	  return point;
	}

	compass() {
	  let name: string;
	  let shortName: string;
	  let input: number;

	  input = this.data.coords ? ( this.data.coords.heading || 1 ) / 11.25 : 1 / 11.25
	  input = input + .5 | 0
	  name = this.calculatePoint(input)
	  shortName = this.getShortName(name)
	  name = name[0].toUpperCase() + name.slice( 1 )

	  return {
      name: name,
      shortName: shortName
	  }
	}

  getRoadInformation() {
    let url: string = this.request_url_road_information;
    let data = this.data;
	  let waypoint = (data.coords.latitude && data.coords.longitude) ? `${data.coords.latitude},${data.coords.longitude}` : null;

    return new Promise((resolve, reject) => {
      if (waypoint === null) resolve(null);

      url += `?waypoint=${waypoint}&app_id=${this.here_map_app_id}&app_code=${this.here_map_app_code}&jsoncallback=JSONP_CALLBACK`;
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

  getRoadSpeedLimit(unit: string = "mph") {
    let speedLimit: number;

    if (this.data.roadInfo && this.data.roadInfo.SpeedLimit) {
      speedLimit = this.formatValue(this.data.roadInfo.SpeedLimit, unit);
    }
    else {
      speedLimit = null;
    }

    return speedLimit;
  }

	startPolling() {
    this.polling = true;
    this.poll();
  }

   poll() {
    let that = this;

    if (!this.polling) {
      return;
    }

	  navigator.geolocation.getCurrentPosition(
      (position) => {
        that.data.coords = position.coords;
        that.data.timestamp = position.timestamp;
        that.getRoadInformation().then(res => that.data.roadInfo = res);
        setTimeout(() => that.poll(), that.delay);
      },
      (error) => {
        console.log(error);
        setTimeout(() => that.poll(), that.delay);
      },
	    this.options
    );
	}

	stopPolling() {
    this.polling = false;
	}

	value(key: string) {
	  if ( key && Object.hasOwnProperty( key ) ) {
	    return this.data[key];
    }
	  else {
	    return null;
    }
	}

	formatValue(value: number, unit: string = '') {
	  switch (unit.toLowerCase()) {
	    case 'kph':
        return value * 3.6;
	    case 'mph':
	      return value * 2.23693629;
	    default:
        throw new Error('Unknown unit');
	  }
	}

	gpsEnabled() {
    return (typeof navigator.geolocation !== "undefined" || navigator.geolocation !== null );
	}
}

export interface GeolocationResults {
  coords: {
    heading: number,
    latitude: number,
    longitude: number,
  };
  timestamp: string;
  roadInfo: any;
}
