<template>
  <v-container fluid>

    <!--        <v-row>-->
    <!--            <v-col cols="12" style="background-color: #eeeeee; height: 4em" class="mb-4 d-flex flex-row-reverse">-->
    <!--            </v-col>-->
    <!--        </v-row>-->

    <v-alert
        text
        color="info"
        v-if="showExternalSubmitButton">
      <v-row align="center">
        <v-col class="shrink">
          <v-btn
              color="success"
              v-on:click="submit_external_question">
            Submit Now
          </v-btn>
        </v-col>
        <v-col class="grow">
          This job will auto-submit and auto-reload in {{ submission_countdown }} seconds, or you can submit now by
          clicking the Submit Now button.
        </v-col>
      </v-row>
    </v-alert>

    <form
        name='mturk_form'
        method='post'
        id='mturk-external-submit-form'
        v-bind:action="hit_data.submit_to_url"
        hidden
    >
      <input type='hidden' name='assignmentId' id='assignmentId' v-bind:value="hit_data.assignment_id"/>
      <input name="mturk_submit_payload" type="hidden" v-model="mturk.mturk_submit_payload">
    </form>


    <SingleTaskAnnotationInterface
        :annotation_groups="assignment.annotation_groups"
        :contexts="assignment.contexts"
        v-on:submit="submit_response"
    ></SingleTaskAnnotationInterface>
  </v-container>
</template>

<script>
import SingleTaskAnnotationInterface from "../../components/annotation/SingleTaskAnnotationInterface";
import ExternalQuestion from '../../mixins/external_question'
import AnnotationSystemMixin from "../../mixins/annotation_system";

export default {
  name: 'AnnotationInterface',
  components: {
    SingleTaskAnnotationInterface
  },
  mixins: [
    ExternalQuestion, AnnotationSystemMixin
  ],
  data: function () {
    return {
      assignment: {
        annotation_groups: [],
        contexts: [],
      },
      task_assignment_id: "",
      result: {},
      submission_countdown: 20,
      showExternalSubmitButton: false,

      result_to_download: "",
      dialog: false,
    }
  },
  computed: {
    hit_data() {
      return this.$store.getters['worker_app_store/get_hit_data'];
    },
    page_info() {
      return this.$store.getters['worker_app_store/get_page_info'];
    },
    links() {
      return this.$store.getters['worker_app_store/get_links'];
    }
  },
  methods: {
    update_result(value) {
      this.result = value;
    },
    fetch_data() {
      this.$store.commit('worker_app_store/update_page_info', this.$route);
      const {owner, annotation_taskset_id, annotation_task_id} = this.$route.params;
      const {
        assignmentId, hitId
      } = this.$route.query;

      const {
        worker_id,
        worker_platform,
      } = this.hit_data;

      this.$client.make_request("requester.task.new_assignment", {
        owner, annotation_taskset_id, annotation_task_id,
        worker_id,
        worker_platform,
        assignmentId, hitId
      }).then(resp => {
        console.log(resp.data);
        this.assignment = resp.data.task;
        this.task_assignment_id = resp.data.assignment_id;
      }).catch(err => {

      })
    },
    submit_response(value) {
      value.meta = {url: this.$route.query}
      this.result = value;
      const {owner, annotation_taskset_id, annotation_task_id} = this.$route.params;
      const {
        assignmentId, hitId
      } = this.$route.query;

      const {
        worker_id,
        worker_platform,
      } = this.hit_data;

      this.$client.make_request("requester.task.submit_assignment", {
        owner, annotation_taskset_id, annotation_task_id,
        worker_id,
        worker_platform,
        assignmentId, hitId,
        task_assignment_id: this.task_assignment_id,
        payload: value
      }).then(resp => {
        if (resp.data.success) {
          this.showExternalSubmitButton = true;
          const submission_countdown = this.submission_countdown;
          const countDown = setInterval(() => {
            this.submission_countdown = this.submission_countdown - 1;
          }, 1000);

          setTimeout(() => {
            this.submission_countdown = 0;
            clearInterval(countDown);
            this.submit_external_question();
          }, submission_countdown * 1000);

        }
        console.log(resp.data);
      }).catch(err => {

      })
    },
  },
  mounted() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetch_data()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetch_data',
    'user_response': "update_progress"
  },
}
</script>
<style>
.selection-preview-box {
  border-radius: 10px;
  border: 2px dashed dodgerblue;
}
</style>