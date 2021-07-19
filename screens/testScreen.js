const styles = require("../styles"),
    {appendList, printTestSummary, checkDistroName, checkCompatibilityByDistroName} = require("../tools"),
    fs = require("fs"),
    os = require("os"),
    commandExists = require('command-exists'),
    {list} = require('blessed');


module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 5, passed: 5};
    let systemctlCommandPresent = true,
        sysctlFilePresent = true,
        crontabCommandPresent = true,
        ipCommandPresent = true,
        sudoCommandPresent = true;

    testList.focus();

    testList.on("select", function (data) {
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    testList.addItem("INFO: testing started...");
    screen.append(testList);
    appendList(screen, testList, `INFO: current system is ${os.release()} (${os.platform()})`);

    appendList(screen, testList, `INFO: distribution name is ${await checkDistroName} ${await checkCompatibilityByDistroName() ? "" : "and it hasn't been tested"}`);


    //stage 1
    await commandExists("systemctl").catch(() => {
        systemctlCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking ip command presence: ${systemctlCommandPresent ? "PASSED" : "FAILED"}`);

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
    await commandExists("crontab").catch(() => {
        crontabCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking crontab command presence: ${ipCommandPresent ? "PASSED" : "FAILED"}`);

    //stage 5
    await commandExists("sudo").catch(() => {
        sudoCommandPresent = false;
        tests.passed--;
    });
    appendList(screen, testList, `CHECK: checking sudo command presence: ${crontabCommandPresent ? "PASSED" : "FAILED"}`);
    //summary
    printTestSummary(screen, testList, tests, "Not all tests passed, but that's OK. Read documentation.");

};