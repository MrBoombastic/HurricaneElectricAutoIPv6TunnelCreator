const blessed = require('blessed'),
    styles = require("../styles");

module.exports = (screen) => {
    const list = blessed.list(styles.welcomeList);
    const text = blessed.text(styles.welcomeText);
    list.focus();
    list.addItem("0. Test system for compatibility.");
    list.addItem("1. Set up HE IPv6 tunnel.");
    list.addItem("2. Set up HE IPv6 tunnel using answer file.");
    list.addItem("3. Test system for IPv6 connection.");
    list.addItem("4. RickRoll myself.");
    screen.append(list);
    screen.append(text);
    screen.render();
    list.once("select", async function (data) {
        if (data.position.top === 0) await require("./testScreen")(screen)
    });
};