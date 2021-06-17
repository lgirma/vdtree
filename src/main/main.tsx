import {renderToDom} from "../targets/DOM";
import {SamplesPage} from "./SampleComponents";

const app = document.querySelector<HTMLDivElement>('#app')!

renderToDom(SamplesPage, app)
