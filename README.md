# mHUD - An Ionic 2 Mobile heads-up display

This app turns your phone in to a heads-up display for your car. It displays
your current speed, rpm, and the road speed limit.

This project requires the purchase of an ELM327 bluetooth OBDII device. These
devices can be bought online for around $10 on Amazon.

This application is built with Ionic 2 and Angular 2 in typescript.
It demonstrates connecting and communicating with bluetooth
devices, using the mobiles GPS, and making API calls over the cellular network.

It reads the following information and displays it on the HUD:

1. Vehicle speed, from the engine ECU.
2. Engine RPM, from the engine ECU.
3. Current location, from the mobile device's GPS
4. The current roads speed limit, using HERE maps API (requires a subscription,
  which is free within specified usage limits).

![Image](./HUDMode.jpg?raw=true)
![Image](./RegularMode.jpg?raw=true)

# Patches
A modification must be made to Angular to make it compile until its resolved in
the build
In the top of the file node_modules/angular2/src/facade/promise.d.ts add
```
declare var Promise: PromiseConstructor;
```
# Development
## Deploy to android
You must have all the relevant android tools installed, for example adb, and
have the phone in debug mode, with USB debugging enabled.
```
$> ionic run android
```

### Debug while running on android (open chrome browser)
You can debug your application while its running on your android device using
the Chrome developer tools. After deploying your application, navigate your
Chrome browser to the following URL. It will list your connected mobile devices
and allow you to see relevant logs.
```
$> chrome chrome://inspect/#devices
```

## Deploy to browser (testing)
This option has live reloading. The browser on your machine wont be able to use
the bluetooth, limiting how much you can debug.
```
$> ionic serve
```

You will need to bypass the bluetooth connectivity tests and retrieval of
devices, to do so, modify the ngOnInit method in home.ts:
```
  ngOnInit() {
    this._btobdii.getMockDevices()
      .subscribe((devices) => {
        this.bluetoothEnabled = true;
        this.wait = false;
        this.devices = devices;
      })
  }
```
