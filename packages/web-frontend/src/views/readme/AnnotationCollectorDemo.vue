<template>
  <div>

    <v-container>
      <v-app-bar>
        <MinimizeIconButton
            v-model="minimize_sidebar"
        ></MinimizeIconButton>
      </v-app-bar>
      <v-row>
        <v-col cols="2" v-show="!minimize_sidebar">
          <v-card class="pa-3">


            <div>
              <v-switch class="shrink mr-2 mt-0" v-model="show_definition" inset
                        label="Annotation Task Definition"></v-switch>
              <v-switch class="shrink mr-2 mt-0" v-model="show_interface" inset label="Annotation Interface"></v-switch>
              <v-switch class="shrink mr-2 mt-0" v-model="show_result" inset label="Annotation Results"></v-switch>
            </div>


          </v-card>

        </v-col>
        <v-col>

          <v-row>
            <v-col cols="12">
              <v-select
                  :items="examples"
                  v-model="selected_example"
                  filled
                  label="Select an Example from below or Edit the definition yourself."
              ></v-select>
              <!--                            v-bind:value="json_config" v-on:input="update_json_config"-->
              <CodeEditor
                  :value="json_config"
                  v-show="show_definition"
                  v-on:input="(v) => cached_json_config = v"
              ></CodeEditor>
              <v-btn color="primary" v-on:click="json_config=cached_json_config">Build Interface</v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-card class="pa-3">
                <SingleTaskAnnotationInterface
                    v-show="show_interface"
                    :annotation_groups="annotation_groups"
                    :contexts="contexts"
                    v-on:input="update_result"
                ></SingleTaskAnnotationInterface>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">

              <h3>Play with the interface above, and below will be the response you receive in real tasks.</h3>

              <v-card v-show="show_result">
                <v-card-text>
                  <CodeEditor v-bind:value="json_result" read-only></CodeEditor>
                </v-card-text>
              </v-card>

            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">

              <h3>Annotation Status</h3>

              <v-card v-show="show_result">
                <v-card-text>
                  <CodeEditor v-bind:value="json_status" read-only></CodeEditor>
                </v-card-text>
              </v-card>

            </v-col>
          </v-row>


        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import SingleTaskAnnotationInterface from "../../components/annotation/SingleTaskAnnotationInterface";
import CodeEditor from "../../components/misc/CodeEditor";

import AnnotationCollectorJson from "../../example_json/annotation_examples/complex"
import QATMR_JSON from "../../example_json/annotation_examples/qatmr"
import NER_JSON from "../../example_json/annotation_examples/ner"
import SENTIMENT_JSON from "../../example_json/annotation_examples/sentiment"
import REL_JSON from "../../example_json/annotation_examples/relation_extraction"
import COREF_JSON from "../../example_json/annotation_examples/coreference"
import IMAGE_CAPTION_JSON from "../../example_json/annotation_examples/image_caption"
import DCT_JSON from "../../example_json/annotation_examples/temporal_grounding"

import AnnotationSystemMixin from "../../mixins/annotation_system";
import MinimizeIconButton from "../../components/misc/MinimizeIconButton";

export default {
  name: "AnnotationCollectorDemo",
  components: {
    SingleTaskAnnotationInterface, CodeEditor, MinimizeIconButton
  },
  mixins: [AnnotationSystemMixin],
  props: {},
  data: () => ({
    minimize_sidebar: true,
    tab: 0,
    json_config: JSON.stringify(QATMR_JSON, null, 4),
    cached_json_config: "",
    results: {},
    show_interface: true,
    show_result: true,
    show_definition: true,
    examples: [
      "qatmr",
      "ner",
      "complex",
      "sentiment",
      "relation",
      "coref",
      "image_caption",
      "dct",
    ],
    example_to_json: {
      qatmr: QATMR_JSON,
      ner: NER_JSON,
      complex: AnnotationCollectorJson,
      sentiment: SENTIMENT_JSON,
      relation: REL_JSON,
      coref: COREF_JSON,
      image_caption: IMAGE_CAPTION_JSON,
      dct: DCT_JSON,
    },
    selected_example: "qatmr"
  }),
  watch: {
    selected_example: function (val) {
      console.log(this.example_to_json[val]);
      this.json_config = JSON.stringify(this.example_to_json[val], null, 4);
    },
  },
  computed: {
    json_result() {
      return JSON.stringify(this.get_all_annotation_result, null, 4);
    },
    json_status() {
      return JSON.stringify({
        status: this.get_all_annotation_status,
        condition_graph: this.get_all_conditions()
      }, null, 4);
    },
    annotation_groups() {
      try {
        return JSON.parse(this.json_config)['annotation_groups']
      } catch (e) {
        return []
      }
    },

    contexts() {
      try {
        return JSON.parse(this.json_config)['contexts']
      } catch (e) {
        return [];
      }
    }

  },
  methods: {
    update_json_config(value) {
      this.json_config = value;
    },
    update_result(value) {
      this.results = value;
    }
  }
}
</script>