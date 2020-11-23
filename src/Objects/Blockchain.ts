import crypto from 'crypto';

class Blockchain {
    private chain: Block[];
    private previous_hash: string = '0';

    constructor() {
        this.chain = [];
    }

    public createBlock(proof: any, previous_hash: string): Block {
        let block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            previous_hash: previous_hash,
            proof: 1
        }
        this.chain.push(block);
        return block;
    }

    public getPreviousBlock(): Block | undefined {
        return this.chain.pop();
    }

    public proofOfWork(previous_proof: number): number {
        let new_proof = 1;
        let check_proof = false;
        while (check_proof == false) {
            let hash_operation = crypto.createHash('sha256').update((new_proof * new_proof - previous_proof * previous_proof).toString()).digest('hex');
            if (hash_operation.substr(0, 4) === '0000')
                check_proof = true;
            else
                new_proof += 1;
        }
        return new_proof;
    }

    public hash(block: Block): string {
        // Pega Json (Block) e da um stringfy para repassar p função abaixo;
        let strBlock = JSON.stringify(block);
        return crypto.createHash('sha256').update(strBlock).digest('hex');
    }

    public isValidChain(chain: Block[]): boolean {
        let previous_block = chain[0];
        let block_index = 1;
        while (block_index < chain.length) {
            let block = chain[block_index];
            if (block['previous_hash'] !== this.hash(previous_block))
                return false;

            let previous_proof = previous_block['proof'];
            let proof = block['proof'];
            let hash_operation = crypto.createHash('sha256').update((proof * proof - previous_proof * previous_proof).toString()).digest('hex');
            if (hash_operation.substr(0, 4) !== '0000')
                return false;
            previous_block = block;
            block_index += 1;
        }
        return true;
    }
}

export default Blockchain;