const styles = require("../styles"),
    fs = require("fs"),
    {
        appendList,
        validateIP,
        failSetup,
        request4,
        setup,
        checkElevated,
        checkCompatibilityByDistroName
    } = require("../tools"),
    {list} = require('blessed'),
    data = {
        address: null,
        endpoint: null,
        local: null,
        gateway: null,
        routed: null
    };

module.exports = async (screen) => {
    if (!await checkElevated(screen)) return; //Checking sudo
    const setupList = list(styles.list);
    setupList.focus();
    screen.append(setupList);

    setupList.on("select", function (data) { //Listening to exit button
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });
    if (!await checkCompatibilityByDistroName()) appendList(screen, list, "WARN: This distribution has not been tested! Be careful!"); //Little warning, not important
    let stageText, IP;


    if (!fs.existsSync("./answer.json")) return appendList(screen, setupList, "ERROR: no answer file detected! Copy example from GitHub and fill it.");

    const answerFile = JSON.parse(fs.readFileSync("./answer.json", "UTF-8")); //Not using require, because pkg would simply swallow it

    //STAGE 1
    stageText = "Client IPv6 Address";
    IP = answerFile.ClientIPv6Address;
    IP = validateIP(IP);
    if (!IP) return failSetup(screen, setupList, `${stageText} is not valid! Maybe try without '/64'.`);
    appendList(screen, setupList, `INFO: ${stageText} is ${IP}`);
    data.address = IP;

    //STAGE 2
    stageText = "Server IPv4 Address";
    IP = answerFile.ServerIPv4Address;
    IP = validateIP(IP);
    if (!IP) return failSetup(screen, setupList, `${stageText} is not valid!`);
    appendList(screen, setupList, `INFO: ${stageText} is ${IP}`);
    data.endpoint = IP;

    //STAGE 3
    stageText = "Client IPv4 Address";
    appendList(screen, setupList, `INFO: fetching ${stageText} automatically...`);
    const req = await request4("https://api64.ipify.org/?format=json");
    if (req.statusCode === 200) {
        const localIP = JSON.parse(req.body)?.ip;
        appendList(screen, setupList, `RESPONSE: ${stageText} is ${localIP}`);
        data.local = localIP;
    } else return failSetup(screen, setupList, `Problem fetching ${stageText}!`);

    //STAGE 4
    stageText = "Server IPv6 Address";
    IP = answerFile.ServerIPv6Address;
    IP = validateIP(IP);
    if (!IP) return failSetup(screen, setupList, `${stageText} is not valid! Maybe try without '/64'.`);
    appendList(screen, setupList, `INFO: ${stageText} is ${IP}`);
    data.gateway = IP;

    //STAGE 5 - LAST ONE!!!
    stageText = "Routed /64 or /48 Prefix";
    IP = answerFile.Routed;
    if (!validateIP(IP.split("/")[0]) || !IP.split("/")?.[1]) return failSetup(screen, setupList, `${stageText} is not valid!`);
    appendList(screen, setupList, `INFO: ${stageText} is ${IP}`);
    data.routed = IP;

    await setup(screen, setupList, data); //After gathering data, start creating service

    //Finish
    appendList(screen, setupList, ``);
    appendList(screen, setupList, `1.  Exit`);

    setupList.select(Infinity);
};