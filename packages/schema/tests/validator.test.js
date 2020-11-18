const CrowdaqSchema = require("../crowdaq/index");

const validator = new CrowdaqSchema.JsonValidator();

test('Bad json example should fail.', () => {

    // console.log(validator.validate_tutorial(require("./bad_json/tutorial/simple")));

    expect(
        validator.validate_tutorial(require("./bad_json/tutorial/simple")).valid
    ).toBe(false);
});


test('Good json example should pass.', () => {
    expect(
        validator.validate_tutorial(require("../crowdaq/examples/tutorial/simple")).valid
    ).toBe(true);

    expect(
        validator.validate_exam(require("../crowdaq/examples/exam/simple")).valid
    ).toBe(true);

    expect(
        validator.validate_tutorial(require("../crowdaq/examples/tutorial/simple")).valid
    ).toBe(true);

    // console.log(
    //     validator.validate_annotation_task(
    //         require("../crowdaq/examples/annotation_task/complex")
    //     ));

    console.log(validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/complex")));

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/complex")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/coreference.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/image_caption.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/ner.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/qatmr.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/relation_extraction.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/sentiment.json")).valid
    ).toBe(true);

    expect(
        validator.validate_annotation_task(require("../crowdaq/examples/annotation_task/temporal_grounding.json")).valid
    ).toBe(true);
});


