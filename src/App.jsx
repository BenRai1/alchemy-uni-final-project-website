import "./App.css"
import { useState, useEffect } from "react"
import { OptionDropdown } from "./components/OptionsDropdown"
import { Buffer } from "buffer"
import ipfs from "./components/ipfs"
import createMetadata from "./components/CreatMetadata"
import { Button, Spinner } from "@chakra-ui/react"
import { connectToContract } from "./components/HelpingFunctions"
import { options1, options2 } from "./components/Options"
import AiNft from "./utils/AiNft.json"
import alchemy from "./components/Alchemy"
import openai from "./components/OpenAi"
import ownedNft from "./components/OwnedNfts"

function App() {
    const CONTRACT_ADDRESS_AINFT = "0x9e9b71520A0a67A0853c987cE14925F20B531D2f"
    const aiNftContract = connectToContract(CONTRACT_ADDRESS_AINFT, AiNft.abi)
    const dedicatedGatewayInfuria = "final-project-au"
    const baseURL = `https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS_AINFT}`

    const [maxMints, setMaxMints] = useState("?")
    const [numberOfNftsAlreadyMinted, setNumberOfNftsAlreadyMinted] = useState("?")
    const [prompt1, setPrompt1] = useState("")
    const [prompt2, setPrompt2] = useState("")
    const [nftsOwned, setNftsOwned] = useState([])
    const [imagesGenerated, setImagesGenerated] = useState(false)

    const [chosenBase64, setChosenBase64] = useState("")
    const [chosenPicture, setChosenPicture] = useState("")
    const [currentAccount, setCurrentAccount] = useState("")
    const [onGoerli, setOnGoerli] = useState(false)
    const [selectionNotOk, setSelectionNotOk] = useState(false)
    const [imageGenerationInProgress, setImageGenerationInProgress] = useState(false)
    const [mintingInProgress, setMintingInProgress] = useState(false)

    const [imageLink1, setimageLink1] = useState("../src/assets/questionmark1.png")
    const [imageLink2, setimageLink2] = useState("../src/assets/questionmark2.png")
    const [imageLink3, setimageLink3] = useState("../src/assets/questionmark3.png")
    const [imageLink4, setimageLink4] = useState("../src/assets/questionmark4.png")

    const [base64_1, setBase64_1] = useState("")
    const [base64_2, setBase64_2] = useState("")
    const [base64_3, setBase64_3] = useState("")
    const [base64_4, setBase64_4] = useState("")

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window
        if (!ethereum) {
            console.log("Make sure you have metamask!")
            return
        }
        const accounts = await ethereum.request({ method: "eth_accounts" })
        const chainId = await ethereum.request({ method: "eth_chainId" })
        const goerliChaiId = "0x5"
        if (chainId !== goerliChaiId) {
            alert("You are not not the Goerli Test Network")
            setOnGoerli(false)
        } else {
            setOnGoerli(true)
        }
        if (accounts.length !== 0) {
            const account = accounts[0]
            setCurrentAccount(account)
        } else {
            console.log("No autorized account found")
        }
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window
            if (!ethereum) {
                console.log("Get Metamask")
                return
            }
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            console.log("Connected ", accounts[0])
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
        }
    }

    const generateImage = async () => {
        const value1 = document.getElementById("option1").value
        setPrompt1(value1)
        const value2 = document.getElementById("option2").value
        setPrompt2(value2)

        if (value1 == "" || value2 == "") {
            setSelectionNotOk(true)
        } else {
            setImageGenerationInProgress(true)
            setSelectionNotOk(false)
            const prompt = `A realistic photographic close up of a ${value1} made out of ${value2} `
            console.log(prompt)

            const response = await openai.createImage({
                prompt: prompt,
                n: 4,
                size: "1024x1024",
                response_format: "b64_json",
            })

            setimageLink1("data:image/png;base64," + response.data.data[0].b64_json)
            setimageLink2("data:image/png;base64," + response.data.data[1].b64_json)
            setimageLink3("data:image/png;base64," + response.data.data[2].b64_json)
            setimageLink4("data:image/png;base64," + response.data.data[3].b64_json)

            setBase64_1(response.data.data[0].b64_json)
            setBase64_2(response.data.data[1].b64_json)
            setBase64_3(response.data.data[2].b64_json)
            setBase64_4(response.data.data[3].b64_json)

            setImagesGenerated(true)
            setImageGenerationInProgress(false)
        }
    }

    const setChosenImage = (chosenBase64, imageId) => {
        if (imagesGenerated) {
            setChosenBase64(chosenBase64)
            setChosenPicture(imageId)
            console.log(chosenPicture)
        }
    }

    const mint = async () => {
        if (chosenPicture == "") {
            alert("Chose an image to mint as an NFT by clicking on it")
        } else {
            setMintingInProgress(true)
            let imageLink
            let cidMetadata

            // transforme the base64 data to data readable for to ipfs api
            const buffer = Buffer.from(chosenBase64, "base64")

            //upload chosen image to IPFS
            ipfs.add(buffer).then(async (result) => {
                imageLink = `https://${dedicatedGatewayInfuria}.infura-ipfs.io/ipfs/${result.path}`
                // console.log("image Link :", imageLink)
                const txn = await aiNftContract.getCurrtenAiNftAmoundMinted()
                const tokenId = parseInt(txn._hex, 16) + 1
                const metadata = createMetadata(imageLink, tokenId, prompt1, prompt2)

                ipfs.add(metadata).then(async (result) => {
                    const linkToMetatdata = `https://${dedicatedGatewayInfuria}.infura-ipfs.io/ipfs/${result.path}`
                    // console.log("Link to metadata: ", linkToMetatdata)
                    cidMetadata = result.path
                    const mintTxn = await aiNftContract.safeMint(cidMetadata)
                    await mintTxn.wait()

                    const newTxn = await aiNftContract.getNumberOfNftsMinted(currentAccount)
                    const walletMinted = parseInt(newTxn._hex, 16)

                    setNumberOfNftsAlreadyMinted(walletMinted)
                    setMintingInProgress(false)
                    setImagesGenerated(false)
                    setChosenImage("")
                    resetImages()
                    getNftsOwned()
                })
            })
        }
    }

    const getInitialData = async () => {
        if (currentAccount) {
            let txn = await aiNftContract.MAX_MINT_PER_WALLET()
            const max = parseInt(txn._hex, 16)
            setMaxMints(max)

            txn = await aiNftContract.getNumberOfNftsMinted(currentAccount)
            const walletMinted = parseInt(txn._hex, 16)
            setNumberOfNftsAlreadyMinted(walletMinted)
        }
    }

    const resetImages = () => {
        setimageLink1("../src/assets/questionmark1.png")
        setimageLink2("../src/assets/questionmark2.png")
        setimageLink3("../src/assets/questionmark3.png")
        setimageLink4("../src/assets/questionmark4.png")
    }

    const getNftsOwned = () => {
        if (currentAccount) {
            alchemy.nft
                .getNftsForOwner(currentAccount, {
                    contractAddresses: ["0x9e9b71520a0a67a0853c987ce14925f20b531d2f"],
                })
                .then((response) => {
                    setNftsOwned(response.ownedNfts)
                })
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    useEffect(() => {
        getInitialData()
        getNftsOwned()
    }, [currentAccount])

    return (
        <div>
            {currentAccount === "" ? (
                <Button colorScheme="blue" onClick={connectWallet}>
                    Connect Wallet
                </Button>
            ) : !onGoerli ? (
                <div>You are not on the Goerli Testnet, please change the Network</div>
            ) : (
                <div>
                    <h1 className="h1">Let AI generate an NFT for you that you like</h1>
                    {maxMints <= numberOfNftsAlreadyMinted ? (
                        <div className="h2">You alredy minted all your NFTs</div>
                    ) : (
                        <div>
                            {!imagesGenerated ? (
                                <h2 className="h2">Make your choice for each attribute</h2>
                            ) : (
                                <h2 className="h2">Chose the image for your Nft</h2>
                            )}
                            {!imagesGenerated && (
                                <div className="attributesContainer">
                                    <div className="attributeContainer">
                                        <OptionDropdown
                                            optionsArray={options1}
                                            placeholder="Select an animal"
                                            id="option1"
                                        />
                                    </div>
                                    <div className="attributeContainer">
                                        <OptionDropdown
                                            optionsArray={options2}
                                            placeholder="Select an element"
                                            id="option2"
                                        />
                                    </div>
                                </div>
                            )}

                            {!imagesGenerated && (
                                <div className="error">
                                    {selectionNotOk &&
                                        "!! Choose an option for each of the attributes !!"}
                                </div>
                            )}

                            {!imagesGenerated && (
                                <div className="generateImageButton">
                                    <Button colorScheme="blackAlpha" onClick={generateImage}>
                                        {imageGenerationInProgress ? (
                                            <div className="progressButton">
                                                <Spinner />{" "}
                                                <div className="textProgressButton">
                                                    Generating Images
                                                </div>
                                            </div>
                                        ) : (
                                            <div>{`Generate Images (${numberOfNftsAlreadyMinted} / ${maxMints} Nfts already minted)`}</div>
                                        )}
                                    </Button>
                                </div>
                            )}

                            <div className="suggestionsContainer">
                                <div className="suggestionContainer">
                                    <img
                                        id="image1"
                                        onClick={() => setChosenImage(base64_1, "1")}
                                        className={
                                            chosenPicture === "1"
                                                ? "imageChosen"
                                                : imagesGenerated
                                                ? "image"
                                                : "noHover"
                                        }
                                        src={imageLink1}
                                        alt=""
                                    />
                                </div>
                                <div className="suggestionContainer">
                                    <img
                                        onClick={() => setChosenImage(base64_2, "2")}
                                        className={
                                            chosenPicture === "2"
                                                ? "imageChosen"
                                                : imagesGenerated
                                                ? "image"
                                                : "noHover"
                                        }
                                        src={imageLink2}
                                        alt=""
                                    />
                                </div>
                                <div className="suggestionContainer">
                                    <img
                                        onClick={() => setChosenImage(base64_3, "3")}
                                        className={
                                            chosenPicture === "3"
                                                ? "imageChosen"
                                                : imagesGenerated
                                                ? "image"
                                                : "noHover"
                                        }
                                        src={imageLink3}
                                        alt=""
                                    />
                                </div>
                                <div className="suggestionContainer">
                                    <img
                                        onClick={() => setChosenImage(base64_4, "4")}
                                        className={
                                            chosenPicture === "4"
                                                ? "imageChosen"
                                                : imagesGenerated
                                                ? "image"
                                                : "noHover"
                                        }
                                        src={imageLink4}
                                        alt=""
                                    />
                                </div>
                            </div>
                            {imagesGenerated && (
                                <div className="mintButton">
                                    <Button
                                        id="mintingButton"
                                        colorScheme="blackAlpha"
                                        onClick={() => mint()}
                                    >
                                        {mintingInProgress ? (
                                            <div className="progressButton">
                                                <Spinner />{" "}
                                                <div className="textProgressButton">
                                                    Minting in Progress
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {`Mint Choice (${numberOfNftsAlreadyMinted} / ${maxMints} Nfts already minted)`}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {numberOfNftsAlreadyMinted > 0 && (
                <div className="mintedContainer">
                    <h2 className="h2">Here are the NFTs of the collection you own </h2>
                    <div className="ownedNfts">
                        {nftsOwned.map((nft, index) => {
                            return ownedNft(nft, baseURL, index)
                        })}
                    </div>
                    <a
                        href="https://testnets.opensea.io/collection/ainft-gmiamamfbl"
                        target="_blank"
                        className="link"
                    >
                        Go to the Collection
                    </a>
                </div>
            )}
        </div>
    )
}

export default App
