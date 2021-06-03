// @ts-ignore
import {createServer} from 'http'
import {toHtmlString} from "../SSR";
import {vd} from "../AbstractDOM";

const server = createServer(function (req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    if ( req.method === 'OPTIONS' ) {
        res.end();
        return;
    }
    res.write(toHtmlString(
        vd('div', {}, 'Hello, SSR World!')
    ));
    res.end();
});
server.listen(8585);