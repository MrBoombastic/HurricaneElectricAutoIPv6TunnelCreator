//Boilerplate
const name = "HurricaneElectricAutoIPv6TunnelCreator",
    styles = require("./styles"),
    blessed = require('blessed'),
    {exec} = require("child_process"),
    os = require("os"),
    commandExists = require('command-exists'),
    fs = require("fs");
screen = blessed.screen({
    smartCSR: true
});

process.name = name;
screen.title = name;

//Screens and interactions section
const renderWelcomeScreen = (screen) => {
    const list = blessed.list(styles.welcomeList);
    const text = blessed.text(styles.welcomeText);
    list.focus();
    list.addItem("0. Test system for compatibility.");
    list.addItem("1. Set up HE IPv6 tunnel.");
    list.addItem("2. Set up HE IPv6 tunnel using answer file.");
    list.addItem("3. Test system for IPv6 connection.");
    list.addItem("4. RickRoll myself.");
    screen.append(list);
    screen.append(text);
    screen.render();
    list.once("select", async function (data) {
        if (data.position.top === 0) await renderTestScreen(screen);
    });
};
const renderTestScreen = async (screen) => {
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

    list.on("select", function (data) {
        if (data.content === "1. Exit") renderWelcomeScreen(screen);
    });
};
const appendList = (screen, list, text) => {
    list.addItem(text);
    screen.render();
};
screen.key(['escape', 'q', 'C-c'], function () {
    return process.exit(0);
});

//Rendering GUI
renderWelcomeScreen(screen);