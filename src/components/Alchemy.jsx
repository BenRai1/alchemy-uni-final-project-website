import { Network, Alchemy } from "alchemy-sdk"
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY
const settings = {
    apiKey: alchemyKey,
    network: Network.ETH_GOERLI,
}

const alchemy = new Alchemy(settings)

export default alchemy
