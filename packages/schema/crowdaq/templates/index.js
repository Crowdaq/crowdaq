module.exports = {
    instruction: `
        # A Markdown Instruction
    `.trim(),
    tutorial: require("./tutorial.json"),
    exam: require("./exam.json"),
    exam_question: require("./exam_question.json"),
    annotation_task: require("./annotation_task.json"),
}