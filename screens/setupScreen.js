const styles = require("../styles"),
    {
        appendList,
        validateIP,
        failSetup,
        request4,
        checkElevated,
        setup,
        checkCompatibilityByDistroName
    } = require("../tools"),
    {list, prompt} = require('blessed'),
    data = {
        address: null,
        endpoint: null,
        local: null,
        ttl: 255,
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

    /*
    WELCOME TO CALLBACK HELL
    BECAUSE SOMEHOW ASYNC/AWAIT DOESN'T WORK
    AND I DON'T WANT TO FUCK WITH THAT ANY LONGER
    */

    //STAGE 1
    let stageText = "Client IPv6 Address";
    prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, IP) {
        IP = validateIP(IP);
        if (!IP) return failSetup(screen, setupList, `${stageText} is not valid! Maybe try without '/64'.`);
        appendList(screen, setupList, `INFO: ${stageText} is ${IP}`);
        data.address = IP;

        //STAGE 2
        stageText = "Server IPv4 Address";
        prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, endpoint) {
            endpoint = validateIP(endpoint);
            if (!endpoint) return failSetup(screen, setupList, `${stageText} is not valid!`);
            appendList(screen, setupList, `INFO: ${stageText} is ${endpoint}`);
            data.endpoint = endpoint;

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
            prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, gateway) {
                gateway = validateIP(gateway);
                if (!gateway) return failSetup(screen, setupList, `${stageText} is not valid! Maybe try without '/64'.`);
                appendList(screen, setupList, `INFO: ${stageText} is ${endpoint}`);
                data.gateway = gateway;

                //STAGE 5 - LAST ONE!!!
                stageText = "Routed /64 or /48 Prefix";
                prompt(styles.prompt(screen)).input(`Enter ${stageText} (with /64 or /48 at the end)`, '', async function (err, routed) {
                    const split = routed?.split("/");
                    if (!validateIP(split?.[0]) || !split?.[1]) return failSetup(screen, setupList, `${stageText} is not valid!`);
                    appendList(screen, setupList, `INFO: ${stageText} is ${routed}`);
                    data.routed = routed;


                    await setup(screen, setupList, data); //After gathering data, start creating service

                    //Finish
                    appendList(screen, setupList, ``);
                    appendList(screen, setupList, `1.  Exit`);

                    setupList.select(Infinity);
                });
            });
        });
    });
};