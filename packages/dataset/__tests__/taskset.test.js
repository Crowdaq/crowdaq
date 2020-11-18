'use strict';

const taskset = require("../lib/taskset")

test('Taskset aggregator should work', () => {

    let taskDefinition = {
        annotation_groups: [
            {
                id: "id1",
                annotations: [
                ]
            }
        ]
    }
    expect(taskset.listCollectors(taskDefinition)).toEqual([]);

    taskDefinition = {
        annotation_groups: [
            {
                id: "gid1",
                annotations: [
                    {
                        id: "c1",
                        type: 'text'
                    }
                ]
            },
            {
                id: "gid2",
                repeated: true,
                annotations: [
                    {
                        id: "c1",
                        type: 'text'
                    },
                    {
                        id: "c2",
                        type: 'multiple-choice'
                    }
                ]
            }
        ]
    }
    expect(taskset.listCollectors(taskDefinition)).toEqual([
        "gid1.(text)c1", 'gid2[].(text)c1', 'gid2[].(multiple-choice)c2'
    ]);
});
