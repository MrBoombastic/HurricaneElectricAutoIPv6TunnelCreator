const styles = require("../styles"),
    {appendList} = require("../tools"),
    fs = require("fs"),
    os = require("os"),
    commandExists = require('command-exists'),
    blessed = require('blessed');


module.exports = async (screen) => {
    const list = blessed.list(styles.welcomeList),
        tests = {count: 4, passed: 4};
    let interfacesFilePresent = true,
        sysctlFilePresent = true,
        ipCommandPresent = true,
        ping6CommandPresent = true;
    list.focus();
    list.addItem("INFO: testing started...");
    screen.append(list);
    appendList(screen, list, `INFO: current system is ${os.version()} ${os.release()} (${os.platform()})`);
    //stage 1
    try {
        fs.accessSync("/etc/network/interfaces");
    } catch (e) {
        interfacesFilePresent = false;
        tests.passed--;
    }
    appendList(screen, list, `CHECK: checking /etc/network/interfaces file presence and access: ${interfacesFilePresent ? "PASSED" : "FAILED"}`);

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
    appendList(screen, list, "1. Exit");

    //Select exit button
    list.select(Infinity)

    list.on("select", function (data) {
        if (data.content === "1. Exit") require("./welcomeScreen")(screen)
    });
};