const styles = require("../styles"),
    {appendList, validateIP, failSetup, request4, interfacesCreator, IPv6Enabler} = require("../tools"),
    blessed = require('blessed'),
    {spawn} = require('child_process'),
    fs = require("fs"),
    data = {
        address: null,
        netmask: null,
        endpoint: null,
        local: null,
        ttl: 255,
        gateway: null,
        routed: null
    };

module.exports = async (screen) => {
    const list = blessed.list(styles.list);
    list.focus();
    screen.append(list);

    //WELCOME TO CALLBACK HELL
    //BECAUSE SOMEHOW ASYNC/AWAIT DOESN'T WORK

    //STAGE 1
    let stageText = "Client IPv6 Address";
    blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, IP) {
        IP = validateIP(IP);
        if (!IP) return failSetup(screen, list, `${stageText} is not valid! Maybe try without '/64'.`);
        appendList(screen, list, `INFO: ${stageText} is ${IP}`);
        data.address = IP;

        //STAGE 2
        stageText = "Server IPv4 Address";
        blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, endpoint) {
            endpoint = validateIP(endpoint);
            if (!endpoint) return failSetup(screen, list, `${stageText} is not valid!`);
            appendList(screen, list, `INFO: ${stageText} is ${endpoint}`);
            data.endpoint = endpoint;

            //STAGE 3
            stageText = "Client IPv4 Address";
            appendList(screen, list, `INFO: fetching ${stageText} automatically...`);
            const req = await request4("https://api64.ipify.org/?format=json");
            if (req.statusCode === 200) {
                const localIP = JSON.parse(req.body)?.ip;
                appendList(screen, list, `RESPONSE: ${stageText} is ${localIP}`);
                data.local = localIP;
            } else return failSetup(screen, list, `Problem fetching ${stageText}!`);

            //STAGE 4
            stageText = "Server IPv6 Address";
            blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, gateway) {
                gateway = validateIP(gateway);
                if (!gateway) return failSetup(screen, list, `${stageText} is not valid! Maybe try without '/64'.`);
                appendList(screen, list, `INFO: ${stageText} is ${endpoint}`);
                data.gateway = gateway;

                //STAGE 5 - LAST ONE!!!
                stageText = "Routed /64 or /48 Prefix";
                blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText} (with /64 or /48 at the end)`, '', async function (err, routed) {
                    if (!validateIP(routed.split("/")[0]) || !data.routed.split("/")?.[1]) return failSetup(screen, list, `${stageText} is not valid!`);
                    appendList(screen, list, `INFO: ${stageText} is ${routed}`);
                    data.routed = routed;

                    data.netmask = data.routed.split("/")[1]
                    appendList(screen, list, `INFO: Detected Netmask is ${data.netmask}`);

                    await interfacesCreator(screen, list, data)
                    appendList(screen, list, `INFO: file overwritten. Enabling IPv6 in the system...`);

                    IPv6Enabler(screen, list, data);
                    appendList(screen, list, `INFO: new configuration saved and enabled successfully! Reboot now!`);

                    //Finish
                    appendList(screen, list, ``);
                    appendList(screen, list, `1.  Exit`);

                    list.select(Infinity);
                });
            });
        });
    });

    list.on("select", function (data) {
        if (data.content === "1.  Exit") require("./welcomeScreen")(screen);
    });
};