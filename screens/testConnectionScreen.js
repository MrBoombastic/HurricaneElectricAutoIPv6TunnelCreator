const styles = require("../styles"),
    {appendList, getIP} = require("../tools"),
    fs = require("fs"),
    got = require("got"),
    blessed = require('blessed');


module.exports = async (screen) => {
    const list = blessed.list(styles.list),
        ip = getIP(),
        tests = {count: 3, passed: 3};
    let ping6 = true;
    list.focus();
    list.addItem("INFO: testing started...");
    screen.append(list);

    //stage1
    appendList(screen, list, `TEST: getting HE IP block: ${ip ? "PASSED": "FAILED"}`)
    if(!ip) tests.passed--

    appendList(screen, list, `TEST: sending request from IP ${ip}...`)
    //stage 2
    try {
        if(!ip) throw "no ip"
        const req = await got.get("https://api64.ipify.org/?format=json", {
            localAddress: ip,
            dnsLookupIpVersion: "ipv6"
        });
        if(req.ok) appendList(screen, list, `RESPONSE: ${JSON.stringify(req.body)} - PASSED!`)
        else appendList(screen, list, `RESPONSE: not OK - FAILED!`)
    } catch (e) {
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