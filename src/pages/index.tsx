import Head from 'next/head'
import styles from '../styles/home.module.scss'
import { useEffect, useState } from 'react'
import { ConnectWallet, useAddress, useSwitchChain, useNetworkMismatch, ChainId, useContract, MediaRenderer, useNFT, useChainId, useSDK } from "@thirdweb-dev/react"
import { toast } from 'react-toastify'

export default function Home(){
  const address = useAddress()
  const [loading, setLoading] = useState(true)
  const [loadingMint, setLoadingMint] = useState(false)
  const [minted, setMinted] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null | undefined>('')
  const [titleNFT, setTitleNFT] = useState<string | number | null | undefined>('')
  const [descriptionNFT, setDescriptionNFT] = useState<string | number | null | undefined>('')
  const [amount, setAmount] = useState(1)
  const switchChain = useSwitchChain()
  const isMismatched = useNetworkMismatch()

  // Campos a Serem Personalizados
    const nameProjet = "BootCamp iBEED"  // Nome do seu Projeto
    const { contract } = useContract("0x0Eda1134E9D0e19727Ab1Ca0A1B0F71b0C22DA44") // Endereço da sua Coleção
    const tokenId = 0 // Token ID que você quer liberar o Mint
  // -------------------------------

  const { data: nft, isLoading, error } = useNFT(contract, `${tokenId}`)

  async function totalMinted(){
    const data = await (await contract)?.call("totalSupply", [0])
    .then(function(myValue: any){
      const receipt = myValue.toString()
      setMinted(receipt)

    }).catch(function(error: any){
      console.log(error)
    })

  }

  async function getMetaData(){

    await totalMinted()
    .then(async() =>{
      
      if(!isLoading){
        
        setTitleNFT(nft?.metadata.name)
        setDescriptionNFT(nft?.metadata.description)
        setImageUrl(nft?.metadata.image)
        
        setLoading(false)
      }
    })  
  }

  async function claim(){
    setLoadingMint(true)

    if(!address){
      toast.error('Conecte sua wallet')
      setLoading(false)
      return
    }

    const tx = await contract?.erc1155.claim(tokenId, amount)
    .then(function(myValue: any){
      const receipt = myValue
      totalMinted()
      toast.success(`Parabéns você mintou seu ${titleNFT}`)

    }).catch(function(error: any){
      console.log(error)
      toast.error('Erro ao mintar este NFT')

    })
    setLoadingMint(false)
    setLoading(false)
  }

  getMetaData()
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{nameProjet}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta content="#000000" name="theme-color"></meta>
      </Head>
      
      <main className={styles.mainContainer}>
        <div className={styles.walletContainer}>
          { address && isMismatched ?
            <button onClick={ () => switchChain(ChainId.Mumbai)} className={styles.btnChain}>Switch Chain</button>
          : 
            <ConnectWallet modalTitle="Login" className={styles.btn}/>
          }
        </div>

        <div className={styles.claimContainer}>
          {loading?
            <div className={styles.loading}>
              <svg className={styles.spinner} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                <circle className={styles.path} fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
              </svg>
            </div> 
          :
          <>
            <div className={styles.infoContainer}>
              <MediaRenderer 
                src={imageUrl}
                alt="NFT Imagem"
                className={styles.media}
              />
              <p>{minted} minted</p>
              <p>{titleNFT}</p>
              <span>{descriptionNFT}</span>
              <div className={styles.mintContainer}>
                <input inputMode="decimal" autoComplete="off" autoCorrect="off" type="number" min="0" step="1" pattern="^[0-9]*[.,]?[0-9]*$" placeholder="1" spellCheck="false" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)}></input>
                {loadingMint?
                  <button>
                    <div className={styles.loading}>
                      <svg className={styles.spinner} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                        <circle className={styles.path} fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
                      </svg>
                    </div> 
                  </button>
                :
                  <button onClick={ claim }>Mint</button>
                }
              </div>
            </div>
           </>
          }
        </div>

        <footer>
          <p>Copyrights © {nameProjet} 2023</p>
        </footer>
      </main>      
    </div>
  )
}
