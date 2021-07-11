const blessed = require('blessed'),
    styles = require("../styles");

module.exports = (screen) => {
    const list = blessed.list(styles.list),
        text = blessed.box(styles.welcomeText),
        tipText = blessed.box(styles.tipText);
    list.focus();
    list.addItem("Test system for compatibility.");
    list.addItem("Set up HE IPv6 tunnel.");
    list.addItem("Set up HE IPv6 tunnel using answer file.");
    list.addItem("Test system for IPv6 connection.");
    list.addItem("RickRoll yourself.");
    screen.append(text);
    screen.append(tipText);
    screen.append(list);

    screen.render();
    list.once("select", async function (data) {
        if (data.position.top === 0) await require("./testScreen")(screen);
        if (data.position.top === 3) await require("./testConnectionScreen")(screen);
    });
};