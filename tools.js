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
            resolve(data.toString().replace(/\n/g, " ").replaceAll(" ", ""));
        });
        distroName.stderr.on('data', () => {
            reject(false);
        });
    }),
    checkCompatibilityByDistroName: async (distro = module.exports.checkDistroName) => {
        return !!["arch", "manjaro", "debian"].includes(await distro);
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
    IPv6Enabler: (screen, list, data, device = "lo") => { //debian & arch
        spawn('sudo sysctl -w net.ipv6.ip_nonlocal_bind=1', {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to enable binding. Run "sysctl -w net.ipv6.ip_nonlocal_bind=1" manually.`);
        });
        spawn("sudo echo 'net.ipv6.ip_nonlocal_bind = 1' >> /etc/sysctl.conf", {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to persist binding. Add command above to '/etc/sysctl.conf' manually.`);
        });
        spawn(`sudo ip -6 route replace local ${data.routed} dev ${device}`, {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to replace IPs block. Run 'ip -6 route replace local ${data.routed} dev ${device}' manually.`);
        });
        spawn(`(sudo crontab -l 2>/dev/null | grep -v '^[a-zA-Z]'; echo "@reboot sudo ip -6 route replace local ${data.routed} dev lo") | sort - | uniq - | sudo crontab -`, {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to add '@reboot ip -6 route replace local ${data.routed} dev lo' to cron.`);
        });
    },
    interfacesCreator: async (screen, list, data) => { //currently debian only
        module.exports.appendList(screen, list, `INFO: generating new 'interfaces' file...`);
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
        module.exports.appendList(screen, list, `INFO: new 'interfaces' file generated`);
        const backupFilename = `interfaces-${Date.now()}.bak`;
        module.exports.appendList(screen, list, `INFO: backing up 'interfaces' file (${backupFilename})`);
        await fs.copyFileSync("/etc/network/interfaces", `/etc/network/${backupFilename}`);
        module.exports.appendList(screen, list, `INFO: trying to overwrite current 'interfaces' file...`);
        await fs.writeFileSync("/etc/network/interfaces", interfaces);
    },
    serviceManager: (name, activity) => {
        return new Promise((resolve, reject) => {
            const service = spawn(`sudo systemctl ${activity} ${name}`, {shell: true});
            service.stdout.on('data', () => {
                resolve();
            });
            service.stderr.on('data', () => {
                reject(false);
            });
        });
    },
    serviceCreator: async (screen, list, data) => {
        module.exports.appendList(screen, list, `INFO: generating new 'interfaces' file...`);
        const service = `
[Unit]
Description=HurricaneElectric Tunnel (HEAT)
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/bin/ip tunnel add he-ipv6 mode sit remote ${data.endpoint} local ${data.local} ttl 255
ExecStart=/usr/bin/ip link set he-ipv6 up mtu 1480
ExecStart=/usr/bin/ip addr add ${data.address + "/64"} dev he-ipv6
ExecStart=/usr/bin/ip -6 route add ::/0 dev he-ipv6
ExecStop=/usr/bin/ip -6 route del ::/0 dev he-ipv6
ExecStop=/usr/bin/ip link set he-ipv6 down
ExecStop=/usr/bin/ip tunnel del he-ipv6

[Install]
WantedBy=multi-user.target
`;
        await fs.writeFileSync("./service.new", service);
        module.exports.appendList(screen, list, `INFO: new 'service' file generated`);
        module.exports.appendList(screen, list, `INFO: adding new service 'he-heat'...`);
        await fs.writeFileSync("/etc/systemd/system/he-heat.service", service);
    },
    setup: async (screen, setupList, data) => {
        switch (await module.exports.checkDistroName) {
            case 'debian':
                await module.exports.interfacesCreator(screen, setupList, data);
                module.exports.appendList(screen, setupList, `INFO: 'interfaces' file overwritten. Enabling IPv6 in the system...`);
                module.exports.IPv6Enabler(screen, setupList, data);
                module.exports.appendList(screen, setupList, `INFO: new configuration saved and enabled successfully! Reboot now!`);
                break;
            case 'arch' || 'manjaro':
                await module.exports.serviceCreator(screen, setupList, data);
                module.exports.appendList(screen, setupList, `INFO: service ${await module.exports.serviceManager("he-heat", "start") ? "started successfully" : "FAILED! Run 'sudo systemctl status he-ipv6' to know more."}`);
                module.exports.appendList(screen, setupList, `INFO: enabling IPv6 in the system...`);
                module.exports.IPv6Enabler(screen, setupList, data, "he-ipv6");
                module.exports.appendList(screen, setupList, `INFO: IPv6 enabled in the system, trying to start 'he-heat' service...`);
                break;
        }
    }
};