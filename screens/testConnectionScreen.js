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
    prompt.input('What IPv6 from your assigned block do you want to test? ', '', async function (err, IP) {
        //stage1
        try {
            ipv6.parse(IP);
        } catch (e) {
            IP = false;
        } finally {
            IP?.replaceAll(" ", "");
        }
        appendList(screen, list, `TEST: verifying received IP: ${IP ? "PASSED" : "FAILED"}`);
        if (!IP) tests.passed--;

        //stage 2
        let retrievedIP = false;
        if (!IP) {
            appendList(screen, list, "INFO: No valid IP found, skipping test.");
            return tests.passed--;
        } else {
            appendList(screen, list, `TEST: sending request to Ipify from ${IP}`);
            const req = await got.get("https://api64.ipify.org/?format=json", {
                localAddress: IP,
                dnsLookupIpVersion: "ipv6"
            }).catch(e => e);
            if (req.statusCode === 200) {
                retrievedIP = JSON.parse(req.body).ip;
                appendList(screen, list, `RESPONSE: ${retrievedIP} - PASSED!`);
            } else {
                appendList(screen, list, `RESPONSE: not OK (${req?.statusText || JSON.stringify(req)}) - FAILED!`);
                return tests.passed--;
            }
        }

        //stage 3
        let matchingTest = true;
        if (retrievedIP !== IP) {
            matchingTest = false;
            tests.passed--;
        }
        appendList(screen, list, `TEST: checking if given IP and received IP are matching (${IP} vs ${retrievedIP} - ${matchingTest ? "PASSED" : "FAILED"}`);

        //summary
        appendList(screen, list, "");
        appendList(screen, list, `INFO: All tests done. Passed ${tests.passed} of total ${tests.count} tests.`);
        appendList(screen, list, `INFO: ${tests.count === tests.passed ? "All test passed. You are free to go!" : "One or more tests failed. This system is not compatible right now."}`);

        appendList(screen, list, "");
        appendList(screen, list, "1. Exit");

        //Select exit button
        list.select(Infinity);
    });

    list.on("select", function (data) {
        if (data.content === "1. Exit") require("./welcomeScreen")(screen);
    });
};