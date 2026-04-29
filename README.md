<p align="center">     
    <img src="https://i.postimg.cc/7b8SXVwd/image-4.jpg" width="775">
</p>

<p align="center">
  <h3 align="center"> 🚀 Ecosystem 🚀 </h3>

  <p align="center">
    <a href="https://github.com/Alien-Worlds/teleport-ui">     
      <img src="https://i.postimg.cc/qv0pH3RT/teleport-UI.jpg" width="250" height="125">
    </a>
     
    <a href="https://github.com/Alien-Worlds/uikit">
      <img src="https://i.postimg.cc/nzVx9bmw/UIkit.jpg" width="250" height="125">
    </a>
     
    <a href="https://github.com/Alien-Worlds/alienworlds-api">
      <img src="https://i.postimg.cc/j2FRrgL3/API.jpg" width="250" height="125">
    </a>
  </p>
  
</p>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Dependencies](#dependencies)
  - [EOS.js](#eosjs)
  - [Overmind.js](#overmindjs)
  - [UI-kit](#ui-kit)
- [Blockchains](#blockchains)
  - [WAX](#wax)
  - [BSC](#bsc)
  - [Ethereum](#ethereum)
- [Wallets](#wallets)
  - [Wax Cloud Wallet](#wax-cloud-wallet)
  - [Metamask wallet](#metamask-wallet)
  - [BSC wallet](#bsc-wallet)
  - [Coinbase wallet](#coinbase-wallet)
- [Explorers](#explorers)
- [Resources:](#resources)

## Description

> TBD

## Installation

In the root directory, run the following command to install all the necessary dependencies:

```
yarn install
```

## Prerequisites

To ensure successful installation of dependencies, it is necessary for you to generate a personal access token on GitHub and incorporate it into your profile file (such as zshrc/bashrc/etc).

- Navigate to https://github.com/settings/tokens (Settings > Developer settings > Personal access tokens) on GitHub.
- Click on "Generate new token" and select "Generate new token (classic)". If you prefer to use the new token format, you can choose "Generate new token (new)".
- In the permissions section, select at least "read:packages", or choose "write:packages" if you need write access for uikit release.
- Click on "Generate token" and copy the generated token.
- Add the token to your profile file by including the line "export GITHUB_TOKEN=your_token".

## Development

In order to compile the project, from the repository folder type in your terminal:

```
yarn start:development
```

This will compile the required dependencies and run the application in the browser.

## Dependencies

Several dependencies in the project that are worth highlighting due to their important role in application:

### EOS.js

![https://github.com/EOSIO/eosjs](https://img.shields.io/badge/eos.js-22.1.0-orange)
Javascript API for integration with WAX Cloud Wallet. Due to its current limitations, a patched version (PatchedWax) is used in order to add some extra functionalities that are not yet available in the standard library.

### Overmind.js

![https://github.com/cerebral/overmind](https://img.shields.io/badge/overmind.js-28.0.1-blue)
Overmind is a state management library that takes a different approach than Redux. It allows to keep state manageable without the need to define action types, dispatching, or reducing state, it does this by containing all state and actions outside of the application structure, and expose them using a simple Hook API that can be consumed by any component.

### UI-kit

![https://github.com/Alien-Worlds/uikit](https://img.shields.io/badge/uikit-0.1.44-yellow)
The first version of AW's UI-kit is available and many of the components in the current UI already are based on these templates. For further information (or for adding any new components), please refer to the documentation available in the ui-kit's repository.

## Blockchains

The game is connected to 3 different blockchains, allowing users to choose which modules of the game they want to play depending on their wallet of choice. Between them WAX is the most predominant, as users are required to own a Wax wallet for registering and playing the game, mining, and any other actions; while BSC is integrated only on the Missions module and Ethereum on the Teleport module:

### WAX

<p align="start">
  <a href="https://on.wax.io/wax-io/">     
    <img src="https://thevrsoldier.com/wp-content/uploads/2022/01/metaverse-crypto-coins-wax.jpg" width="150" align="left">
  </a>
</p>
WAX is integrated in the platform for authenticating users (account register and login), as well as executing game actions like mining tokens or minting game NFTs. 
<br clear="left"/>

### BSC

<p align="start">
  <a href="https://www.bnbchain.org/">     
    <img src="https://cazoo.it/wp-content/uploads/2021/03/Binance-smart-chain.jpg" width="150" align="left">
  </a>
</p>
Binance Smart Chain is integrated on the platform in the Missions module, allowing users to join missions and earn tokens and NFTs that can be then used in the game. It is an independent module that users can play registering only with BSC or Coinbase wallets.
<br clear="left"/>

### Ethereum

<p align="start">
  <a href="https://ethereum.org/">     
    <img src="https://cia.news/wp-content/uploads/2019/03/La-Blockchain-Ethereum-1000x675.jpg" width="150" align="left">
  </a>
</p>
Ethereum blockchain is integrated into the Teleport module of the platform, allowing users to transfer tokens between their wallets in and out of the game. Due to the complexity of this integration this module resides in a separate repository, for further information please refer to the documentation available in Teleport's repository.
<br clear="left"/>

## Wallets

Several wallets are used to play the game, following the same logic described in #Blockchains section:

### Wax Cloud Wallet

<p align="start">
  <a href="https://wallet.wax.io/">     
    <img src="https://blog.buda.com/content/images/2022/04/blog_abril_semana3_wax_wallet__qu___es_y_c__mo_funciona.jpg" width="150" align="left">
  </a>
</p>
Wax Cloud Wallet is used to register a new user account in the game, as well as executing most of the actions in the game that interact with a blockchain.
<br clear="left"/>

### Metamask wallet

<p align="start">
  <a href="https://metamask.io/">     
    <img src="https://i0.wp.com/financededemain.com/wp-content/uploads/2022/05/metamask-image-cryptoast.webp?fit=1600%2C800&ssl=1" width="150" align="left">
  </a>
</p>
Metamask wallet is used primarily in the Teleport module, to allow cross-chain token transfers between your Wax wallet account, and your Ethereum account. This allows users to earn tokens in the game, teleport them afterwards to their Metamask wallet, and use them or sell them in any exchange. 
<br clear="left"/>

### BSC wallet

<p align="start">
  <a href="https://www.bnbchain.org/en/binance-wallet">     
    <img src="https://www.kaohooninternational.com/wp-content/uploads/2021/12/2021-12-08_binance.jpg" width="150" align="left">
  </a>
</p>
Binance wallet is used primarily in the Missions module, to allow users to participate in missions and earn rewards once they are completed. As BSC is EVM-compatible, it is possible to connect your account to your Metamask wallet and operate it in the same way.
<br clear="left"/>

### Coinbase wallet

<p align="start">
  <a href="https://www.coinbase.com/">     
    <img src="https://m.bankingexchange.com/media/k2/items/cache/090b994106f805decc34cd5d932d594f_XL.jpg?t=20210928_184709" width="150" align="left">
  </a>
</p>
Conbase wallet is used primarily in the Missions module, offering an alternative to BSC for users that do not own any of the previous mentioned wallets to register an account and play the missions game only with a Coinbase wallet.
<br clear="left"/>

## Explorers

Block explorers (frontends that can navigate and present all the data from the blockchain in a readable format) allow for all the contracts integrated on the game to be queried by means of the constants available in the file _constants.ts_, using 'contracts', 'tables' and 'actions' values to get the desired data.
For any contract queries related to Missions module (i.e. get a list of the user's missions, or acquired mission NFTs), refer to BSCScan. For any queries related to Teleport transactions, refer to Etherscan. For any other queries, refer to Waxblock.

<p align="start">
  <a href="https://waxblock.io/">     
    <img src="https://waxblock.io/common/images/wax-block-meta-banner.jpg" width="200"  align="left">
  </a>
</p>
<p align="start">
  <a href="https://bscscan.com/">     
    <img src="https://bepay.finance/wp-content/uploads/2022/03/bscscan-1.jpg" width="200"  align="left">
  </a>
</p>
<p align="start">
  <a href="https://etherscan.io/">     
    <img src="https://www.universidadedobitcoin.com.br/res/imagesUpload/noticias/o-que-e-etherscan-e-como-utiliza-lo-.png" width="200"  align="left">
  </a>
</p>
<br clear="left"/>

## Resources:

- Staging preview: https://development.game-ui.pages.dev/
- Live version: https://play.alienworlds.io/
