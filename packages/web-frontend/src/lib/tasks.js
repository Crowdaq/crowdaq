import _ from 'lodash';

class Queue extends Array {
    enqueue(val) {
        this.push(val);
    }

    dequeue() {
        return this.shift();
    }

    peek() {
        return this[0];
    }

    isEmpty() {
        return this.length === 0;
    }
}

function counting_requirement_message(annotation){
    if (annotation.min !== undefined && annotation.max !== undefined){
        return `You need to provide ${annotation.min}-${annotation.max} responses.`
    }

    if (annotation.min === undefined && annotation.max !== undefined){
        return `You cannot provide more than ${annotation.max} responses.`
    }

    if (annotation.min !== undefined && annotation.max === undefined){
        return `You must provide at least ${annotation.min} responses.`
    }
    return "You can make multiple responses.";
}

function eval_repeated_constraints(value, annotation) {

    const requirement_msg = counting_requirement_message(annotation);
    const status_msg = `You have saved ${value.length} responses so far.`;

    let {min, max} = annotation;
    if (min === undefined) min = -1;
    if (max === undefined) max = Infinity;
    let passed_count_requirement = value.length >= min && value.length <= max;
    return {
        pass: passed_count_requirement,
        messages: [requirement_msg + status_msg]
    };
}

function eval_constraints(value, annotation, constraints){
    let ret = {
        pass: true,
        messages: []
    };

    if (value === undefined || value === null || value === "") {
        ret.pass = annotation.optional === true;
        return ret;
    }

    constraints = constraints !== undefined ? constraints : [];

    if (annotation.type === 'text'){
        if (value === ""){
            ret.pass = false;
        }
        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];
            if (constraint.type === 'regex'){
                let re = new RegExp(constraint.regex);
                if (!value.match(re)){
                    ret.pass = false;
                    ret.messages.push(constraint.description)
                }
            }
        }

    }

    if (annotation.type === 'multiple-choice'){
        // No constraints.
        ret.pass = value !== "";
    }

    if (annotation.type === 'span-from-text'){
        if (value.surface === "" || value.surface === undefined || value.surface === null) {
            ret.pass = false;
        }else{
            for (let i = 0; i < constraints.length; i++) {
                const constraint = constraints[i];
                if (constraint.type === 'regex'){
                    let re = new RegExp(constraint.regex);
                    if (!value.surface.match(re)){
                        ret.pass = false;
                        ret.messages.push(constraint.description)
                    }
                }
            }
        }

    }

    if (annotation.type === 'datetime'){
        if (value.value === ""){
            ret.pass = false;
        }

        if (value.granularity === 'year' && value.value.length !== 4){
            console.log("if (value.granularity === 'year' && value.value.length !== 4){")
            ret.pass = false;
        }

        if (value.granularity === 'month' && value.value.length !== 7){
            console.log("if (value.granularity === 'month' && value.value.length !== 7){")
            ret.pass = false;
        }

        if (value.granularity === 'day' && value.value.length !== 10){
            console.log("if (value.granularity === 'day' && value.value.length !== 10){")
            ret.pass = false;
        }

        if (value.granularity === 'hour' && value.value.length !== 13){
            console.log("if (value.granularity === 'hour' && value.value.length !== 13){")
            ret.pass = false;
        }

        if (value.granularity === 'minute' && value.value.length !== 16){
            console.log("if (value.granularity === 'minute' && value.value.length !== 16){")
            ret.pass = false;
        }

        if (value.granularity === 'second' && value.value.length !== 19){
            console.log("if (value.granularity === 'second' && value.value.length !== 19){")
            ret.pass = false;
        }

    }

    return ret;

}

function get_default_annotation_response(annotation){
    if (annotation.repeated === true){
        return [];
    }else{
        if (annotation.type === "multiple-choice"){
            return '';
        }

        if (annotation.type === "text"){
            return '';
        }

        if (annotation.type === "span-from-text"){
            return {
                start: -1,
                end: -1
            };
        }

        if (annotation.type === "datetime"){
            return {
                value: "",
                granularity: 'day',
            };
        }
    }
}

function make_default_response(annotation_group){
    const ret = {};
    for(let key in annotation_group.annotations){
        const ann = annotation_group.annotations[key];
        ret[ann.id] = get_default_annotation_response(ann);
    }
    return ret;
}

function make_default_status(annotation_group){
    const ret = {};
    for(let key in annotation_group.annotations){
        const ann = annotation_group.annotations[key];
        ret[ann.id] = {
            pass: ann.optional === true,
            messages: []
        }
    }
    return ret;
}


class ConditionResolver{


