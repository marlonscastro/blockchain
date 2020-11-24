// import express from 'express';
// import routes from './routes';

// var app = express();

// app.use(express.json());

// app.use(routes);

// app.listen(8080, () => {
//     console.log('server Running.. ');
// });

import Block from './Objects/Block';
import Blockchain from './Objects/Blockchain';

var blockchain = new Blockchain();

const mine_block = (): any => {
    var previous_block = blockchain.getPreviousBlock() as Block;
    let previous_proof = previous_block.proof;
    let proof = blockchain.proofOfWork(previous_proof);
    let previous_hash = blockchain.hash(previous_block);

    let block_mined = blockchain.createBlock(proof, previous_hash);
    console.log('Parabens, você minerou um bloco.');
 
    return block_mined;
};

mine_block();
let bloco = blockchain.createBlock(blockchain.chain.length+1, 'dados 2', );
blockchain.addBlock(bloco);
console.log(blockchain);




