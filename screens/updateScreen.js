const styles = require("../styles"),
    {version} = require('../package.json'),
    {appendList, request4} = require("../tools"),
    {list} = require('blessed');


module.exports = async (screen) => {
    const updateList = list(styles.list);

    updateList.focus();

    updateList.on("select", function (data) {
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });
    updateList.addItem("INFO: testing started...");
    screen.append(updateList);

    //stage 1
    appendList(screen, updateList, `INFO: you are running version ${version}`);

    //stage 2
    appendList(screen, updateList, `INFO: fetching data...`);
    const req = request4("https://raw.githubusercontent.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/master/package.json");
    const newestVersion = req ? JSON.parse((await req).body).version : false;
    appendList(screen, updateList, `RESPONSE: newest available version is ${newestVersion || "(no data - try again later)"}. ${(newestVersion === version) ? "You are using latest version." : "UPDATE NOW!"}`);

    appendList(screen, updateList, ``);
    appendList(screen, updateList, `1.  Exit`);

    updateList.select(Infinity);

};