//Boilerplate
const name = "HurricaneElectricAutoIPv6TunnelCreator",
    blessed = require('blessed'),
    screen = blessed.screen({
        smartCSR: true,
        title: name
    });

process.name = name;

//Render GUI
require("./screens/welcomeScreen")(screen);

//Adding cancel keys
screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0);
});