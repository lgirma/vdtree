import {renderToDom} from "../DOM";
import {SamplesPage} from "./SampleComponents";

const app = document.querySelector<HTMLDivElement>('#app')!

renderToDom(SamplesPage, app)
