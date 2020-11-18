'use strict';
const _ = require("lodash");
const Collectors = require('./collectors')

class DataCollectorsClass{
    constructor(){
        this.typeLookup = {}
    }

    register(collectorDefinition){
        this.typeLookup[collectorDefinition.type] = collectorDefinition;
    }

    registerMany(...defs){
        _.each(defs, def => this.register(def))
    }

    getCollector(collectorType){
        return this.typeLookup[collectorType];
    }

    agreement(collectorType, responses){
        const collector = this.getCollector(collectorType);
        if (collector === undefined || collector.agreement === undefined){
            return undefined;
        }else{
            return collector.agreement(responses)
        }
    }
}


const DataCollectors = new DataCollectorsClass();
DataCollectors.registerMany(
    Collectors.MultipleChoiceCollector, 
    Collectors.TextCollector, 
)



function listCollectors(annotationTaskDefinition){
    return _.flatMap(annotationTaskDefinition.annotation_groups, groupDef => {
        const groupId = groupDef.id;
        return _.map(groupDef.annotations, cdef => {
            if (groupDef.repeated){
                return `[]${groupId}.(${cdef.type})${cdef.id}`
            }else{
                return `${groupId}.(${cdef.type})${cdef.id}`
            }
        })
    })
}

function summarizeTaskset(allTasks){
    const allCollectors = _.flatMap(allTasks, listCollectors);
    return _.chain(allCollectors)
        .groupBy(x=>x)
        .map((vs, name) => {
            const count = vs.length;
            return {
                name, count
            }
        }).value()
}

/**
 * This function takes list of responses, and map them to the format of 
 * [
 *  fullCollectorId: [r1, r2, r3]
 * ]
 * 
 * Currently repeated group are ignored.
 * 
 * @param {*} responses 
 */
function aggregateResponses(responses){
    
    
    const ret = {}
    _.chain(responses)
        .flatMap(r => {
            r = getResponseFromJson(r)
            return _.flatMap(r, (groupResponse, groupId) => {
                
                if (groupResponse instanceof Array){
                    return []
                }

                return _.map(groupResponse, (value, key) => {
                    const fullCollectorId = `${groupId}.${key}`;
                    return {
                        fullCollectorId, value
                    }
                })
            })
        })
        .map(x => {
            return x;
        })
        .groupBy(x => x.fullCollectorId)
        .each((v,k) => {
            ret[k] = _.map(v, z => z.value);
        })
        .value();
    
    return ret;

}

function getResponseFromJson(response){
    if (response.hasOwnProperty('filteredResult')){
        // This is new version.
        response = response.filteredResult;
    }

    return response;
}


/**
 * This function transfer responses list of format [{annotation_task_id, payload}]
 * To Collector first format, that is 
 * {
 *   fullCollectorId : 
 * }
 * @param {*} allResponses 
 */
function groupByCollector(allResponses){
    const ret = {};
    _.chain(allResponses)
        .each(resp => {
            const aggregatedResponse = aggregateResponses(responses);
            _.each(aggregatedResponse, (v, fullCollectorId) => {
                if (!ret.hasOwnProperty(fullCollectorId)){
                    ret[fullCollectorId] = {
                        fullCollectorId,
                        responses: []
                    }
                }

                const o = ret[fullCollectorId];
            })    
        })
}


/**
 * This function flatten response into [{
 *      annotation_task_id, worker_platform, worker_id, fullCollectorId, value
 * }]
 * @param {*} allResponses 
 */
function flattenResponses(assignments, {ignoreRepeatedGroup}={}){
    return _.chain(assignments)
    .flatMap(assignment => {

        let {
            annotation_task_id, worker_platform, worker_id, response
        } = assignment;

        if (response instanceof String){
            response = JSON.parse(response)
        }

        if (response.hasOwnProperty('filteredResult')){
            // This is new version.
            response = response.filteredResult;
        }
        
        // Now we have the response object now.
        return _.flatMap(response, (gresp, gid) => {
            if (gresp instanceof Array){
                if (ignoreRepeatedGroup){
                    return [];
                }
                let gresps = gresp;
                return _.map(gresps, gresp => {
                    return _.map(gresp, (value,cid) => {
                        const fullCollectorId = `[]${gid},${cid}`
                        return {
                            annotation_task_id, worker_platform, worker_id, fullCollectorId, value
                        }
                    })
                })
            }else{
                return _.map(gresp, (value,cid) => {
                    const fullCollectorId = `[]${gid},${cid}`
                    return {
                        annotation_task_id, worker_platform, worker_id, fullCollectorId, value
                    }
                })
            }
        })

    })
    .value()
}


function generateDatasetReport(taskDefinitions, allAssignments){

    const taskDefinitionsById = {}
    _.each(taskDefinitions, td => {
        let definition = td.definition;
        // console.log(typeof definition)

        // console.log(definition);

        taskDefinitionsById[td.annotation_task_id] = definition;
    })

    // console.log(JSON.stringify(taskDefinitionsById));

    const groupedResponses = _.chain(allAssignments)
        .groupBy(r => r.annotation_task_id)
        .map((responses, annotation_task_id) => 
            {
                return {
                    definition: taskDefinitionsById[annotation_task_id],
                    responses: aggregateResponses(_.map(responses, r=>r.response)),
                    annotation_task_id
                }
            }
        ).value()

    // console.log(groupedResponses)

    const collectorAgreements =  _.map(groupedResponses, ({
        definition, responses, annotation_task_id
    }) => {
        const definitionTypeLookup = {}
        _.each(definition, groupDefinitions => {
            _.each(groupDefinitions, ({id: gid, annotations}) => {
                _.each(annotations, ({
                    id, type
                }) => {
                    definitionTypeLookup[`${gid}.${id}`] = type;
                })
            })
        })



        const agreementByCollector = {
            annotation_task_id 
        }

        
        _.each(responses, (responseList, fullCollectorId) => {
            const type = definitionTypeLookup[fullCollectorId];
            agreementByCollector[fullCollectorId] = DataCollectors.agreement(type, responseList)
        })

        return agreementByCollector
    })

    return {
        collectorAgreements
    }
}


module.exports = {
    DataCollectors,
    listCollectors,
    generateDatasetReport
};
