const {list, box} = require('blessed'),
    styles = require("../styles");

module.exports = (screen) => {
    const welcomeList = list(styles.list),
        text = box(styles.welcomeText),
        tipText = box(styles.tipText);
    welcomeList.focus();
    welcomeList.addItem("0.  Test system for compatibility.");
    welcomeList.addItem("1.  Set up HE IPv6 tunnel.");
    welcomeList.addItem("2.  Set up HE IPv6 tunnel using answer file.");
    welcomeList.addItem("3.  Test system for IPv6 connection.");
    welcomeList.addItem("4.  Check for updates.")
    welcomeList.addItem("5.  RickRoll yourself.");
    welcomeList.addItem("6.  Exit.");
    screen.append(text);
    screen.append(tipText);
    screen.append(welcomeList);

    screen.render();
    welcomeList.once("select", async function (data) {
        switch (data.position.top) {
            case 0:
                return await require("./testScreen")(screen);
            case 1:
                return await require("./setupScreen")(screen);
            case 2:
                return await require("./jsonSetupScreen")(screen);
            case 3:
                return await require("./testConnectionScreen")(screen);
            case 4:
                return await require("./updateScreen")(screen)
            case 6:
                return process.exit(0);
            default:
                process.exit(0);
        }
    });
};