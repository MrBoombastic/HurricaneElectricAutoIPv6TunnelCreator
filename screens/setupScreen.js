const styles = require("../styles"),
    {appendList, validateIP, failSetup, request4} = require("../tools"),
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
                    if (!routed) return failSetup(screen, list, `${stageText} is not valid!`);
                    appendList(screen, list, `INFO: ${stageText} is ${routed}`);
                    data.routed = routed;

                    data.netmask = data.routed.slice(-2);
                    appendList(screen, list, `INFO: Detected Netmask is ${data.netmask}`);

                    appendList(screen, list, `INFO: generating new 'interfaces' file...`);
                    let interfaces = await fs.readFileSync("/etc/network/interfaces", "UTF-8");
                    interfaces += `

#HEAT-start
auto he-ipv6
iface he-ipv6 inet6 v4tunnel
        address ${data.address}
        netmask ${data.routed.slice(-2)}
        endpoint ${data.endpoint}
        local ${data.local}
        ttl 255
        gateway ${data.gateway}
#HEAT-end

`;
                    await fs.writeFileSync("./interfaces.new", interfaces);
                    appendList(screen, list, `INFO: new 'interfaces' file generated`);
                    const backupFilename = `interfaces-${Date.now()}.bak`;
                    appendList(screen, list, `INFO: backing up 'interfaces' file (${backupFilename})`);
                    await fs.copyFileSync("/etc/network/interfaces", `/etc/network/${backupFilename}`);
                    appendList(screen, list, `INFO: trying to overwrite current 'interfaces' file...`);
                    await fs.writeFileSync("/etc/network/interfaces", interfaces);
                    appendList(screen, list, `INFO: file overwritten. Enabling IPv6 in the system...`);
                    spawn('sudo sysctl -w net.ipv6.ip_nonlocal_bind=1', {shell: true})
                        .stderr.on('data', () => {
                        return appendList(screen, list, `ERROR: failed to enable binding. Run "sysctl -w net.ipv6.ip_nonlocal_bind=1" manually.`);
                    });
                    spawn("sudo echo 'net.ipv6.ip_nonlocal_bind = 1' >> /etc/sysctl.conf", {shell: true})
                        .stderr.on('data', () => {
                        return appendList(screen, list, `ERROR: failed to persist binding. Add command above to '/etc/sysctl.conf' manually.`);
                    });
                    spawn(`sudo ip -6 route replace local ${data.routed} dev lo`, {shell: true})
                        .stderr.on('data', () => {
                        return appendList(screen, list, `ERROR: failed to replace IPs block. Run 'ip -6 route replace local ${data.routed} dev lo' manually.`);
                    });
                    spawn(`sudo echo "$(sudo echo '@reboot sudo ip -6 route replace local ${data.routed} dev lo' ; crontab -l 2>&1)" | crontab -`, {shell: true})
                        .stderr.on('data', () => {
                        return appendList(screen, list, `ERROR: failed to persist above command. Add it to cron manually.`);
                    });
                    appendList(screen, list, `INFO: new configuration saved and enabled successfully! Reboot now!`);
                });
            });
        });
    });

    list.on("select", function (data) {
        if (data.content === "1.  Exit") require("./welcomeScreen")(screen);
    });
};