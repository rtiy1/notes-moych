import {
  flowRendererV2,
  flowStyles
} from "./chunk-V7Q3COZ4.js";
import "./chunk-BJTYSMJV.js";
import {
  flowDb,
  parser$1
} from "./chunk-KBZLVC4D.js";
import "./chunk-OKGDODFK.js";
import "./chunk-UZYQOYF5.js";
import "./chunk-VNKUPM24.js";
import "./chunk-SGEXBTB7.js";
import {
  require_dist,
  setConfig
} from "./chunk-6QSJCLSL.js";
import "./chunk-L6EXXZPS.js";
import {
  require_dayjs_min
} from "./chunk-RCBI6IFN.js";
import {
  __toESM
} from "./chunk-PR4QN5HX.js";

// node_modules/mermaid/dist/flowDiagram-v2-4f6560a1.js
var import_dayjs = __toESM(require_dayjs_min(), 1);
var import_sanitize_url = __toESM(require_dist(), 1);
var diagram = {
  parser: parser$1,
  db: flowDb,
  renderer: flowRendererV2,
  styles: flowStyles,
  init: (cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    setConfig({ flowchart: { arrowMarkerAbsolute: cnf.arrowMarkerAbsolute } });
    flowRendererV2.setConf(cnf.flowchart);
    flowDb.clear();
    flowDb.setGen("gen-2");
  }
};
export {
  diagram
};
//# sourceMappingURL=flowDiagram-v2-4f6560a1-OT6OFQ4J.js.map
