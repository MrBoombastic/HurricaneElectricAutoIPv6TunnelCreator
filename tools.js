const got = require("got"),
    ipv6 = require("ip6addr");

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    printTestSummary: (screen, list, tests, failReason= "") => {
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
        }).catch(e => e)
    },
    request4: async (target) => {
        return await got.get(target).catch(e => e)
    },
    validateIP: (IP) => {
        try {
            ipv6.parse(IP).toString();
        } catch (e) {
            IP = false;
        }
        return IP
    },
    failSetup: (screen, list, failReason= "") => {
        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, `INFO: ${failReason}`);

        module.exports.appendList(screen, list, "");
        module.exports.appendList(screen, list, "1.  Exit");

        //Select exit button
        list.select(Infinity);
    },
};