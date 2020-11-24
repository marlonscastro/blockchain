class Block {
    public index: number;
    public data: string;
    public timestamp: number;
    public previous_hash: string;
    public nonce: number;

    constructor(index: number, data: string, previous_hash: string) {
        this.index = index;
        this.data = data;
        this.previous_hash = previous_hash;
        this.timestamp = Date.now();
        this.nonce = 1;
    }
}

export default Block;