const os = require('os');

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    getIP: () => {
        return (os.networkInterfaces())["he-ipv6"][0].address
    }
};