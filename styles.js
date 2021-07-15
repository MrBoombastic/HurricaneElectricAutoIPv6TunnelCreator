const {version} = require('./package.json');

module.exports = {
    list: {
        top: 'center',
        left: 'center',
        align: 'left',
        width: '70%',
        height: '70%',
        keys: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: '#0f37ff',
            border:
                {
                    fg: '#f0f0f0'
                }
        }
    },
    welcomeText: {
        align: "center",
        top: "8%",
        width: '100%',
        content: `HurricaneElectricAutoIPv6TunnelCreator (HEAT) version ${version} :D`,
    },
    sudoErrorText: {
        align: "center",
        top: "97%",
        width: "100%",
        content: "ERROR: This option needs sudo permissions!",
        style: {
            fg: 'white',
            bg: '#ff0000',
        }
    },
    tipText: {
        align: "center",
        top: "93%",
        width: '100%',
        content: "NOTE: You can hit q, escape or Ctrl-C buttons to exit at any time!",
    },
    prompt: (screen) => {
        return {
            parent: screen,
            top: 'center',
            left: 'center',
            border: 'line',
            height: 'shrink',
            label: 'Question',
        };
    }
};