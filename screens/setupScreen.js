const styles = require("../styles"),
    {appendList, validateIP, failSetup, request4} = require("../tools"),
    blessed = require('blessed'),
    fs = require("fs"),
    data = {
        address: null,
        netmask: null,
        endpoint: null,
        local: null,
        ttl: 255,
        gateway: null
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
        stageText = "Netmask";
        blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, netmask) {
            if (!parseInt(netmask)) return failSetup(screen, list, `${stageText} is not valid! Enter an integer (typically 64 or 48)!`);
            appendList(screen, list, `INFO: ${stageText} is ${netmask}`);
            data.netmask = netmask;

            //STAGE 3
            stageText = "Server IPv4 Address";
            blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, endpoint) {
                endpoint = validateIP(endpoint);
                if (!endpoint) return failSetup(screen, list, `${stageText} is not valid!`);
                appendList(screen, list, `INFO: ${stageText} is ${endpoint}`);
                data.endpoint = endpoint;

                //STAGE 4
                stageText = "Client IPv4 Address";
                appendList(screen, list, `INFO: fetching ${stageText} automatically...`);
                const req = await request4("https://api64.ipify.org/?format=json");
                if (req.statusCode === 200) {
                    const localIP = JSON.parse(req.body)?.ip;
                    appendList(screen, list, `RESPONSE: ${stageText} is ${localIP}`);
                    data.local = localIP;
                } else return failSetup(screen, list, `Problem fetching ${stageText}!`);

                //STAGE 5 - LAST ONE
                stageText = "Server IPv6 Address";
                blessed.prompt(styles.prompt(screen)).input(`Enter ${stageText}`, '', async function (err, gateway) {
                    gateway = validateIP(gateway);
                    if (!gateway) return failSetup(screen, list, `${stageText} is not valid! Maybe try without '/64'.`);
                    appendList(screen, list, `INFO: ${stageText} is ${endpoint}`);
                    data.gateway = gateway;

                    appendList(screen, list, `INFO: generating new 'interfaces' file...`);
                    let interfaces = await fs.readFileSync("/etc/network/interfaces", "UTF-8");
                    interfaces += `

auto he-ipv6
iface he-ipv6 inet6 v4tunnel
        address ${data.address}
        netmask ${data.netmask}
        endpoint ${data.endpoint}
        local ${data.local}
        ttl 255
        gateway ${data.gateway}`;
                    await fs.writeFileSync("./interfaces.new", interfaces);

                });
            });
        });
    });

    list.on("select", function (data) {
        if (data.content === "1.  Exit") require("./welcomeScreen")(screen);
    });
};