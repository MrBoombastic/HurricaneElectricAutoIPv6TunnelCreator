const styles = require("../styles"),
    ipv6 = require("ip6addr"),
    {appendList, printTestSummary, request} = require("../tools"),
    blessed = require('blessed');

module.exports = async (screen) => {
    const list = blessed.list(styles.list),
        tests = {count: 3, passed: 0};

    list.focus();
    screen.append(list);


    const prompt = blessed.prompt({
        parent: screen,
        top: 'center',
        left: 'center',
        border: 'line',
        mouse: false,
        height: 'shrink',
        label: 'Question',
    });
    prompt.input('What IPv6 from your assigned block do you want to test? ', '', async function (err, IP) {
        //stage1
        try {
            ipv6.parse(IP);
        } catch (e) {
            IP = false;
        }
        list.addItem("INFO: testing started...");
        if (IP) {
            IP = IP?.replaceAll(" ", "");
            tests.passed++;
        }
        appendList(screen, list, `TEST: verifying received IP - ${IP ? "PASSED" : "FAILED"}`);

        //stage 2
        let retrievedIP = false;
        if (!IP) {
            appendList(screen, list, "INFO: No valid IP found, skipping test.");
            return printTestSummary(screen, list, tests);
        } else {
            appendList(screen, list, `TEST: sending request to Ipify from ${IP}`);
            const req = await request(IP, "https://api64.ipify.org/?format=json")
            if (req.statusCode === 200) {
                retrievedIP = JSON.parse(req.body).ip;
                appendList(screen, list, `RESPONSE: ${retrievedIP} - PASSED!`);
                tests.passed++;
            } else {
                appendList(screen, list, `RESPONSE: not OK (${req?.statusText || req?.code || JSON.stringify(req)}) - FAILED!`);
                return printTestSummary(screen, list, tests);
            }
        }

        //stage 3
        const matchingTest = (retrievedIP === IP);
        if (matchingTest) tests.passed++

        appendList(screen, list, `TEST: checking if given IP and received IP are matching (${IP} vs ${retrievedIP}) - ${matchingTest ? "PASSED" : "FAILED"}`);
        //todo: youtube and fb ping test


        //summary
        printTestSummary(screen, list, tests);
    });

    list.on("select", function (data) {
        if (data.content === "1.  Exit") require("./welcomeScreen")(screen);
    });
};