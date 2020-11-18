<template>
  <div>

    <v-card class="mb-2">
      <v-card-title>Assignment Filter</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <v-btn dense outlined @click="clearFilter">
              Clear Filter
            </v-btn>
          </v-col>

          <v-col>
            <v-text-field dense outlined label="Worker Platform" v-model="inputFilter.worker_platform"/>

          </v-col>

          <v-col>
            <v-text-field dense outlined label="Worker Id" v-model="inputFilter.worker_id"/>
          </v-col>
          <v-col>
            <v-btn dense outlined @click="applyFilter">
              Apply Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>


    <PaginatedTable
        :refresh_signal="refresh_signal"
        op="exam_assignment.list"
        :filter_arg="assignmentFilter"
    >
      <template v-slot:header>
        <v-row class="font-weight-bold">
          <v-col class="text-left">Worker</v-col>
          <v-col class="text-left">Grade</v-col>
          <v-col class="text-left">Complete At</v-col>
          <v-col class="text-left">Time Spent</v-col>
          <v-col class="text-left">Response</v-col>
          <v-col class="text-left">Edit</v-col>
        </v-row>

      </template>

      <template v-slot:item="{item}">
        <AssignmentRow
            @delete="() => deleteAssignment(item)"
            :item="item"/>
      </template>
    </PaginatedTable>

  </div>
</template>

<script>
import PaginatedTable from "../../../../components/requester/PaginatedTable";
import AssignmentRow from "./AssignmentRow";
import humanizeDuration from "humanize-duration";
import moment from "moment";

export default {
  name: "ExamAssignments",
  components: {
    PaginatedTable, AssignmentRow
  },
  props: {},
  data: function () {
    const {owner, exam_id} = this.$route.params;

    let {
      worker_platform, worker_id
    } = this.$route.query;

    return {
      refresh_signal: 0,
      inputFilter: {
        exam_id, worker_platform, worker_id
      },
      assignmentFilter: {
        owner, exam_id, worker_platform, worker_id
      }
    }
  },
  computed: {},
  methods: {
    clearFilter() {
      this.$router.push(this.$route.path)
    },
    applyFilter() {
      const {
        annotation_task_id, worker_platform, worker_id
      } = this.inputFilter;
      console.log({
        annotation_task_id, worker_platform, worker_id
      });
      this.$router.push({
        path: this.$route.path,
        query: {
          annotation_task_id, worker_platform, worker_id
        }
      })
    },

    deleteAssignment(item) {
      const {owner, exam_id, _id} = item;
      console.log(owner, exam_id, _id);
      this.$client.make_request('exam_assignment.delete', {owner, exam_id, _id})
          .then(resp => {
            this.refresh_signal += 1;
          })
          .catch(err => {

          })
    },
  },

  watch: {
    "$route": function () {
      const {owner, exam_id} = this.$route.params;

      let {
        worker_platform, worker_id
      } = this.$route.query;

      worker_platform = worker_platform === "" ? undefined : worker_platform;
      worker_id = worker_id === "" ? undefined : worker_id;

      this.inputFilter = {
        worker_platform, worker_id
      };

      this.assignmentFilter = {
        owner,
        exam_id,
        worker_platform, worker_id
      };

      this.refresh_signal += 1;
    }
  }
}
</script>