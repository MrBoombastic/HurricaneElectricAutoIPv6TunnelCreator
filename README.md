<!--
*** Using https://github.com/othneildrew/Best-README-Template as a template.
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator">
    <img src="./data/icon.png" alt="Logo" width="96" height="96">
  </a>

<h3 align="center">HEAT</h3>

  <p align="center">
    The mini tool that helps you set up a new IPv6 tunnel from Hurricane Electric.
    <br />
    <a href="https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator"></a>
    <br />
    ·
    <a href="https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/issues">Report Bug or Request Feature</a>
    ·
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
<li><a href="#compatibility">Compatibility</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#disclaimer">Disclaimer</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->

## About The Project

![Screenshot](./data/screen.png)

HEAT was created to help with setting up IPv6 tunnels from Hurricane Electric. Instructions found online are not always
clear or are very outdated. This tool can help you with that doing automatically as much as possible. Every option is
easy to access via Text User Interface. It feels like GRUB, but for IPv6 (insert laugh sound effect).

### Built With

* [Node.JS](https://nodejs.org/en/)
* [Blessed](https://github.com/chjj/blessed)
* [pkg](https://github.com/vercel/pkg)

## Compatibility

This tool is compatible only with systems using [systemd](https://en.wikipedia.org/wiki/Systemd#Adoption) and `ip`
command.

### Tested and working:

- Debian 10 Buster
- Arch (tested on 19th July 2021 after `pacman -Syu`)
- Ubuntu 20.04.1 LTS and 18.04.5 LTS
- CentOS 8 and Stream (Stream tested on 19th July 2021 after `yum update`)
- Fedora 32 and 33

### Should work, but not tested:

- Manjaro

### Candidates:

- No candidates right now.

### Does not work:

- Opensuse Tumbleweed and 15.1 - missing `sit` module.

## Getting Started

To get a local copy up and running follow these simple steps.

First path - download prebuild

1. Go to [releases](https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/releases) and download the
   latest version. Typical binary filename is `HEAT-linux-amd64`.

   Note: it's possibly better to copy link and download file via `wget`/`curl`, if target is a remote server.
2. Run `chmod +x HEAT-linux-amd64` to give permissions to execute.
3. Run `sudo ./HEAT-linux-amd64` and choose options using keyboard. Pasting works best using the right click on a mouse
   button.

Second path - build from source

0. Make sure, that you have Node v16.4.1 installed.
1. Clone this repository using `git clone` or download and unpack ZIP file.
2. In repo's directory run `npm install` (or `yarn`), to install dependencies.
3. Run `npm run build`. Binary should be generated in a couple of seconds.
4. Copy file to target server and go to second step of the first path.

### Prerequisites

This list is applicable only, if you are running/building from source directly. Binaries can be run straight after
downloading.

* Node.js v16.4.1
  ```sh
  nvm install 16.4.1    #using Node Version Manager here
  ```
* Yarn (optional, installs dependencies faster than `npm`)
   ```sh
   npm i yarn -g
   ```

## Usage

Use arrows to navigate in the menu. Right-click on the mouse or `Ctrl+Shift+V` should paste text from the clipboard.

HEAT has several modes:

- Compatibility check - This mode checks, if system is compatible with this tool. HEAT is not limited to listed distros
  above, but requires some tools from system.
- Tunnel setup - This mode asks about various things and then sets up IPv6 tunnel.
- Tunnel setup using answer file - Like above, but more automatically. You can copy `answer.json` file from this repo,
  fill it properly and put it next to the binary. No questions will be asked.
- Connection test - Tests, if tunnel has been set up properly. If `answer.json` exists, IP to test from will be
  suggested.
- Updates check
- RAM eater - If you have got too much RAM, run this option now!!!

![Screenshot](./data/screen2.png)

## Roadmap

See the [open issues](https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/issues) for a list of
proposed features (and known issues).

## Contributing

Any contributions or bug reports will be **greatly appreciated**.

## License

Distributed under the WTFPL License. See `LICENSE.md` for more information.

App's icon <a target="_blank" href="https://icons8.com/icon/pvsTkfYCFuf7/hot-springs">Hot Springs</a> created
by <a target="_blank" href="https://icons8.com">Icons8</a>.

## Contact

Look at my GitHub profile!

## Disclaimer

* This tool modifies your network configuration. Make sure, that you have alternative ways to access your server, if
  working remotely.
* Some features may not work properly or at all. Even in stable releases.

[contributors-shield]: https://img.shields.io/github/contributors/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator.svg?style=for-the-badge

[contributors-url]: https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator.svg?style=for-the-badge

[forks-url]: https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/network/members

[stars-shield]: https://img.shields.io/github/stars/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator.svg?style=for-the-badge

[stars-url]: https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/stargazers

[issues-shield]: https://img.shields.io/github/issues/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator.svg?style=for-the-badge

[issues-url]: https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/issues

[license-shield]: https://img.shields.io/github/license/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator.svg?style=for-the-badge

[license-url]: https://github.com/MrBoombastic/HurricaneElectricAutoIPv6TunnelCreator/blob/master/LICENSE.md
