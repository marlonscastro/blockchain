import { Router, Request, Response } from 'express';

var routes = Router();

routes.get('/mine_block', (req: Request, res: Response) => {
    return res.json({ message: 'ok'}).status(200);
});
export default routes;