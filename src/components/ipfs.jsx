import { create } from "ipfs-http-client"
import { Buffer } from "buffer"

const projectIdInfuria = import.meta.env.VITE_INFURA_PORJECT_ID
const apiKeySecretInfuria = import.meta.env.VITE_INFURA_API_KEY_SECRET

const authInfuria =
    "Basic " + Buffer.from(projectIdInfuria + ":" + apiKeySecretInfuria).toString("base64")

const ipfs = new create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: authInfuria,
    },
})

export default ipfs
