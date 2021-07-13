const {ANSIImage} = require('blessed');


module.exports = async (screen) => {
    const rick = ANSIImage({
        parent: screen,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        type: 'overlay',
        optimization: "mem", //it still eats up to 2GB of RAM, WTF???
        file: "./data/rick.gif"
    });
    screen.append(rick)
    screen.render()
};