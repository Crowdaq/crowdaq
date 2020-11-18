const {
    knex, update_spread, create_spread
} = require('../db/knex');

const {
    LIST_FROM_DB, GET_FROM_DB, DELETE_FROM_DB, ITEM_EXIST, UPDATE_FROM_DB, ALL_FROM_DB, remove_undefined, paged_query
} = require('../db/common');
const CrowdaqException = require("../api/error");
const logger = require("../logger");

const {JsonValidator} = require("@crowdaq/schema");
const Dataset = require("@crowdaq/dataset")

const validator = new JsonValidator();
const _ = require("lodash");
const {create} = require("lodash");
const moment = require("moment");
const {request} = require("express");
const AdmZip = require('adm-zip');
const Schema = require('@crowdaq/schema');
const fs = require("fs");
const AWS = require('aws-sdk')

function installOn(api) {

    api.addResolvers([
        {
            name: 'instruction.list',
            handle: async function (args, req, res) {
                const {owner, page_option} = args;
                req.ensureUser(owner)
                const ret = await LIST_FROM_DB("Instructions", {owner}, page_option);
                return ret;
            }
        },
        {
            name: 'instruction.get',
            handle: async function (args, req, res) {
                const {owner, instruction_id} = args;
                const ret = await GET_FROM_DB("Instructions", {owner, instruction_id});
                if (!ret) {
                    throw new CrowdaqException('Instruction does not exist.')
                }
                return ret;
            }
        },
        {
            name: 'instruction.delete',
            handle: async function (args, req, res) {
                const {owner, instruction_id} = args;
                req.ensureUser(owner)
                return DELETE_FROM_DB("Instructions", {owner, instruction_id});
            }
        },
        {
            name: 'instruction.update',
            handle: async function (args, req, res) {
                let {owner, instruction_id, definition} = args;
                req.ensureUser(owner)
                logger.debug({owner, instruction_id, definition});
                return UPDATE_FROM_DB("Instructions",
                    {owner, instruction_id, definition, ...create_spread()},
                    {owner, instruction_id, definition, ...update_spread()},
                    '(owner, instruction_id)');
            }
        }
    ])

    api.addResolvers([
        {
            name: 'tutorial.list',
            handle: async function (args, req, res) {
                const {owner, page_option} = args;
                req.ensureUser(owner)
                return LIST_FROM_DB("Tutorials", {owner}, page_option);
            }
        },
        {
            name: 'tutorial.get',
            handle: async function (args, req, res) {
                const {owner, tutorial_id} = args;
                // req.ensureUser(owner)
                const ret = await GET_FROM_DB("Tutorials", {owner, tutorial_id});
                if (ret) {
                    ret.definition = JSON.parse(ret.definition)
                    return ret;
                } else {
                    throw new CrowdaqException('Tutorial does not exist.')
                }

            }
        },
        {
            name: 'tutorial.delete',
            handle: async function (args, req, res) {
                const {owner, tutorial_id} = args;
                req.ensureUser(owner)
                return DELETE_FROM_DB("Tutorials", {owner, tutorial_id});
            }
        },
        {
            name: 'tutorial.update',
            handle: async function (args, req, res) {
                let {owner, tutorial_id, definition} = args;
                req.ensureUser(owner)
                const validation_result = validator.validate_tutorial(definition);
                if (!validation_result.valid) {
                    const err_msg = _.map(validation_result.errors, err => `${err.property} ${err.message}`);
                    throw new CrowdaqException(
                        err_msg
                    )
                }
                definition = JSON.stringify(definition);
                return UPDATE_FROM_DB(
                    "Tutorials",
                    {owner, tutorial_id, definition, ...create_spread()},
                    {owner, tutorial_id, definition, ...update_spread()},
                    '(owner, tutorial_id)'
                );
            }
        }
    ])


    api.addResolvers([
        {
            name: 'exam.list',
            handle: async function (args, req, res) {
                const {owner, page_option} = args;
                req.ensureUser(owner)
                return LIST_FROM_DB("ExamConfigs", {owner}, page_option);
            }
        },
        {
            name: 'exam.get',
            handle: async function (args, req, res) {
                const {owner, exam_id} = args;
                req.ensureUser(owner)
                return GET_FROM_DB("ExamConfigs", {owner, exam_id});
            }
        },
        {
            name: "exam.delete",
            handle: async function (args, req, res) {
                const {owner, exam_id} = args;
                req.ensureUser(owner)

                const count = await knex('ExamAssignments')
                    .where({owner, exam_id})
                    .whereNotNull("response_payload")
                    .count("* as CNT");

                const exist = count[0].CNT > 0;

                if (exist) {
                    throw new CrowdaqException(`
                    Exam Assignments exists for exam ${owner}/${exam_id}, 
                    you need to delete them before delete this exam.`.trim())
                }

                return DELETE_FROM_DB("ExamConfigs", {owner, exam_id});
            }
        },
        {
            name: "exam.update",
            handle: async function (args, req, res) {
                let {owner, exam_id, definition} = args;
                req.ensureUser(owner)
                const {
                    num_of_questions,
                    max_attempts,
                    passing_grade,
                    time_limit_in_seconds,
                    instruction_id,
                    tutorial_id,
                    qualification_id
                } = definition;

                const exam_update = UPDATE_FROM_DB(
                    "ExamConfigs",
                    {
                        owner, exam_id, num_of_questions,
                        max_attempts,
                        passing_grade,
                        time_limit_in_seconds,
                        instruction_id,
                        tutorial_id,
                        qualification_id,
                        ...create_spread()
                    },
                    {
                        owner, exam_id, num_of_questions,
                        max_attempts,
                        passing_grade,
                        time_limit_in_seconds,
                        instruction_id,
                        tutorial_id,
                        qualification_id,
                        ...update_spread()
                    },
                    '(owner, exam_id)'
                );
            }
        }
    ])


    api.addResolvers([
        {
            name: 'exam_question.list',
            handle: async function (args, req, res) {
                const {owner, exam_id, page_option} = args;
                req.ensureUser(owner)
                const questions = await LIST_FROM_DB("ExamQuestions", {owner, exam_id}, page_option);

                const questionIdToTotalCount = {}
                const questionIdToDistribution = {}


                const question_ids = _.map(questions.payload, question => {
                    questionIdToTotalCount[question.question_id] = 0;
                    questionIdToDistribution[question.question_id] = [];
                    return question.question_id;
                })

                const responses = await knex.queryBuilder()
                    .select(
                        "question_id",
                        "selection",
                        knex.raw('COUNT(selection) AS count'),
                    )
                    .from(
                        knex("ExamAssignmentRecord")
                            .where({owner, exam_id})
                            .whereIn("question_id", question_ids).as('T')
                    )
                    .groupBy("question_id", "selection");


                _.each(responses, ({
                                       question_id,
                                       selection,
                                       count
                                   }) => {
                    questionIdToTotalCount[question_id] += parseInt(count);
                    questionIdToDistribution[question_id].push({
                        selection,
                        count
                    });
                })

                _.each(questions.payload, question => {
                    const {question_id} = question;
                    question.totalCount = questionIdToTotalCount[question_id]
                    question.answerDistribution = questionIdToDistribution[question_id]
                    question.definition = JSON.parse(question.definition);
                })

                return questions;
            }
        },
        {
            name: 'exam_question.get',
            handle: async function (args, req, res) {
                const {owner, exam_id, question_id} = args;
                req.ensureUser(owner)
                const ret = GET_FROM_DB("ExamQuestions", {owner, exam_id, question_id});
                ret.definition = JSON.parse(ret.definition)
                return ret;
            }
        },
        {
            name: 'exam_question.delete',
            handle: async function (args, req, res) {
                const {owner, exam_id, question_id} = args;
                req.ensureUser(owner)
                return DELETE_FROM_DB("ExamQuestions", {owner, exam_id, question_id});
            }
        },
        {
            name: 'exam_question.update',
            handle: async function (args, req, res) {
                let {owner, exam_id, question_id, definition} = args;
                req.ensureUser(owner)
                const disabled = false;
                definition = JSON.stringify(definition);
                return UPDATE_FROM_DB(
                    "ExamQuestions",
                    {owner, exam_id, question_id, definition, disabled, ...create_spread()},
                    {owner, exam_id, question_id, definition, disabled, ...update_spread()},
                    '(owner, exam_id, question_id)'
                );
            }
        },


        {
            name: 'exam_question.disable',
            handle: async function (args, req, res) {
                let {owner, exam_id, question_id} = args;
                req.ensureUser(owner)
                return knex('ExamQuestions')
                    .where({owner, exam_id, question_id})
                    .update({disabled: true})
            }
        },

        {
            name: 'exam_question.enable',
            handle: async function (args, req, res) {
                let {owner, exam_id, question_id} = args;
                req.ensureUser(owner)
                return knex('ExamQuestions')
                    .where({owner, exam_id, question_id})
                    .update({disabled: false})
            }
        },

        {
            name: "exam_question.update_batch",
            handle: async function (args, req, res) {
                let {owner, exam_id, question_set} = args;
                req.ensureUser(owner)
                const schemaValidator = new Schema.JsonValidator();
                let missingIds = 0;

                logger.debug(`question_set length : ${question_set.length}`)

                const insertToDBAction = new Promise((resolve, reject) => {
                    knex.transaction(trx => {
                        const queries = [];
                        question_set.forEach(question => {
                            const {question_id} = question;
                            if (!question_id) {
                                missingIds += 1;
                            }
                            if (!schemaValidator.validate_exam_question(question).valid) {
                                trx.rollback();
                                const e = new CrowdaqException(`${question_id} violate schema.`);
                                reject(e);
                                throw e;
                            }
                            const definition = JSON.stringify(question)
                            const disabled = false;

                            logger.debug({
                                owner, exam_id, question_id, definition
                            })

                            const update_object = {
                                owner,
                                exam_id,
                                question_id,
                                definition, ...update_spread(),
                            };

                            const insert_object = {
                                owner,
                                exam_id,
                                question_id,
                                definition, ...create_spread(),
                                disabled
                            };
                            const constraint = '(owner, exam_id, question_id)';

                            const insert = trx('ExamQuestions').insert(insert_object);
                            const update = trx.queryBuilder().update(update_object);
                            const query = trx.raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update]);
                            queries.push(query);
                        });

                        Promise.all(queries) // Once every query is written
                            .then(() => {
                                trx.commit();
                                const messages = []
                                messages.push(`${queries.length} questions updated.`)
                                if (missingIds > 0) {
                                    messages.push(`${missingIds} questions missing question_id field.`)
                                }

                                resolve(_.join(messages, "\n"));

                            }) // We try to execute all of them
                            .catch(
                                (err) => {
                                    logger.error(err);
                                    logger.error(err.stack);
                                    trx.rollback();
                                    reject(new CrowdaqException('Updating Database failed.'))
                                }); // And rollback in case any of them goes wrong
                    });
                })
                const ret = await insertToDBAction;
            }
        }
    ])

    api.addResolvers([
        {
            name: 'exam_assignment.list',
            handle: async function (args, req, res) {
                const {owner, exam_id, page_option, worker_platform, worker_id} = args;
                req.ensureUser(owner)

                const baseQuery = () => knex('ExamAssignments').where({
                    owner, exam_id,
                    ...remove_undefined({worker_platform, worker_id})
                }).whereNotNull("response_payload")

                const ret = await paged_query(baseQuery, baseQuery, page_option)

                _.each(ret.payload, x => {
                    x.assignment_payload = JSON.parse(x.assignment_payload)
                    x.response_payload = JSON.parse(x.response_payload)
                })
                return ret;
            }
        },
        {
            name: 'exam_assignment.get',
            handle: async function (args, req, res) {
                const {owner, exam_id, question_id} = args;
                req.ensureUser(owner)
                const ret = GET_FROM_DB("ExamAssignments", {owner, exam_id, question_id});
                ret.assignment_payload = JSON.parse(ret.assignment_payload)
                ret.response_payload = JSON.parse(ret.response_payload)
                return ret;
            }
        },
        {
            name: 'exam_assignment.delete',
            handle: async function (args, req, res) {
                const {owner, exam_id, _id} = args;
                logger.debug(`Deleting ${owner}/${_id}`)
                req.ensureUser(owner)
                await DELETE_FROM_DB("ExamAssignmentRecord", {owner, exam_id, exam_assignment_id: _id});
                return DELETE_FROM_DB("ExamAssignments", {owner, exam_id, _id});
            }
        },
        {
            name: 'exam_assignment.update',
            handle: async function (args, req, res) {
                let {owner, exam_id, question_id, definition} = args;
                req.ensureUser(owner)
                const disabled = false;
                definition = JSON.stringify(definition);
                return UPDATE_FROM_DB(
                    "ExamAssignments",
                    {owner, exam_id, question_id, definition, disabled, ...create_spread()},
                    {owner, exam_id, question_id, definition, disabled, ...update_spread()},
                    '(owner, exam_id, question_id)'
                );
            }
        }
    ])

    api.addResolvers([
        {
            name: 'annotation_taskset.list',
            handle: async function (args, req, res) {
                const {owner, page_option} = args;
                req.ensureUser(owner)
                return LIST_FROM_DB("AnnotationTaskConfigs", {owner}, page_option);
            }
        },
        {
            name: 'annotation_taskset.get',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id} = args;
                req.ensureUser(owner)
                return GET_FROM_DB("AnnotationTaskConfigs", {owner, annotation_taskset_id});
            }
        },
        {
            name: 'annotation_taskset.delete',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id} = args;
                req.ensureUser(owner)
                // let exist = await ITEM_EXIST("AnnotationTaskAssignments", {
                //     owner, annotation_taskset_id
                // })

                const count = await knex('AnnotationTaskAssignments')
                    .where({owner, annotation_taskset_id})
                    .whereNotNull("complete_time")
                    .count("* as CNT");

                const exist = count[0].CNT > 0;

                if (exist) {
                    throw new CrowdaqException(`
                Annotation Task Assignments exists for taskset ${owner}/${annotation_taskset_id}, 
                you need to delete them before delete this taskset.`.trim())
                }

                const delete_tasks = await DELETE_FROM_DB("AnnotationTasks", {owner, annotation_taskset_id});
                const delete_set = await DELETE_FROM_DB("AnnotationTaskConfigs", {owner, annotation_taskset_id});
                return {
                    success: true
                };
            }
        },
        {
            name: 'annotation_taskset.update',
            handle: async function (args, req, res) {
                let {owner, annotation_taskset_id, definition} = args;
                req.ensureUser(owner)
                return UPDATE_FROM_DB(
                    "AnnotationTaskConfigs",
                    {owner, annotation_taskset_id, ...definition, ...create_spread()},
                    {owner, annotation_taskset_id, ...definition, ...update_spread()},
                    '(owner, annotation_taskset_id)'
                );
            }
        }
    ])

    api.addResolver({
        name: 'annotation_taskset.upload_file',
        handle: async function (args, req, res) {
            const {owner, annotation_taskset_id} = args;
            req.ensureUser(owner)
            const {files} = req;
            logger.debug(files);
            const schemaValidator = new Schema.JsonValidator();

            const insertToDBAction = new Promise((resolve, reject) => {
                knex.transaction(trx => {
                    _.each(files, ({
                                       saveTo,
                                       fieldname,
                                       filename,
                                       encoding,
                                       mimetype
                                   }) => {
                        logger.debug('Processing: ')
                        logger.debug({
                            saveTo,
                            fieldname,
                            filename,
                            encoding,
                            mimetype
                        })
                        if (!filename.endsWith('.zip')) {
                            return;
                        }
                        const zipFile = new AdmZip(saveTo);
                        const zipEntries = zipFile.getEntries();

                        const queries = [];
                        let missingIds = 0;

                        zipEntries.forEach(function (zipEntry) {
                            if (zipEntry.entryName.toLowerCase().endsWith(".json")) {
                                let definition = undefined;
                                try {
                                    const content = zipEntry.getData().toString('utf8');
                                    definition = JSON.parse(content);
                                } catch (e) {
                                    logger.error(`Cannot parse json file ${zipEntry.entryName}`)
                                    // logger.error(e.message);
                                }
                                if (definition) {
                                    logger.debug("We have opened uploaded task file.");

                                    const saveTask = (definition, indexName) => {

                                        if (!definition) {
                                            return;
                                        }

                                        if (!schemaValidator.validate_annotation_task(definition).valid) {
                                            logger.error(`${zipEntry.entryName}: ${definition.annotation_task_id} violate schema.`);
                                            definition = undefined;
                                            return;
                                        }

                                        logger.debug('Definition is :');
                                        logger.debug(definition);
                                        const {annotation_task_id} = definition;
                                        if (!annotation_task_id) {
                                            logger.error("Missing annotation_task_id.");
                                            missingIds += 1;
                                            definition.annotation_task_id = `${zipEntry.entryName}_${indexName}`;
                                        }
                                        const definitionStr = JSON.stringify(definition);

                                        const update_object = {
                                            owner,
                                            annotation_taskset_id,
                                            annotation_task_id,
                                            definition: definitionStr, ...update_spread()
                                        };
                                        const insert_object = {
                                            owner,
                                            annotation_taskset_id,
                                            annotation_task_id,
                                            definition: definitionStr, ...create_spread()
                                        };
                                        const constraint = '(owner, annotation_taskset_id, annotation_task_id)';

                                        const insert = trx('AnnotationTasks').insert(insert_object);
                                        const update = trx.queryBuilder().update(update_object);
                                        const query = trx.raw(`? ON CONFLICT ${constraint} DO ? returning *`, [insert, update]);
                                        // console.debug(query.toString());
                                        queries.push(query);
                                    };

                                    if (definition instanceof Array) {
                                        _.each(definition, (d, i) => saveTask(d, `${i}`))
                                    } else if (definition instanceof Object) {
                                        saveTask(definition, "root")
                                    }

                                }
                            }
                        });


                        Promise.all(queries) // Once every query is written
                            .then(qs => {
                                trx.commit();

                                try {
                                    fs.unlinkSync(saveTo)
                                    //file removed
                                } catch (err) {
                                    logger.error('Failed to remove file beacuse');
                                    logger.error(err);
                                }


                                const messages = []
                                messages.push(`${queries.length} tasks updated.`)
                                if (missingIds > 0) {
                                    messages.push(`${missingIds} task missing annotation_task_id field.`)
                                }

                                resolve(_.join(messages, "\n"));
                            }) // We try to execute all of them
                            .catch(err => {
                                logger.error('Some query failed.');
                                logger.error(err);
                                logger.error(err);
                                trx.rollback();
                                reject(new CrowdaqException('Updating Database failed.'))
                            }); // And rollback in case any of them goes wrong
                    });
                })
            })
            try{
                const msg = await insertToDBAction;
                return {
                    message: msg
                }
            }catch(e){
                console.log(e);
            }
            


        }
    })

    api.addResolvers([


        {
            name: 'annotation_task.list',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id, page_option} = args;
                req.ensureUser(owner)
                return LIST_FROM_DB("AnnotationTasks", {owner, annotation_taskset_id}, page_option);
            }
        },

        {
            name: 'annotation_task.update',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id, annotation_task_id, definition} = args;
                req.ensureUser(owner)
                return UPDATE_FROM_DB(
                    "AnnotationTasks",
                    {
                        owner, annotation_taskset_id, annotation_task_id,
                        definition: JSON.stringify(definition), ...create_spread()
                    },
                    {
                        owner, annotation_taskset_id, annotation_task_id,
                        definition: JSON.stringify(definition), ...update_spread()
                    },
                    '(owner, annotation_taskset_id, annotation_task_id)'
                );
            }
        },

        {
            name: 'annotation_task.get',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id, annotation_task_id} = args;
                req.ensureUser(owner)
                const ret = await GET_FROM_DB("AnnotationTasks", {owner, annotation_taskset_id, annotation_task_id});
                if (ret) {
                    ret.definition = JSON.parse(ret.definition)
                }
                return ret;
            }
        },

        {
            name: 'annotation_task.delete',
            handle: async function (args, req, res) {
                const {owner, annotation_taskset_id, annotation_task_id} = args;
                req.ensureUser(owner)
                return DELETE_FROM_DB("AnnotationTasks", {owner, annotation_taskset_id, annotation_task_id});
            }
        },
    ])


    api.addResolvers([

        {
            name: 'annotation_task_assignments.delete',
            handle: async function (args, req, res) {
                let {owner, annotation_taskset_id, assignment_id} = args;
                req.ensureUser(owner)
                return DELETE_FROM_DB("AnnotationTaskAssignments", {
                    owner, annotation_taskset_id, _id: assignment_id
                })
            }
        },

        {
            name: 'annotation_task_assignments.get',
            handle: async function (args, req, res) {
                let {owner, annotation_taskset_id, annotation_task_id_list} = args;
                req.ensureUser(owner)
            }
        },
        {
            name: 'annotation_task_assignments.list',
            handle: async function (args, req, res) {
                let {
                    owner, annotation_taskset_id,
                    annotation_task_id, worker_platform, worker_id,
                    selects, page_option
                } = args;
                req.ensureUser(owner)

                if (selects === undefined) {
                    selects = "*"
                }

                const extraFilter = remove_undefined({annotation_task_id, worker_platform, worker_id});
                logger.debug(extraFilter)

                const query_builder = () => knex("AnnotationTaskAssignments")
                    .select(selects)
                    .where({
                        owner, annotation_taskset_id, ...extraFilter
                    }).whereNotNull("complete_time")


                const count_query = () => knex("AnnotationTaskAssignments")
                    .where({
                        owner, annotation_taskset_id, ...extraFilter
                    }).whereNotNull("complete_time")


                const ret = await paged_query(query_builder, count_query, page_option)

                _.each(ret.payload, x => {
                    x.response = JSON.parse(x.response)
                })

                return ret;

                // .whereIn("annotation_task_id", annotation_task_id_list)
            }
        },
    ])

    api.addResolvers([

        {
            name: 'user_profile.update',
            handle: async function (args, req, res) {
                let {username, aws_access_key_id, aws_secret_access_key} = args;
                req.ensureUser(username)
                return UPDATE_FROM_DB(
                    "RequesterProfile",
                    {username, aws_access_key_id, aws_secret_access_key, ...create_spread()},
                    {username, aws_access_key_id, aws_secret_access_key, ...update_spread()},
                    '(username)'
                );
            }
        },

        {
            name: 'user_profile.get',
            handle: async function (args, req, res) {
                let {username} = args;
                req.ensureUser(username)
                return GET_FROM_DB("RequesterProfile", {username});
            }
        },
    ])


    api.addResolver({
        name: 'requester.exam.new_assignment',
        handle: async function (args, req, res) {
            // Decide if we should give exam to this worker.
            const {
                owner, exam_id,
                worker_id, worker_platform,
            } = args;

            const exam_config = await GET_FROM_DB("ExamConfigs", {
                owner, exam_id
            })

            if (exam_config === undefined) {
                throw new CrowdaqException(`Unable to find exam ${owner}/${exam_id}`)
            }

            const {
                num_of_questions,
                max_attempts,
                passing_grade,
                time_limit_in_seconds,
                instruction_id,
                tutorial_id
            } = exam_config;

            if (worker_id && worker_platform) {

                const unfinished_assignments = await knex("ExamAssignments")
                    .where({
                        owner, exam_id,
                        worker_id, worker_platform,
                        complete_time: null,
                        response_payload: null
                    })
                    .where("deadline", ">", new Date()) // Deadline is in the future.
                    .first()

                if (unfinished_assignments !== undefined) {
                    const {
                        assignment_payload,
                        _id
                    } = unfinished_assignments;

                    logger.debug("Retriving unfinished assignment.")

                    return {
                        _id,
                        instruction_id,
                        tutorial_id,
                        questions: JSON.parse(assignment_payload)
                    }
                }

                const existing_assignments = await knex("ExamAssignments")
                    .where({
                        owner, exam_id,
                        worker_id, worker_platform,
                    })
                    .whereNotNull("grade")

                if (existing_assignments.length > 0) {
                    const max_grade_of_worker = _.maxBy(existing_assignments, x => x.grade).grade;

                    if (max_grade_of_worker >= passing_grade) {
                        throw new CrowdaqException(`You have already passed ${owner}/${exam_id}`)
                    }

                    if (existing_assignments.length >= max_attempts) {
                        throw new CrowdaqException(`You have exceed the the maximum allowed attempts of exam ${owner}/${exam_id}`)
                    }
                }

                // Now we are sure that worker has 

                const {
                    _id, create_at, update_at
                } = create_spread();

                const deadline = moment(new Date()).add(time_limit_in_seconds, "seconds").toDate()

                const all_questions = _.shuffle(await knex("ExamQuestions").select('definition').where({
                    owner, exam_id, disabled: false
                }));

                const questions_to_sample = num_of_questions > 0 ?
                    Math.min(num_of_questions, all_questions.length)
                    :
                    all_questions.length

                const new_payload = _.chain(all_questions)
                    .slice(0, questions_to_sample)
                    .map(
                        qd => {
                            logger.debug(qd.definition)
                            const {
                                type,
                                question,
                                question_id
                            } = JSON.parse(qd.definition);
                            return {
                                type,
                                question,
                                question_id
                            }
                        }
                    ).values()

                const assignment_payload = JSON.stringify(new_payload)

                const ret = await knex("ExamAssignments")
                    .insert({
                        _id, create_at, update_at,
                        owner,
                        exam_id,
                        worker_id, worker_platform,
                        deadline,
                        assignment_payload
                    });

                let remain_attempts = max_attempts
                if (existing_assignments) {
                    remain_attempts = remain_attempts - existing_assignments.length
                }

                logger.debug("Return new assignment.")

                return {
                    _id,
                    instruction_id,
                    tutorial_id,
                    questions: new_payload,
                    remain_attempts
                }
            } else {

                const all_questions = num_of_questions > 0
                    ?
                    await knex("ExamQuestions").select('definition').where({
                        owner, exam_id, disabled: false
                    }).orderBy('_id').limit(num_of_questions)
                    :
                    await knex("ExamQuestions").select('definition').where({
                        owner, exam_id, disabled: false
                    }).orderBy('_id')


                return {
                    isPreview: true,
                    _id: '',
                    instruction_id,
                    tutorial_id,
                    questions: _.map(all_questions, row => JSON.parse(row.definition)),
                    remain_attempts: max_attempts
                }
            }
        }
    });

    api.addResolver({
        name: 'requester.exam.submit_assignment', handle: async function (args, req, res) {
            const ret = await knex.transaction(async function (trx) {
                const {
                    owner, exam_id, exam_assignment_id: _id,
                    worker_id, worker_platform,
                    user_response
                } = args;

                if (!worker_id || !worker_platform || _id === '') {
                    throw new CrowdaqException("Cannot submit in preview mode.");
                }


                const assignment = await trx("ExamAssignments").where({
                    _id
                }).first();

                if (assignment === undefined) {
                    throw new CrowdaqException(`Cannot find assignment ${_id}`)
                }

                const exam_config = await trx("ExamConfigs").where({
                    owner, exam_id
                }).first()

                if (exam_config === undefined) {
                    throw new CrowdaqException(`Unable to find exam ${owner}/${exam_id}`)
                }

                const assignment_payload = JSON.parse(assignment.assignment_payload)

                const question_ids = _.map(assignment_payload, x => x.question_id);
                logger.debug(question_ids);

                const all_questions = await trx("ExamQuestions")
                    .where({
                        owner, exam_id
                    }).whereIn("question_id", question_ids)

                logger.debug(all_questions);

                const question_answers = {};
                _.each(all_questions, question => {
                    const questionDef = JSON.parse(question.definition);
                    question_answers[question.question_id] = questionDef.answer;
                })

                logger.debug(question_answers);

                let correct_count = 0.0;
                let total_count = 0.0;


                for (let question of assignment_payload) {
                    total_count += 1.0;
                    const question_id = question.question_id;
                    const question_response = user_response[question_id];
                    logger.debug(`Correct response is ${question_answers[question_id]}, annotator answered ${question_response}`)
                    if (question_response !== undefined && question_response === question_answers[question_id]) {
                        correct_count += 1
                    }
                }

                const record_insert = _.map(assignment_payload, question => {
                    total_count += 1.0;
                    const question_id = question.question_id;
                    const question_response = user_response[question_id];
                    logger.debug(`Correct response is ${question_answers[question_id]}, annotator answered ${question_response}`)
                    if (question_response !== undefined && question_response === question_answers[question_id]) {
                        correct_count += 1
                    }

                    return trx("ExamAssignmentRecord").insert({
                        ...create_spread(),
                        owner, exam_assignment_id: _id,
                        exam_id, question_id,
                        selection: question_response,
                    })
                })

                await Promise.all(record_insert);

                const grade = correct_count / total_count;

                logger.debug({
                    owner, exam_id, _id,
                    worker_id, worker_platform
                })

                const ret = await knex("ExamAssignments")
                    .where({
                        owner, exam_id, _id,
                        worker_id, worker_platform
                    }).update({
                        response_payload: JSON.stringify(user_response),
                        complete_time: new Date(),
                        grade
                    })

                if (ret === 1) {


                    // This worker passed the exam, we shall grant qualification
                    if ((worker_platform === 'mturk') && exam_config.qualification_id) {
                        const ownerProfile = await GET_FROM_DB("RequesterProfile", {username: owner});

                        if (ownerProfile.aws_access_key_id && ownerProfile.aws_secret_access_key) {
                            let endpoint = "";

                            if (worker_platform === 'mturk-sandbox') {
                                endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com"
                            } else {
                                endpoint = "https://mturk-requester.us-east-1.amazonaws.com"
                            }

                            const mturk = new AWS.MTurk({
                                accessKeyId: ownerProfile.aws_access_key_id,
                                secretAccessKey: ownerProfile.aws_secret_access_key,
                                region: 'us-east-1',
                                endpoint: endpoint
                            });

                            const qualValue = `${Math.round(grade * 100)}`

                            try {
                                const mturkPromise = await new Promise((resolve, reject) => {
                                    mturk.associateQualificationWithWorker({
                                        QualificationTypeId: exam_config.qualification_id,
                                        WorkerId: worker_id,
                                        IntegerValue: qualValue,
                                        SendNotification: true
                                    }, function (err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                            reject();
                                        } else {
                                            resolve(true);
                                        }

                                    })
                                })
                            } catch (e) {
                                logger.error(e);
                            }
                        }
                    }

                    return {
                        success: true,
                        grade,
                        passingGrade: exam_config.passing_grade
                    }
                } else {
                    return {
                        success: false,
                        grade,
                        passingGrade: exam_config.passing_grade
                    }
                }
            })

            return ret;


            // 1. Get worker platform. (mturk/mturk-sandbox/crowdaq)
            // 2. Get Exam Configuration.
            // 3. Check if worker has unfinished assignment.
            // 4. Check if worker has already completed the exam or exceed the max allowed attempts.
            // 5. Assemble new exam for this worker.
        }
    })


    api.addResolver({
        name: 'requester.task.new_assignment', handle: async function (args, req, res) {
            const {
                owner, annotation_taskset_id, annotation_task_id,
            } = args;

            let {
                worker_id, worker_platform,
            } = args;

            if (!worker_id) {
                worker_platform = undefined,
                    worker_id = undefined
            }

            const task = await GET_FROM_DB("AnnotationTasks", {
                owner, annotation_taskset_id, annotation_task_id
            })

            if (task === undefined) {
                throw new CrowdaqException("Task not found.");
            }

            if (!worker_id || !worker_platform) {
                // Return "PREVIEW" assignments.

                return {
                    assignment_id: "PREVIEW",
                    task: JSON.parse(task.definition),
                }

            } else {
                const task_config = await GET_FROM_DB("AnnotationTaskConfigs", {
                    owner, annotation_taskset_id
                })

                if (task_config === undefined) {
                    throw new CrowdaqException("Cannot find task.")
                }

                const now = new Date();
                const deadline = moment(now).add(task_config.time_limit_in_seconds, "seconds");

                const existingAssignment = await GET_FROM_DB("AnnotationTaskAssignments", {
                    owner, annotation_taskset_id, annotation_task_id,
                    worker_id, worker_platform
                })

                if (existingAssignment === undefined) {
                    const cs = create_spread();
                    const new_assignment = await knex("AnnotationTaskAssignments").insert({
                        owner, annotation_taskset_id, annotation_task_id,
                        worker_id, worker_platform,
                        deadline: deadline.toDate(),
                        start_time: now,
                        ...cs
                    }).returning("*")

                    return {
                        assignment_id: cs._id,
                        task: JSON.parse(task.definition),
                    };
                } else {

                    if (existingAssignment.response !== null) {
                        throw new CrowdaqException("You have already finished this task.")
                    } else {

                        const us = update_spread();
                        const new_assignment = await knex("AnnotationTaskAssignments").update({
                            owner, annotation_taskset_id, annotation_task_id,
                            worker_id, worker_platform,
                            deadline: deadline.toDate(),
                            start_time: now,
                            ...us
                        }).where({
                            _id: existingAssignment._id
                        })

                        return {
                            assignment_id: existingAssignment._id,
                            task: JSON.parse(task.definition),
                        };
                    }
                }
            }
        }
    })


    api.addResolver({
        name: 'requester.task.submit_assignment', handle: async function (args, req, res) {
            const {
                owner,
                annotation_taskset_id, annotation_task_id,
                worker_id, worker_platform,
                task_assignment_id, payload
            } = args;

            if (!worker_id || !worker_platform) {
                throw new CrowdaqException("Cannot submit in preview mode.")
            }

            const assignment_exist = await GET_FROM_DB("AnnotationTaskAssignments", {
                owner, annotation_taskset_id, annotation_task_id,
                worker_id, worker_platform,
                _id: task_assignment_id
            })

            if (!assignment_exist) {
                // Make sure the existing assignment match the description.
                throw new CrowdaqException("Assignment do not exists");
            }

            const now = new Date();

            const ret = await knex("AnnotationTaskAssignments")
                .where({
                    _id: task_assignment_id
                })
                .update({
                    complete_time: now,
                    response: JSON.stringify(payload),
                    ...update_spread()
                })

            return {
                success: true
            }
        }
    })


    api.addResolver({
        name: 'feedback.submit',
        handle: async function (args, req, res) {
            const {
                owner,
                instruction_id,
                tutorial_id,
                exam_id,
                annotation_taskset_id,
                annotation_task_id,
                feedback,
                worker_email,
                full_url,
                worker_id,
                worker_platform
            } = args;

            const undefined_to_null = x => x === undefined ? null : x;

            const inst = await knex('Feedbacks').insert({
                ...create_spread(),
                owner,
                instruction_id: undefined_to_null(instruction_id),
                tutorial_id: undefined_to_null(tutorial_id),
                exam_id: undefined_to_null(exam_id),
                annotation_taskset_id: undefined_to_null(annotation_taskset_id),
                annotation_task_id: undefined_to_null(annotation_task_id),
                feedback,
                worker_email,
                full_url,
                worker_id,
                worker_platform
            });

            return {
                success: true
            }
        }
    })

    api.addResolver({
        name: 'feedback.list', handle: async function (args, req, res) {
            const {
                owner,
                instruction_id,
                tutorial_id,
                exam_id,
                annotation_taskset_id,
                annotation_task_id,
                worker_email,
                worker_id,
                worker_platform,
                page_option
            } = args;

            req.ensureUser(owner)

            const notNullFilter = {
                owner
            }

            const extraFilter = {
                ...remove_undefined({
                    instruction_id,
                    tutorial_id,
                    exam_id,
                    annotation_taskset_id,
                    annotation_task_id,
                    worker_email,
                    worker_id,
                    worker_platform,
                })
            }

            return LIST_FROM_DB("Feedbacks", {
                ...notNullFilter, ...extraFilter
            }, page_option);
        }
    })

    api.addResolver({
        name: 'report.get', handle: async function (args, req, res) {
            const {
                owner,
                report_type,
                report_id
            } = args;

            return GET_FROM_DB("CrowdaqReports", {
                owner,
                report_type,
                report_id
            });
        }
    })


    api.addResolver({
        name: 'annotation_taskset.report.get',
        handle: async function (args, req, res) {
            const {
                owner,
                annotation_taskset_id
            } = args;

            req.ensureUser(owner)

            const allAssignments = await knex("AnnotationTaskAssignments").where({
                owner,
                annotation_taskset_id
            }).whereNotNull("complete_time")

            const allTaskIds = await knex("AnnotationTasks")
                .select(["annotation_task_id"])
                .where({
                    owner,
                    annotation_taskset_id
                })

            logger.debug(`Found ${allAssignments.length} assignments`);
            logger.debug(`Found ${allTaskIds.length} tasks`);
            logger.debug(allTaskIds)

            const assignmentTimeSpentDistribution = _.map(allAssignments, assignment => {
                const timeSpent = (moment(assignment.complete_time) - moment(assignment.start_time)) / 1000.0;
                const {worker_platform, worker_id, annotation_task_id} = assignment;
                return {
                    timeSpent,
                    worker_platform,
                    worker_id,
                    annotation_task_id
                }
            });

            const workerSumarySorted = _.chain(allAssignments)
                .groupBy(x => `${x.worker_platform}-${x.worker_id}`)
                .map((assignments, k) => {
                    const {worker_platform, worker_id} = assignments[0];
                    return {
                        worker_platform, worker_id, assignments
                    }
                })
                .sortBy(({
                             worker_platform, worker_id, assignments
                         }) => {
                    return assignments.length;
                }).value()
            ;

            const workerFinishedDistribution = _.map(workerSumarySorted,
                ({worker_platform, worker_id, assignments}) => {
                    return {
                        worker_platform,
                        worker_id,
                        count: assignments.length
                    };
                })

            const meanAssignmentsFinished =
                _.meanBy(workerSumarySorted, ({assignments}) => assignments.length)

            const pairDiffsSum =
                _.sumBy(workerSumarySorted, ({assignments}) => {
                    const xi = assignments.length;
                    return _.sumBy(workerSumarySorted, ({assignments}) => {
                        const xj = assignments.length;
                        return Math.abs(xi - xj);
                    })
                })

            logger.debug(pairDiffsSum);
            logger.debug(workerSumarySorted.length);
            logger.debug(meanAssignmentsFinished);

            const giniScore = pairDiffsSum /
                (2.0 * workerSumarySorted.length * workerSumarySorted.length * meanAssignmentsFinished);

            const timeSpentByWorker = _.chain(workerSumarySorted)
                .map(({
                          worker_platform, worker_id, assignments
                      }) => {

                    const timeSpent = _.meanBy(assignments, x => (moment(x.complete_time) - moment(x.start_time)) / 1000.0)
                    logger.debug("timeSpent " + timeSpent)
                    return {
                        worker_platform, worker_id, timeSpent,
                        count: assignments.length
                    }
                });

            const finishedTaskIds = new Set();

            const timeSpentByTask = _.chain(assignmentTimeSpentDistribution)
                .groupBy(x => x.annotation_task_id)
                .map((assignments, annotation_task_id) => {
                    finishedTaskIds.add(annotation_task_id)
                    return {
                        annotation_task_id,
                        timeSpent: _.meanBy(assignments, x => x.timeSpent),
                        count: assignments.length
                    }
                }).value();


            _.each(allTaskIds, ({annotation_task_id}) => {
                if (!finishedTaskIds.has(annotation_task_id)) {
                    timeSpentByTask.push({
                        annotation_task_id,
                        timeSpent: undefined,
                        count: 0
                    })
                }
            })


            return {
                assignmentTimeSpentDistribution,
                timeSpentByWorker,
                timeSpentByTask,
                workerFinishedDistribution,
                giniScore,
                meanAssignmentsFinished
            }
        }
    })

    api.addResolver({
        name: 'exam.report.get', handle: async function (args, req, res) {
            const {
                owner,
                exam_id
            } = args;

            req.ensureUser(owner)

            let ret = await knex("ExamAssignments")
                .select('grade')
                .where({
                    owner,
                    exam_id
                }).whereNotNull('grade')

            const grades = _.map(ret, x => x.grade)

            logger.debug(grades)


            return {
                grades
            };
        }
    })


    api.addResolver({
        name: 'annotation_taskset.agreement', handle: async function (args, req, res) {
            const {
                owner,
                annotation_taskset_id,
            } = args;

            req.ensureUser(owner)

            const tasks = await knex("AnnotationTasks").where({
                owner,
                annotation_taskset_id,
            })

            const assignments = await knex("AnnotationTaskAssignments").where({
                owner,
                annotation_taskset_id,
            }).whereNotNull("response")

            _.each(tasks, t => {
                t.definition = JSON.parse(t.definition)
            })

            _.each(assignments, t => {
                console.log(t.response)
                t.response = JSON.parse(t.response)
            })


            const report = Dataset.generateDatasetReport(
                tasks,
                assignments);
            return {
                ...report
            }

        }
    })


    api.addResolver({
        name: 'exam.publish_to_mturk',
        handle: async function (args, req, res) {
            const {
                owner,
                external_url,
                sandbox,
                title,
                reward,
                description,
                LifetimeInSeconds,
                AssignmentDurationInSeconds,
                MaxAssignments
            } = args;

            req.ensureUser(owner)

            const ownerProfile = await GET_FROM_DB("RequesterProfile", {username: owner});

            if (ownerProfile.aws_access_key_id && ownerProfile.aws_secret_access_key) {
                let endpoint = "";

                if (sandbox) {
                    endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com"
                } else {
                    endpoint = "https://mturk-requester.us-east-1.amazonaws.com"
                }

                const mturk = new AWS.MTurk({
                    accessKeyId: ownerProfile.aws_access_key_id,
                    secretAccessKey: ownerProfile.aws_secret_access_key,
                    region: 'us-east-1',
                    endpoint: endpoint
                });

                const externalQuestion = `
<?xml version="1.0" encoding="UTF-8"?>
<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">
  <ExternalURL>${external_url}</ExternalURL>
  <FrameHeight>1600</FrameHeight>
</ExternalQuestion>      
                `.trim()

                try {
                    const mturkResponse = await new Promise((resolve, reject) => {
                        mturk.createHIT({
                            MaxAssignments: parseInt(MaxAssignments),
                            Question: externalQuestion,
                            Title: title,
                            Reward: reward,
                            Description: description,
                            LifetimeInSeconds,
                            AssignmentDurationInSeconds,
                        }, function (err, data) {
                            if (err) {
                                console.log(err, err.stack);
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        })
                    })
                    return {
                        success: true,
                        payload: mturkResponse
                    }
                } catch (e) {
                    logger.error(e);
                    return {
                        success: false,
                        message: e.message
                    }
                }
            } else {
                return {
                    success: false,
                    message: ''
                }
            }
        }
    })

}

module.exports = {installOn};