<template>
  <v-card>
    <v-card-title>
      Publish Exam To Mturk
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col>
            <v-checkbox
                label="Use sandbox?"
                v-model="sandbox"></v-checkbox>
            <v-textarea
                outlined
                label="Task Title"
                v-model="title"></v-textarea>
            <v-text-field
                outlined
                label="Reward per attempt"
                v-model="reward"></v-text-field>
            <v-textarea
                outlined
                label="Description"
                v-model="description"></v-textarea>

            <v-text-field
                outlined
                label="LifetimeInSeconds"
                v-model="LifetimeInSeconds"></v-text-field>

            <v-text-field
                outlined
                label="AssignmentDurationInSeconds"
                v-model="AssignmentDurationInSeconds"></v-text-field>

            <v-text-field
                outlined
                label="MaxAssignments"
                v-model="MaxAssignments"></v-text-field>

            <v-textarea
                label="Exam URL"
                outlined
                v-model="external_url"
                messages="Make sure other people can see the exam via this link"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-container>

    </v-card-text>

    <v-card-actions>
      <v-btn @click="publish">Publish</v-btn>
    </v-card-actions>

  </v-card>
</template>

<script>

export default {
  name: 'MTurkPublisher',
  props: {
    init_url: {
      type: String,
    }
  },

  data: function () {

    let init_url = this.init_url;

    if (!init_url.startsWith('http')) {
      init_url = `${window.location.protocol}//${window.location.hostname}${init_url}`
    }

    return {
      sandbox: true,
      title: 'Your Task Title',
      reward: '0.01',
      description: 'Your task descriptions',
      LifetimeInSeconds: '36000',
      AssignmentDurationInSeconds: '3600',
      MaxAssignments: '10',
      external_url: init_url
    }
  },

  methods: {
    publish() {
      const {owner} = this.$route.params;

      const {
        sandbox,
        title,
        reward,
        description,
        external_url,
        LifetimeInSeconds,
        AssignmentDurationInSeconds,
        MaxAssignments
      } = this;

      this.$client.make_request('exam.publish_to_mturk', {
        owner,
        sandbox,
        title,
        reward,
        description,
        external_url,
        LifetimeInSeconds,
        AssignmentDurationInSeconds,
        MaxAssignments
      }).then(resp => {
        if (resp.data.success) {
          console.log(resp.data.payload);
          this.$notify({
            text: 'Exam published.',
            type: 'success'
          });
          this.$emit('success')
        } else {
          this.$notify({
            text: `Failed, please check MTurk to make sure nothing is published by accident. Reason: ${resp.data.message}`,
            type: 'error'
          })
          this.$emit('failure');
        }

      })
    }
  }
}
</script>