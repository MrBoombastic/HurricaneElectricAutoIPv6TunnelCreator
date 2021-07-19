const got = require("got"),
    {box} = require('blessed'),
    styles = require("./styles.js"),
    {spawn} = require('child_process'),
    isElevated = require('is-elevated'),
    fs = require("fs"),
    ipv6 = require("ip6addr");

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    checkElevated: async (screen) => {
        if (!await isElevated()) {
            const errorBox = box(styles.sudoErrorText);
            screen.append(errorBox);
            screen.render();
            setTimeout(() => {
                screen.remove(errorBox);
                screen.render();
            }, 2000);
            return false;
        }
        return true;
    },
    checkDistroName: new Promise((resolve, reject) => {
        const distroName = spawn(`grep -oP '(?<=^ID=).+' /etc/os-release | tr -d '"'`, {shell: true});
        distroName.stdout.on('data', data => {
            resolve(data.toString().replace(/\n/g, ""));
        });
        distroName.stderr.on('data', () => {
            reject(false);
        });
    }),
    checkCompatibilityByDistroName: async (distro = module.exports.checkDistroName) => {
        return !!["arch", "debian", "ubuntu", "centos"].includes(await distro);
    },
    printTestSummary: (screen, list, tests, failReason = "") => {
        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, `INFO: All tests done. Passed ${tests.passed} of total ${tests.count} tests.`);
        module.exports.appendList(screen, list, `INFO: ${tests.count === tests.passed ? "All test passed. You are free to go!" : `One or more tests failed. ${failReason}`}`);

        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, "1.  Exit");

        //Select exit button
        list.select(Infinity);
    },
    request6: async (IP, target) => {
        return await got.get(target, {
            localAddress: IP,
            dnsLookupIpVersion: "ipv6"
        }).catch(e => e);
    },
    request4: async (target) => {
        return await got.get(target).catch(e => e);
    },
    validateIP: (IP) => {
        try {
            ipv6.parse(IP).toString();
        } catch (e) {
            IP = false;
        }
        return IP;
    },
    failSetup: (screen, list, failReason = "") => {
        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, `INFO: ${failReason}`);

        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, "1.  Exit");

        //Select exit button
        list.select(Infinity);
    },
    IPv6Enabler: (screen, list) => {
        spawn('sudo sysctl -w net.ipv6.ip_nonlocal_bind=1', {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to enable binding. Run "sysctl -w net.ipv6.ip_nonlocal_bind=1" manually.`);
        });
        spawn("sudo echo 'net.ipv6.ip_nonlocal_bind = 1' >> /etc/sysctl.conf", {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to persist binding. Add command above to '/etc/sysctl.conf' manually.`);
        });
    },
    serviceManager: (name, activity) => {
        return new Promise((resolve, reject) => {
            spawn(`sudo systemctl ${activity} ${name}`, {shell: true}).stderr.on('data', () => reject(false));
            return resolve(true);
        });
    },
    commandLocator: (name) => {
        return new Promise((resolve, reject) => {
            const locator = spawn(`sudo which ${name}`, {shell: true});
            locator.stdout.on('data', data => resolve(data.toString().replace(/\n/g, "")));
            locator.stderr.on('data', () => reject(false));
        });
    },
    serviceCreator: async (screen, list, data) => {
        const ipLocation = await module.exports.commandLocator("ip");
        module.exports.appendList(screen, list, `INFO: generating new service...`);
        const service = `[Unit]
Description=HurricaneElectric Tunnel (HEAT)
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=${ipLocation} tunnel add he-ipv6 mode sit remote ${data.endpoint} local ${data.local} ttl 255
ExecStart=${ipLocation} link set he-ipv6 up mtu 1480
ExecStart=${ipLocation} addr add ${data.address + "/64"} dev he-ipv6
ExecStart=${ipLocation} -6 route add ::/0 dev he-ipv6
ExecStart=${ipLocation} -6 route replace local ${data.routed} dev he-ipv6
ExecStop=${ipLocation} -6 route del ::/0 dev he-ipv6
ExecStop=${ipLocation} link set he-ipv6 down
ExecStop=${ipLocation} tunnel del he-ipv6

[Install]
WantedBy=multi-user.target
`;
        await fs.writeFileSync("./he-heat.service", service);
        module.exports.appendList(screen, list, `INFO: new service file generated`);
        module.exports.appendList(screen, list, `INFO: adding new service 'he-heat'...`);
        fs.copyFile('./he-heat.service', '/etc/systemd/system/he-heat.service', (err) => {
            if (err) return module.exports.appendList(screen, list, "ERROR: couldn't add service he-heat to systemd");
        });
        module.exports.appendList(screen, list, "INFO: service added, restarting systemctl daemon...");
        spawn(`sudo systemctl daemon-reload`, {shell: true}).stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to reload systemctl daemon!`);
        });
        module.exports.appendList(screen, list, "INFO: daemon restarted! Starting service...");
        const serviceStart = await module.exports.serviceManager("he-heat", "start").catch(() => false);
        module.exports.appendList(screen, list, serviceStart ? "INFO: service started successfully" : "ERROR: service failed! Run 'sudo systemctl status he-ipv6' to know more.");
        await module.exports.serviceManager("he-heat", "enable").catch(() => false);
        module.exports.appendList(screen, list, "INFO: Service enabled!");
    },
    setup: async (screen, list, data) => {
        module.exports.appendList(screen, list, `INFO: setting up...`);
        if (!await module.exports.checkCompatibilityByDistroName()) module.exports.appendList(screen, list, "WARN: This distribution has not been tested! Be careful!");
        await module.exports.serviceCreator(screen, list, data);
        module.exports.appendList(screen, list, `INFO: enabling IPv6 in the system...`);
        module.exports.IPv6Enabler(screen, list);
        module.exports.appendList(screen, list, `INFO: IPv6 enabled in the system.`);
    }
};