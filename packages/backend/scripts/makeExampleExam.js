/* global process:writable */
const sentiment  = require('@crowdaq/schema/crowdaq/examples/exam/simple.json');
const _ = require("lodash")
const fs = require("fs")
const path = require("path")

const cliArgs = process.argv.slice(2);

const [outputDir] = cliArgs;

_.each(_.range(10), function(i){
    sentiment.annotation_task_id = `${i}`
    sentiment.contexts[0].text = `This is product ${i}`
    fs.writeFileSync(path.join(outputDir, `sentiment-${i}.json`), JSON.stringify(sentiment))
})