import express from 'express';
import {toHtmlString} from "../SSR";
import {h} from "../AbstractDOM";

const app = express()
let port = 8585

app.get('/', (req, res) => {
    res.send(toHtmlString([
        h('div', {}, [
            'Hello ',
            h('span', {style: {color: 'red', 'text-decoration': 'underline'}}, 'SSR'),
            ', World!'
        ]),
        h('div', {}, 'Line 2')
    ]))
})

app.listen(port, () => {
    console.log(`SSR sample app listening at http://localhost:${port}`)
})