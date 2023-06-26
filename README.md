# Simon Game Clone

![Simon Wireframe](simon-wireframe-2.png)

Re-creation of the classic Simon game, using HTML, Typescript, and CSS.

A live build can be found [here](https://code.aaronishibashi.com/simon/).

## Technologies Used

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Webpack](https://img.shields.io/badge/webpack-%238DD6F9.svg?style=for-the-badge&logo=webpack&logoColor=black)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

## Installation

To build and run the project in a local server:

```shell
npm install
npm run serve
``` 
or
```shell
yarn install
yarn serve
```

## Features
- Simple and usable front-end design
- Pure Web Audio API synthesis besides reverb

## Known Issues
- Audio is distorted on Brave, due to differences in Web Audio API impelmentation
- No mobile support

## Future
- [ ] Mobile support
- [ ] Audio fallback to `<audio>` when WebAudio API not available
- [ ] Difficulty mode (speed inclines quicker)
- [ ] Diversify tones in different keys (player must adjust to new tones every time)
- [ ] Music on the standby screen & result screen
- [ ] Add more buttons
