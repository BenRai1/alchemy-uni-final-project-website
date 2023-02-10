import { ethers } from "ethers"
const { ethereum } = window

const setupEventListener = (contractAddress, abi, eventName) => {
    try {
        const { ethereum } = window
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const connectedContract = new ethers.Contract(contractAddress, abi, signer)
            connectedContract.on({ eventName }, (tokenId) => {
                alert(
                    `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId}`
                )
            })
            console.log(`Eventlistener ${eventName} was set up`)
        } else {
            console.log("Ethereum object not found")
        }
    } catch (error) {
        console.log(error)
    }
}

const connectToContract = (contractAddress, abi) => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    let contract = new ethers.Contract(contractAddress, abi, signer)

    return contract
}

export { connectToContract, setupEventListener }
