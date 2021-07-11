const {exec} = require('child_process');

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    getIP: async () => {
        exec('ip -6 addr show dev he-ipv6', function (error, stdout, stderr) {
            if (error || stderr) return false;
            if(stdout.includes("scope global")) console.log("FOUND SOMETHING!!!!!!`")
            return stdout;
        });
    }
};