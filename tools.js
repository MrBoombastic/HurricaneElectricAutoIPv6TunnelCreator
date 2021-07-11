const {exec} = require('child_process');

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    specificLineSearch: (input, query) => {
        const lines = input.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].contains(query)) {
                return lines[i];
            }
        }
    },
    getIP: async () => {
        exec('ip -6 addr show dev he-ipv6', (error, stdout, stderr) => {
            if (error || stderr) return false;
            return this.specificLineSearch(stdout, "scope global") || false;
        });
    }
};