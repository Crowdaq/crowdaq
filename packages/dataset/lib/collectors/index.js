const _ = require('lodash')

const TextCollector = {
    type: "text",

    inputType: {

    },

    outputType: {

    },

    initResponse(){

    },

    aggregated(){

    },

    agreement(){

    }
}


const MultipleChoiceCollector = {
    type: "multiple-choice",

    inputType: {

    },

    outputType: {

    },

    initResponse(){
        return ""
    },

    aggregated(responses) {
        const ret = _.chain(responses)
            .groupBy(x => x)
            .map((v, value) => ({
                confidence: v.length / responses.length,
                value
            }))
            .maxBy(x=>x.confidence).value();
        return ret;
    },

    agreement(responses) {
        const best = this.aggregated(responses);
        return best.confidence;
    },

    defaultAgreementMetricName: "wawa"
}


module.exports = {
    TextCollector,
    MultipleChoiceCollector,
};