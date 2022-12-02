import { sha256 } from 'js-sha256'
import axios from 'axios'

axios.defaults.validateStatus = () => { return true }

interface Block {
    index: number
    timestamp: string
    previous_hash: string
    proof: number
    transactions: Transaction[]
}

interface Transaction {
    sender: string
    receiver: string
    amount: number
}

interface Node {
    host: string
}

interface Chain {
    chain: [],
    length: 1
}

export default class Blockchain {
    public chain: Block[]
    private transactions: Transaction[]
    public nodes: Node[]
    constructor() {
        this.chain = []
        this.transactions = []
        this.nodes = []
        // Criação do block Genesis
        this.createBlock(1, '0')
    }

    public createBlock(proof: number, previous_hash: string): Block {
        const block: Block = {
            index: this.chain.length + 1,
            timestamp: Date(),
            previous_hash,
            proof,
            transactions: this.transactions
        }
        this.transactions = []
        this.chain.push(block)
        return block
    }

    public getPreviousBlock(): Block {
        return this.chain[this.chain.length - 1]
    }

    public proofOfWork(previous_proof: number): number {
        let new_proof = 1;
        let check_proof = false;
        while (!check_proof) {
            const hash_operation = sha256(String(new_proof ** 2 - previous_proof ** 2))
            if (hash_operation.substr(0, 5) === '00000')
                check_proof = true
            else
                new_proof += 1
        }
        return new_proof;
    }

    public hash(block: Block): string {
        return sha256(JSON.stringify(block))
    }

    public is_chain_valid(chain: Block[]): boolean {
        let previous_block = this.chain[0]
        let block_index = 1
        while (block_index < chain.length) {
            let block: Block = chain[block_index]
            if (block['previous_hash'] !== this.hash(previous_block)) {
                return false
            }
            let previous_proof = previous_block['proof']
            let proof = block['proof']
            let hash_operation = sha256(String(proof ** 2 - previous_proof ** 2))
            if (hash_operation.substr(0, 5) !== '00000')
                return false
            previous_block = block
            block_index += 1
        }
        return true
    }

    public add_transaction(sender: string, receiver: string, amount: number): number {
        this.transactions.push({
            sender,
            receiver,
            amount
        })
        const previous_block = this.getPreviousBlock()
        return previous_block['index'] + 1
    }

    public add_node(address: string) {
        this.nodes.push({
            host: new URL(address).host
        })
    }

    public async replace_chain(): Promise<boolean> {
        let longest_chain: Block[] = []
        let maxlength = this.chain.length

        /**
         *  O For é Diferente do ForEach, o ForEach é assincrono (executa ao mesmo tempo que outras instruções subsequentes no código)
         *  já o "for" só deixa o fluxo de execução prosseguir, caso ele já tenha terminado  
         */
        for (const node of this.nodes) {
            console.log('Verificando o host: ', `http://${node.host}/chain`)
            try {
                const response = await axios.get<Chain>(`http://${node.host}/chain`)
                if (response.status === 200) {
                    let length = response.data.length
                    let chain = response.data.chain
                    if (length > maxlength && this.is_chain_valid(chain)) {
                        console.log(`O host http://${node.host}, tem a blockchain maior, de tamanho '${length}'`)
                        maxlength = length
                        longest_chain = chain
                    }
                }
                else {
                    console.log('fail to verify host: ' + node.host)
                }
            } catch (error) {
                console.log('fail to verify host: ' + node.host)
            }
        }

        if (longest_chain.length !== 0) {
            this.chain = longest_chain
            return true
        }
        return false

    }
}