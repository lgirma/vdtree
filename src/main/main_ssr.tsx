/** @jsx h */
import express from 'express';
import {toHtmlString} from "../SSR";
import {h} from "../AbstractDOM";
import {withState} from "../AbstractState";

const app = express()
let port = 8585

app.get('/', (req, res) => {
    res.send(toHtmlString([
        <div>
            Hello
            <span style={{color: 'red', textDecoration: 'underline'}}>SSR</span>
            World!
        </div>,
        <div>Line 2</div>,
        withState(0, count => <div>
            <div>{count.get()}</div>
            <button onClick={e => alert('Hello, World!')}>+</button>
        </div>)
    ]))
})

app.listen(port, () => {
    console.log(`SSR sample app listening at http://localhost:${port}`)
})