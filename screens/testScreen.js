const styles = require("../styles"),
    {appendList, printTestSummary, checkDistroName, checkCompatibilityByDistroName} = require("../tools"),
    fs = require("fs"),
    os = require("os"),
    commandExists = require('command-exists'),
    {list} = require('blessed');


module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 4, passed: 4};
    let interfacesFilePresent = true,
        sysctlFilePresent = true,
        ipCommandPresent = true,
        sudoCommandPresent = true;

    testList.focus();

    testList.on("select", function (data) {
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    testList.addItem("INFO: testing started...");
    screen.append(testList);
    appendList(screen, testList, `INFO: current system is ${os.release()} (${os.platform()})`);

    appendList(screen, testList, `IMPORTANT_CHECK: distribution name is ${await checkDistroName}: ${await checkCompatibilityByDistroName() ? "PASSED" : "FAILED"}`);


    //stage 1
    try {
        fs.accessSync("/etc/network/interfaces");
    } catch (e) {
        interfacesFilePresent = false;
        tests.passed--;
    }
    appendList(screen, testList, `CHECK: checking /etc/network/interfaces file presence and access: ${interfacesFilePresent ? "PASSED" : "FAILED"}`);

    //stage 2
    try {
        fs.accessSync("/etc/sysctl.conf");
    } catch (e) {
        sysctlFilePresent = false;
        tests.passed--;
    }
    appendList(screen, testList, `CHECK: checking /etc/sysctl.conf file presence and access: ${sysctlFilePresent ? "PASSED" : "FAILED"}`);

    //stage 3
    await commandExists("ip").catch(() => {
        ipCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking ip command presence: ${ipCommandPresent ? "PASSED" : "FAILED"}`);

    //stage 4
    //stage 3
    await commandExists("sudo").catch(() => {
        sudoCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking sudo command presence: ${sudoCommandPresent ? "PASSED" : "FAILED"}`);
    //summary
    printTestSummary(screen, testList, tests, "Not all tests passed, but that's OK. Only 'IMPORTANT_CHECK' matters here.");

};