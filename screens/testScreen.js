const styles = require("../styles"),
    {appendList, printTestSummary} = require("../tools"),
    fs = require("fs"),
    os = require("os"),
    commandExists = require('command-exists'),
    blessed = require('blessed');


module.exports = async (screen) => {
    const list = blessed.list(styles.list),
        tests = {count: 3, passed: 3};
    let interfacesFilePresent = true,
        sysctlFilePresent = true,
        ipCommandPresent = true;

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

    //summary
    printTestSummary(screen, list, tests, "This system is not compatible right now.");

    list.on("select", function (data) {
        if (data.content === "1.  Exit") require("./welcomeScreen")(screen);
    });
};