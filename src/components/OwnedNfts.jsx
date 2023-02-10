const ownedNft = (nft, baseURL, index) => {
    const tokenId = nft.tokenId
    const link = `${baseURL}/${tokenId}`
    return (
        <div className="ownedNft" key={index}>
            <a href={link} target="_blank">
                <img className="ownedNftsImage" src={nft.media[0].raw} alt="" />
            </a>
        </div>
    )
}

export default ownedNft
