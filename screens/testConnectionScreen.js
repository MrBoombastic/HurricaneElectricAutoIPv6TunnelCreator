const styles = require("../styles"),
    {appendList, printTestSummary, request6, validateIP} = require("../tools"),
    {list, prompt} = require('blessed'),
    fs = require("fs");

module.exports = async (screen) => {
    const testList = list(styles.list),
        tests = {count: 4, passed: 0};

    testList.focus();
    screen.append(testList);

    testList.on("select", function (data) { //Listening to exit button
        if (data.content === "1.  Exit") return require("./welcomeScreen")(screen);
    });

    let defaultIP = "";
    if (fs.existsSync("./answer.json")) { //If answer file exists, we can autofill data from it
        const answerFile = JSON.parse(fs.readFileSync("./answer.json", "UTF-8")); //Not using require, because pkg would simply swallow it
        if (answerFile?.Routed) defaultIP = answerFile.Routed.split("/")?.[0] || "";
    }
    prompt(styles.prompt(screen)).input('What IPv6 from your assigned block do you want to test?', defaultIP, async function (err, IP) {

        //STAGE 1
        IP = validateIP(IP);
        testList.addItem("INFO: testing started...");
        if (IP) {
            IP = IP?.replaceAll(" ", "");
            tests.passed++;
        }
        appendList(screen, testList, `TEST: validating received IP - ${IP ? "PASSED" : "FAILED"}`);

        //STAGE 2
        if (!IP) return printTestSummary(screen, testList, tests);
        appendList(screen, testList, `TEST: sending request to Ipify from ${IP}`);
        const reqIpify = await request6(IP, "https://api64.ipify.org/?format=json");
        if (reqIpify.statusCode === 200) {
            const retrievedIP = JSON.parse(reqIpify.body).ip;
            appendList(screen, testList, `RESPONSE: ${retrievedIP} - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqIpify?.statusText || reqIpify?.code || JSON.stringify(reqIpify)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }

        //Fun fact: if your routing is not set properly, some sites may work, and some not. That's why access to both Google and FB is tested.

        //STAGE 3
        appendList(screen, testList, `TEST: sending request to Google`);
        const reqGoogle = await request6(IP, "https://google.com");
        if (reqGoogle.statusCode === 200) {
            appendList(screen, testList, `RESPONSE: OK - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqGoogle?.statusText || reqGoogle?.code || JSON.stringify(reqGoogle)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }

        //STAGE 4
        appendList(screen, testList, `TEST: sending request to Facebook`);
        const reqFB = await request6(IP, "https://facebook.com");
        if (reqGoogle.statusCode === 200) {
            appendList(screen, testList, `RESPONSE: OK - PASSED`);
            tests.passed++;
        } else {
            appendList(screen, testList, `RESPONSE: not OK (${reqFB?.statusText || reqFB?.code || JSON.stringify(reqFB)}) - FAILED`);
            return printTestSummary(screen, testList, tests);
        }


        //Summary
        printTestSummary(screen, testList, tests);
    });
};