const styles = require("../styles"),
    {appendList, printTestSummary, request6, validateIP} = require("../tools"),
    {list, prompt} = require('blessed'),
    fs = require("fs");

module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 4, passed: 0};

    testList.focus();
    screen.append(testList);

    testList.on("select", function (data) {
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    let defaultIP = "";
    if (fs.existsSync("./answer.json")) {
        const answerFile = JSON.parse(fs.readFileSync("./answer.json", "UTF-8"));
        if (answerFile?.Routed) defaultIP = answerFile.Routed.split("/")?.[0];
    }
    prompt(styles.prompt(screen)).input('What IPv6 from your assigned block do you want to test?', defaultIP, async function (err, IP) {

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
        }
        appendList(screen, testList, `TEST: sending request to Ipify from ${IP}`);
        const reqIpify = await request6(IP, "https://api64.ipify.org/?format=json");
        if (reqIpify.statusCode === 200) {
            retrievedIP = JSON.parse(reqIpify.body).ip;
            appendList(screen, testList, `RESPONSE: ${retrievedIP} - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqIpify?.statusText || reqIpify?.code || JSON.stringify(reqIpify)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }


        //stage 3
        appendList(screen, testList, `TEST: sending request to Google`);
        const reqGoogle = await request6(IP, "https://google.com");
        if (reqGoogle.statusCode === 200) {
            appendList(screen, testList, `RESPONSE: OK - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqGoogle?.statusText || reqGoogle?.code || JSON.stringify(reqGoogle)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }

        //stage 4
        appendList(screen, testList, `TEST: sending request to Facebook`);
        const reqFB = await request6(IP, "https://facebook.com");
        if (reqGoogle.statusCode === 200) {
            appendList(screen, testList, `RESPONSE: OK - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqFB?.statusText || reqFB?.code || JSON.stringify(reqFB)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }


        //summary
        printTestSummary(screen, testList, tests);
    });
};