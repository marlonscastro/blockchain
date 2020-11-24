import crypto from 'crypto';
import Block from './Block';

class Blockchain {
    public chain: Block[] = [];

    constructor() {
        this.chain = [];
        this.createBlock(1, '0');
    }

    public createBlock(proof: string, previous_hash: string): Block {
        let block = new Block((this.chain.length + 1), '', previous_hash);
        return block;
    }

    public getPreviousBlock(): Block {
        return this.chain.pop() as Block;
    }

    public proofOfWork(previous_proof: number): number {
        let new_proof = 1;
        let check_proof = false;
        while (check_proof == false) {
            let hash_operation = crypto.createHash('sha256').update((new_proof ** 2 - previous_proof ** 2).toString()).digest('hex');
            if (hash_operation.substr(0, 4) === '0000')
                check_proof = true;
            else
                new_proof += 1;
        }
        return new_proof;
    }

    public hash(block: Block): string {
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

            let previous_proof = previous_block['nonce'];
            let proof = block['nonce'];
            let hash_operation = crypto.createHash('sha256').update((proof ** 2 - previous_proof ** 2).toString()).digest('hex');
            if (hash_operation.substr(0, 4) !== '0000')
                return false;
            previous_block = block;
            block_index += 1;
        }
        return true;
    }
}

export default Blockchain;