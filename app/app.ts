import {App, Platform} from 'ionic-angular';
import {Type} from 'angular2/core';
import {Jsonp, ConnectionBackend, JSONP_PROVIDERS} from 'angular2/http';
import {HomePage} from './pages/home/home';
import {BtobdiiService} from './services/btobdii.service';
import {GeolocationService} from './services/geolocation.service';


@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  config: {},
  providers: [BtobdiiService, GeolocationService, Jsonp, ConnectionBackend, JSONP_PROVIDERS]
})
export class MyApp {
  rootPage: Type = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // The platform is now ready. Note: if this callback fails to fire, follow
      // the Troubleshooting guide for a number of possible solutions:
      //
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //
      // First, let's hide the keyboard accessory bar (only works natively) since
      // that's a better default:
      //
      // Keyboard.setAccessoryBarVisible(false);
      //
      // For example, we might change the StatusBar color. This one below is
      // good for dark backgrounds and light text:
      // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
    });
  }
}
