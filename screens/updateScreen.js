const styles = require("../styles"),
    {version} = require('../package.json'),
    {appendList, request4} = require("../tools"),
    {list} = require('blessed');


module.exports = async (screen) => {
    const updateList = list(styles.list);
    updateList.focus();
    screen.append(updateList);

    updateList.on("select", function (data) { //Listening to exit button
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    appendList(screen, updateList, "INFO: testing started...");

    //STAGE 1
    appendList(screen, updateList, `INFO: you are running version ${version}`);

    //STAGE 2
    appendList(screen, updateList, `INFO: fetching data...`);
    const req = request4("https://raw.githubusercontent.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/master/package.json"); //Forcing IPv4, because IPv6 may not be present or functioning properly
    const newestVersion = req ? JSON.parse((await req).body)?.version : false; //Probably will throw error, if GitHub goes down, possible fixme?
    appendList(screen, updateList, `RESPONSE: newest available version is ${newestVersion || "(no data - try again later)"}. ${(newestVersion === version) ? "You are using latest version." : "UPDATE NOW!"}`);

    appendList(screen, updateList, ``);
    appendList(screen, updateList, `1.  Exit`);

    updateList.select(Infinity);
};