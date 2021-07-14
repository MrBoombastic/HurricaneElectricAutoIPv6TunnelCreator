const got = require("got"),
    {spawn} = require('child_process'),
    fs = require("fs"),
    ipv6 = require("ip6addr");

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
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
    IPv6Enabler: (screen, list, data) => {
        spawn('sudo sysctl -w net.ipv6.ip_nonlocal_bind=1', {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to enable binding. Run "sysctl -w net.ipv6.ip_nonlocal_bind=1" manually.`);
        });
        spawn("sudo echo 'net.ipv6.ip_nonlocal_bind = 1' >> /etc/sysctl.conf", {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to persist binding. Add command above to '/etc/sysctl.conf' manually.`);
        });
        spawn(`sudo ip -6 route replace local ${data.routed} dev lo`, {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to replace IPs block. Run 'ip -6 route replace local ${data.routed} dev lo' manually.`);
        });
        spawn(`(sudo crontab -l 2>/dev/null | grep -v '^[a-zA-Z]'; echo "@reboot sudo ip -6 route replace local ${data.routed} dev lo") | sort - | uniq - | sudo crontab -`, {shell: true})
            .stderr.on('data', () => {
            return module.exports.appendList(screen, list, `ERROR: failed to add '@reboot ip -6 route replace local ${data.routed} dev lo' to cron.`);
        });
    },
    interfacesCreator: async (screen, list, data) => {
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
    }
};