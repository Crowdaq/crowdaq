<template>
  <v-card :loading="loading">
    <v-card-text>
      <v-container>
        <v-row>
          <v-col>
                        <span
                            class="pb-4"
                            style="font-size: large"
                            v-if="exam_id !== ''"
                        >
                            <b>Exam ID:</b> <span style="text-decoration: underline">{{ exam_id }}</span>
                        </span>
            <v-text-field
                label="Exam ID"
                v-else
                v-model="new_exam_id">
            </v-text-field>


            <v-text-field
                label="Instruction ID"
                v-model="instruction_id">
            </v-text-field>

            <v-text-field
                label="Tutorial ID"
                v-model="tutorial_id">
            </v-text-field>

            <v-text-field
                label="MTurk Qualification ID"
                v-model="qualification_id">
            </v-text-field>

            <v-text-field
                label="Number of question per exam offering (0 to include all questions)"
                v-model="num_of_questions"></v-text-field>
            <v-text-field
                label="Max allow attempts"
                v-model="max_attempts"></v-text-field>
            <v-text-field
                label="Passing Grade"
                v-model="passing_grade"></v-text-field>
            <v-text-field
                label="Time Limit in Seconds"
                v-model="time_limit_in_seconds">
            </v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-card-actions>
      <v-btn outlined color="success" @click="update" :disabled="loading">
        Update
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  name: "ExamConfig",
  props: {
    owner: String,
    exam_id: {
      type: String,
      default: ""
    }
  },
  data: () => ({
    loading: false,
    changed: false,
    new_exam_id: "",
    num_of_questions: 0,
    max_attempts: 2,
    passing_grade: 0.7,
    time_limit_in_seconds: 3600,
    instruction_id: undefined,
    tutorial_id: undefined,
    qualification_id: undefined,
  }),
  methods: {
    load() {
      if (this.exam_id !== '') {
        const {owner, exam_id} = this;
        this.loading = true;
        this.$client.make_request("exam.get", {
          owner, exam_id
        }).then(resp => {
          this.loading = false;
          this.num_of_questions = resp.data.num_of_questions;
          this.max_attempts = resp.data.max_attempts;
          this.passing_grade = resp.data.passing_grade;
          this.time_limit_in_seconds = resp.data.time_limit_in_seconds;
          this.instruction_id = resp.data.instruction_id;
          this.tutorial_id = resp.data.tutorial_id;
          this.qualification_id = resp.data.qualification_id;

          this.changed = false;
        }).catch(err => {
          this.loading = false;
        });
      }
    },
    update() {

      const {
        num_of_questions,
        max_attempts,
        passing_grade,
        time_limit_in_seconds,
        owner,
        instruction_id,
        tutorial_id,
        qualification_id
      } = this;

      const exam_id = this.exam_id !== '' ? this.exam_id : this.new_exam_id;

      const definition = {
        num_of_questions,
        max_attempts,
        passing_grade,
        time_limit_in_seconds,
        instruction_id,
        tutorial_id,
        qualification_id
      };

      this.$client.make_request("exam.update", {
        owner, exam_id, definition
      }).then(resp => {
        this.$emit('update', {
          owner, exam_id, definition
        })
      }).catch(err => {
        console.log(err);
      });
    }
  },
  watch: {
    num_of_questions: function () {
      this.changed = true;
    },
    max_attempts: function () {
      this.changed = true;
    },
    passing_grade: function () {
      this.changed = true;
    },
    time_limit_in_seconds: function () {
      this.changed = true;
    },
    exam_id: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal === '') {
          return;
        } else {
          this.load()
        }
      },
    },
  }
}
</script>