# About
This is an Ionic 2 Typescript mobile heads up display application.
It uses the phones sensors to obtain speed, location and gforce values for display.
It uses here maps to get the road speed which forms part of the display.

![Image](./hud-image.jpg?raw=true)

# Clone this repo
```
git clone git@github.com:paulcockrell/mHUD.git
```

# Install
You will need to install the correct development tools for your target mobile OS.
See https://ionicframework.com/docs/v2/intro/installation/#platform-guides
```
npm install -g ionic cordova
npm install
ionic state restore
```

# Here map app credentials
This app uses Here maps to get the road speed for a given location. You can open
a free developer account with them, create an app, and use the credentials in this
application.

Here maps: https://developer.here.com/plans?create=Public_Free_Plan_Monthly

Put your JavaScript/REST app-id and app-code in the following file: src/providers/sensors.ts

```
const here_map_app_id: string = 'XXX';
const here_map_app_code: string = 'XXX';
```

# Run
```
ionic run android --device
```

# Debug
You can debug in the Chrome browser, while your phone is connected with the app running.

Point Chrome to 
```
chrome://inspect/#devices
```
