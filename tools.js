module.exports = {
    appendList: (screen, list, text) => {
        list.addItem(text);
        screen.render();
    },
};