<template>
  <div style="display: contents">
    <v-row>
      <v-col>{{ item.question_id }}</v-col>
      <v-col>
        <v-btn @click="expanded = !expanded" icon>
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </v-col>
      <v-col>

        <v-btn text color="error" @click="$emit('disable', item)" v-if="!item.disabled">
          <v-icon>mdi-stop</v-icon>
          Disable This
        </v-btn>

        <v-btn text color="success" @click="$emit('enable', item)" v-else>
          <v-icon>mdi-play</v-icon>
          Enable This
        </v-btn>
      </v-col>
      <v-col>
        {{ item.totalCount }}
      </v-col>
      <v-col>
        {{ item.definition.answer }}
      </v-col>
      <v-col>
        {{ averageScore }}
      </v-col>
      <v-col>
        <v-progress-linear
            v-for="x in item.answerDistribution" :key="x.selection"
            :value="parseInt(x.count) * 100 / item.totalCount"
            height="25"
            :color="x.selection === item.definition.answer ? 'success' : 'error'"
        >
          <strong> Count({{ x.selection }}) = {{ x.count }}</strong>
        </v-progress-linear>
        <!--                <PlotlyPlot-->
        <!--                        :data="responsePidChart"-->
        <!--                        :layout = "{-->
        <!--                            height: 250,-->
        <!--                            width: 250-->
        <!--                        }"-->
        <!--                />-->
      </v-col>
    </v-row>
    <v-row v-if="expanded">
      <v-col cols="12">
        <MCQuestion
            :question="item.definition"
            :is_answered="true"
        ></MCQuestion>
      </v-col>
    </v-row>
  </div>
</template>


<script>
import MCQuestion from "../../../../components/MCQuestion";
import PlotlyPlot from "../../../../components/plots/PlotlyPlot";
import _ from 'lodash';

export default {
  name: "ExamQuestionRow",
  components: {
    MCQuestion
  },
  props: {
    item: Object
  },
  computed: {
    averageScore() {
      const cor = _.find(this.item.answerDistribution, x => x.selection === this.item.definition.answer);
      if (cor) {
        return parseInt(cor.count) * 100 / this.item.totalCount;
      } else {
        return 0;
      }
    }
  },
  data: () => ({
    expanded: false
  })
}
</script>