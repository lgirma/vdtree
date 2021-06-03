import express from 'express';
import {toHtmlString} from "../SSR";
import {vd} from "../AbstractDOM";

const app = express()
let port = 8585

app.get('/', (req, res) => {
    res.send(toHtmlString([
        vd('div', {}, [
            'Hello ',
            vd('span', {style: {color: 'red', 'text-decoration': 'underline'}}, 'SSR'),
            ', World!'
        ]),
        vd('div', {}, 'Line 2')
    ]))
})

app.listen(port, () => {
    console.log(`SSR sample app listening at http://localhost:${port}`)
})