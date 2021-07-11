const {spawn} = require('child_process');

module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
    getIP: new Promise((resolve, reject) => {
        const child = spawn('ip', ['-6', 'route', '|', 'grep', '-m1', 'he-ipv6 proto'], {shell: true});

        child.stdout.on('data', (data) => {
            console.log(`child stdout:\n${data}`);
            resolve(data);
        });
    })
};