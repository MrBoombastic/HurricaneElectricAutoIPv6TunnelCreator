const styles = require("../styles"),
    {appendList, getIP} = require("../tools"),
    fs = require("fs"),
    got = require("got"),
    blessed = require('blessed');


module.exports = async (screen) => {
    const list = blessed.list(styles.list),
        ip = getIP(),
        tests = {count: 2, passed: 2};
    let ping6 = true;
    list.focus();
    list.addItem("INFO: testing started...");
    screen.append(list);

    appendList(screen, list, `INFO: testing from IP ${JSON.stringify(ip["he-ipv6"])}`)
    //stage 1
    try {
        await got.get("https://api64.ipify.org/?format=json", {
            localAddress: ip.toString(),
            dnsLookupIpVersion: "ipv6"
        });
    } catch (e) {
        ping6 = false;
        tests.passed--;
    }
    /*appendList(screen, list, `CHECK: checking /etc/network/interfaces file presence and access: ${interfacesFilePresent ? "PASSED" : "FAILED"}`);

    //stage 2
    try {
        fs.accessSync("/etc/sysctl.conf");
    } catch (e) {
        sysctlFilePresent = false;
        tests.passed--;
    }
    appendList(screen, list, `CHECK: checking /etc/sysctl.conf file presence and access: ${sysctlFilePresent ? "PASSED" : "FAILED"}`);

    //stage 3
    await commandExists("ip").catch(() => {
        ipCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, list, `CHECK: checking ip command presence: ${ipCommandPresent ? "PASSED" : "FAILED"}`);

    //stage 4
    await commandExists("ping6").catch(() => {
        ping6CommandPresent = false;
        tests.passed--;
    });
    appendList(screen, list, `CHECK: checking ping command presence: ${ping6CommandPresent ? "PASSED" : "FAILED"}`);

    //summary
    appendList(screen, list, "");
    appendList(screen, list, `INFO: All tests done. Passed ${tests.passed} of total ${tests.count} tests.`);
    appendList(screen, list, `INFO: ${tests.count === tests.passed ? "All test passed. You are free to go!" : "One or more tests failed. This system is not compatible right now."}`);

    appendList(screen, list, "");
    */

    appendList(screen, list, "1. Exit");

    //Select exit button
    list.select(Infinity);

    list.on("select", function (data) {
        if (data.content === "1. Exit") require("./welcomeScreen")(screen);
    });
};