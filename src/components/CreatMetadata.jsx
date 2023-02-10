const createMetadata = (imageLink, number, prompt1, prompt2) => {
    const metaData = JSON.stringify({
        description: "Use your own prompts and AI generated images to creat an NFT you like",
        image: `${imageLink}`,
        name: `AI NFT Nr. ${number}`,
        attributes: [
            {
                trait_type: "Animal",
                value: prompt1,
            },
            {
                trait_type: "Element",
                value: prompt2,
            },
        ],
    })
    return metaData
}

export default createMetadata
