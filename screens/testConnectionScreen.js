const styles = require("../styles"),
    ipv6 = require("ip6addr"),
    {appendList} = require("../tools"),
    got = require("got"),
    blessed = require('blessed');

module.exports = async (screen) => {
    const list = blessed.list(styles.list),
        tests = {count: 3, passed: 3};

    list.focus();
    screen.append(list);
    list.addItem("INFO: testing started...");

    const prompt = blessed.prompt({
        parent: screen,
        top: 'center',
        left: 'center',
        border: 'line',
        height: 'shrink',
        label: 'Question',
    });
    prompt.input('What IPv6 from your assigned block do you want to test? ', '', async function (err, ip) {
        //stage1
        try {
            ipv6.parse(ip);
        } catch (e) {
            ip = false;
        }
        appendList(screen, list, `TEST: verifying received IP: ${ip ? "PASSED" : "FAILED"}`);
        if (!ip) tests.passed--;

        //stage 2
        if (!ip) {
            appendList(screen, list, "INFO: No IP found, skipping test.");
            return tests.passed--;
        } else {
            appendList(screen, list, `TEST: sending request from IP ${ip}`);
            const req = await got.get("https://api64.ipify.org/?format=json", {
                localAddress: ip,
                dnsLookupIpVersion: "ipv6"
            }).catch(e => e);
            if (req?.ok) appendList(screen, list, `RESPONSE: ${JSON.stringify(req.body)} - PASSED!`);
            else {
                appendList(screen, list, `RESPONSE: not OK (status: ${req?.statusText || req}) - FAILED!`);
                return tests.passed--;
            }
        }
    });
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