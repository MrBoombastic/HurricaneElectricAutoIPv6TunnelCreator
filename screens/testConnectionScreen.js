const styles = require("../styles"),
    {appendList, printTestSummary, request6, validateIP} = require("../tools"),
    {list, prompt} = require('blessed');

module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 2, passed: 0};

    testList.focus();
    screen.append(testList);

    testList.on("select", function (data) {
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    prompt(styles.prompt(screen)).input('What IPv6 from your assigned block do you want to test?', '', async function (err, IP) {
        //stage1
        IP = validateIP(IP);
        testList.addItem("INFO: testing started...");
        if (IP) {
            IP = IP?.replaceAll(" ", "");
            tests.passed++;
        }
        appendList(screen, testList, `TEST: verifying received IP - ${IP ? "PASSED" : "FAILED"}`);

        //stage 2
        let retrievedIP = false;
        if (!IP) {
            appendList(screen, testList, "INFO: No valid IP found, skipping test.");
            return printTestSummary(screen, testList, tests);
        } else {
            appendList(screen, testList, `TEST: sending request to Ipify from ${IP}`);
            const req = await request6(IP, "https://api64.ipify.org/?format=json");
            if (req.statusCode === 200) {
                retrievedIP = JSON.parse(req.body).ip;
                appendList(screen, testList, `RESPONSE: ${retrievedIP} - PASSED!`);
                tests.passed++;
            } else {
                appendList(screen, testList, `RESPONSE: not OK (${req?.statusText || req?.code || JSON.stringify(req)}) - FAILED!`);
                return printTestSummary(screen, testList, tests);
            }
        }

        //stage 3
        //todo: youtube and fb ping test


        //summary
        printTestSummary(screen, testList, tests);
    });
};