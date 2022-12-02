import express, { Response, Request } from 'express'
import Blockchain from './src/blockchain'
import { v4 as uuidv4 } from 'uuid'
import crypto, { createPublicKey } from 'crypto'
import { sha256 } from 'js-sha256'

const app = express()

let blockchain = new Blockchain()

let node_address = uuidv4().replace('-', '')

app.use(express.json())

app.get('/', (_, res: Response) => {
    res.status(200).json({ message: 'Blockchain está rodando!' })
})

app.get('/mine_block', (_, res: Response) => {
    let previous_block = blockchain.getPreviousBlock()
    let previous_proof = previous_block['proof']
    let proof = blockchain.proofOfWork(previous_proof)
    let previous_hash = blockchain.hash(previous_block)

    blockchain.add_transaction(node_address, 'Marlon', 1)

    let block = blockchain.createBlock(proof, previous_hash)
    res.status(200).json({
        message: 'Parabéns, você minerou um bloco',
        index: block['index'],
        timestamp: block['timestamp'],
        proof: block['proof'],
        previous_hash: block['previous_hash'],
        transactions: block['transactions']
    })
})

app.get('/chain', (_, res: Response) => {
    res.status(200).json({
        chain: blockchain.chain,
        length: blockchain.chain.length
    })
})

app.post('/add_transaction', (req: Request, res: Response) => {
    const { sender, receiver, amount } = req.body

    if (!sender || !receiver || !amount)
        return res.status(400).json({error: 'Alguns Campos estão faltando'})

    let index = blockchain.add_transaction(sender, receiver, amount)
    return res.status(201).json({ message: `Esta transação será adicionada ao Bloco: ${index}` })
})

app.post('/connect-node', (req: Request, res: Response) => {
    const { nodes } = req.body
    if(!nodes){
        return res.status(400)
    }
    for (let node of nodes){
        blockchain.add_node(node)
    }
    return res.status(201).json({ message: 'Ok. A Blockchain contém os seguintes nodes',
                                total_nodes: blockchain.nodes})
})

app.put('/replace_chain', async (_, res: Response) => {
    let is_chain_replaced = await blockchain.replace_chain()
    if(is_chain_replaced)
        return res.status(201).json({ message: 'A Blockchain foi substituida com sucesso !'})
    return res.status(200).json({ message: 'Não houve substituição da Blockchain'})
})

//************** Gerar Par de Chaves ************************
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
})

const walletAddress = sha256(publicKey.toString())
// console.log('Wallet Address: ', walletAddress)

//************** Encriptar dados ****************************
const data = "my secret data"

const encryptedData = crypto.publicEncrypt(
	{
		key: publicKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	Buffer.from(data)
)
// console.log("encypted data: ", encryptedData.toString("base64"))

//************** Desencriptar dados *************************
const decryptedData = crypto.privateDecrypt(
	{
		key: privateKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	encryptedData
)
// console.log("decrypted data: ", decryptedData.toString())


// VERIFICAR ASSINATURA SE É VALIDA 
const verifiableData = "my secret data"
const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
	key: privateKey,
	padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
})

console.log(signature.toString("base64"))
const isVerified = crypto.verify(
	"sha256",
	Buffer.from(verifiableData),
	{
		key: publicKey,
		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	},
	signature
)
console.log("signature verified: ", isVerified)

app.listen(process.env.PORT, () => {
    console.log('Blockchain online on port '+process.env.PORT)
})

/* 
    OBSERVAÇÕES: 
    1)  A funçao replace_chain so usa como parâmetro o tamanho da blockchain, o que é um erro, pois inicialmente por exemplo, 
        existem 3 blockchains com apenas 1 bloco genesis com TIMESTAMPS diferentes 

    2) em que momento a rede se auto atualiza, se iguala todas as blockchain em todos os nós (Protocolo de consenso) ?

    3) que url será utilizada como padrão para inserir transações ?

    4) se as transações estiverem em todos os nós, ao minerar, como essa informação será repassada ao demais nós ??

    5) Nao deve permitir nós duplicados  
*/