    static make_condition_graph(annotation_group){
        const ret = {};
        for(let key in annotation_group.annotations){
            const ann = annotation_group.annotations[key];
            const has_conditions = ann.conditions !== undefined;
            const dependencies = this.get_dependencies(ann);
            ret[ann.id] = {
                display: !has_conditions,
                rules: ann.conditions,
                dependencies: dependencies,
                dependents: [],
                eval_order: Infinity,
            }
        }

        for (let k in ret){
            const node = ret[k];
            _.each(node.dependencies, (id) => {
                ret[id].dependents.push(k);
            })
        }

        let visited = new Set();
        let visited_count = 0;

        while (visited.size < Object.keys(ret).length){
            const dependency_count_map = _.mapValues(ret, (n) => {
                return _.sumBy(n.dependencies, ele => {
                    return visited.has(ele) ? 1 : 0;
                })
            });

            const to_remove = _.filter(dependency_count_map, count => count === 0);
            if (to_remove === 0){
                alert(`Annotation's conditional dependencies graph for [${annotation_group.id}] have cyclic dependency.`);
                break;
            }

            _.forEach(dependency_count_map, function(dependency_count, id) {
                if (dependency_count === 0){
                    visited.add(id);
                    ret[id].eval_order = visited_count;
                    visited_count += 1;
                }
            });
        }

        return ret;
    }

    static get_dependencies(annotation){

        function get_dep_from_rule(rule){
            if (rule.op === 'eq'){
                return [rule.id];
            }

            if (rule.op === 'not'){
                return get_dep_from_rule(rule.arg);
            }

            if (rule.op === 'or'){
                return _.map(rule.args, get_dep_from_rule);
            }

            if (rule.op === 'and'){
                return _.map(rule.args, get_dep_from_rule);
            }
        }

        if (annotation.conditions === undefined){
            return [];
        }else{
            return _.flatMap(annotation.conditions, get_dep_from_rule);
        }
    }

    static rule_matches(rules, results, current_status){
        if (rules === undefined || rules.length === 0){
            return true;
        }


        function eval_rule(rule, results){
            if (rule.op === 'eq'){
                if (results[rule.id] === rule.value && current_status[rule.id].display === true){
                    return true;
                }else{
                    return false;
                }
            }

            if (rule.op === 'or'){

                if (rule.args === undefined || rule.args.length === 0){
                    return true;
                }

                for (let k in rule.args){
                    if (eval_rule(rule.args[k], results)){
                        return true;
                    }
                }

                return false;
            }

            if (rule.op === 'and'){
                if (rule.args === undefined || rule.args.length === 0){
                    return true;
                }

                for (let k in rule.args){
                    if (eval_rule(rule.args[k], results)){
                        return true;
                    }
                }

                return false;
            }

            if (rule.op === 'not'){
                return !eval_rule(rule.arg, results);
            }
            return true;
        }


        for(let k in rules){
            // If one condition false, we return;
            if (!eval_rule(rules[k], results)){
                return false;
            }
        }
        return true;
    }

    static generate_new_display_status(ag_condition_graph, group_result, annotation_id=undefined){
        const  new_ag_conditional_graph = _.cloneDeep(ag_condition_graph);
        const ordered_node = _.sortBy(Object.keys(new_ag_conditional_graph), (x) => (new_ag_conditional_graph[x].eval_order));
        if (annotation_id === undefined){
            for (let k in ordered_node){
                const node_id = ordered_node[k];
                const node = new_ag_conditional_graph[node_id];
                if (this.rule_matches(node.rules, group_result)){
                    new_ag_conditional_graph[node_id].display = true;
                }
            }
            return new_ag_conditional_graph;
        }else{
            const visited = new Set();
            const to_visits = new Queue();

            to_visits.enqueue(annotation_id);

            while(!to_visits.isEmpty()){

                const node_id = to_visits.dequeue();
                console.log("Re-eval: ", node_id);
                if (visited.has(node_id)){
                    continue;
                }

                const node = new_ag_conditional_graph[node_id];

                if (node_id === annotation_id){
                    _.each(node.dependents, (id) => {
                        to_visits.enqueue(id);
                    });
                }else{
                    const old_display_value = node.display;
                    const new_display_value = this.rule_matches(node.rules, group_result, new_ag_conditional_graph);
                    if (new_display_value !== old_display_value){
                        _.each(node.dependents, (id) => {
                            to_visits.enqueue(id);
                        });
                        new_ag_conditional_graph[node_id].display = new_display_value;
                    }
                }
            }
            return new_ag_conditional_graph;
        }
    }
}

function generate_id(){
    return `${new Date().getTime()}${Math.floor(Math.random() * 1000000)}`;
}

function PASS(){
    return {
        pass: true,
        messages: []
    }
}

function task_condition_matched(annotation,
                                result,
                                display_condition,
                                status,
                                ){

}

export default {
    ConditionResolver,
    eval_constraints,
    get_default_annotation_response,
    make_default_response,
    make_default_status,
    eval_repeated_constraints,
    generate_id,
    PASS
}
