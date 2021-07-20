const styles = require("../styles"),
    {appendList, printTestSummary, checkDistroName, checkCompatibilityByDistroName} = require("../tools"),
    fs = require("fs"),
    os = require("os"),
    commandExists = require('command-exists'),
    {list} = require('blessed');


module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 5, passed: 5};
    let whichCommandPresent = true,
        systemctlCommandPresent = true,
        sysctlFilePresent = true,
        ipCommandPresent = true,
        sudoCommandPresent = true;

    testList.focus();

    testList.on("select", function (data) { //Listening to exit button
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    appendList(screen, testList, "INFO: testing started...");
    appendList(screen, testList, `INFO: current system is ${os.platform()} ${os.release()}`); //Outputs some garbage data, but they are for user, not for app.
    appendList(screen, testList, await checkCompatibilityByDistroName() ? `INFO: running on ${await checkDistroName}` : `WARN: running on untested distro ${await checkDistroName}`); //Non-critical warning


    //STAGE 1
    await commandExists("systemctl").catch(() => {
        systemctlCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking ip command presence: ${systemctlCommandPresent ? "PASSED" : "FAILED"}`);

    //STAGE 2
    try {
        fs.accessSync("/etc/sysctl.conf");
    } catch (e) {
        sysctlFilePresent = false;
        tests.passed--;
    }
    appendList(screen, testList, `CHECK: checking sysctl.conf file presence and access: ${sysctlFilePresent ? "PASSED" : "FAILED"}`);

    //STAGE 3
    await commandExists("ip").catch(() => {
        ipCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking ip command presence: ${ipCommandPresent ? "PASSED" : "FAILED"}`);

    //STAGE 4
    await commandExists("which").catch(() => {
        whichCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking which command presence: ${ipCommandPresent ? "PASSED" : "FAILED"}`);

    //STAGE 5
    await commandExists("sudo").catch(() => {
        sudoCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking sudo command presence: ${sudoCommandPresent ? "PASSED" : "FAILED"}`);

    //Summary
    printTestSummary(screen, testList, tests, "This system is not compatible with this tool.");
};