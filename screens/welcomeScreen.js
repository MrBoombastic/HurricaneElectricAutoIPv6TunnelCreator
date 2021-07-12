const blessed = require('blessed'),
    styles = require("../styles");

module.exports = (screen) => {
    const list = blessed.list(styles.list),
        text = blessed.box(styles.welcomeText),
        tipText = blessed.box(styles.tipText);
    list.focus();
    list.addItem("0.  Test system for compatibility.");
    list.addItem("1.  Set up HE IPv6 tunnel.");
    list.addItem("2.  Set up HE IPv6 tunnel using answer file.");
    list.addItem("3.  Test system for IPv6 connection.");
    list.addItem("4.  RickRoll yourself.");
    list.addItem("5.  Exit.");
    screen.append(text);
    screen.append(tipText);
    screen.append(list);

    screen.render();
    list.once("select", async function (data) {
        switch (data.position.top) {
            case 0:
                return await require("./testScreen")(screen);
            case 3:
                return await require("./testConnectionScreen")(screen);
            case 5:
                process.exit(0)
        }
    });
};