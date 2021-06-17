import express from 'express';
import {toHtmlString} from "../targets/SSR";
import {SamplesPage} from "./SampleComponents";
import {h} from '../AbstractDOM'
import {withState} from "../AbstractState";

const app = express()
let port = 8585

app.get('/', (req, res) => {
    res.send(toHtmlString(SamplesPage))
})

app.listen(port, () => {
    console.log(`SSR sample app listening at http://localhost:${port}`)
})