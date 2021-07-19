//Boilerplate
const name = "HurricaneElectricAutoIPv6TunnelCreator",
    {screen} = require('blessed'),
    programScreen = screen({
        smartCSR: true,
        title: name
    });

process.name = name;

//Render TUI
require("./screens/welcomeScreen")(programScreen);

//Adding cancel keys
programScreen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0);
});