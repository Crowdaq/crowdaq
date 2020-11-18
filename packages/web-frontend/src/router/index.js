import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
// import Instructions from "../views/requester/instruction/Instructions";
// import Tutorial from "../views/requester/tutorial/Tutorial";
// import Exam from "../views/requester/exam/Exam";
import PageNotFound from "../views/PageNotFound";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: (to, from, next) => {
      next('/login')
    }
  },
  {
    path: '/login',
    name: 'Login',
    meta:{
      title: "Login"
    },
    component: () => import(/* webpackChunkName="login" */ '../views/requester/Login.vue')
  },
  {
    path: "/doc",
    name: "Documentation",
    meta:{
      title: "Documentation"
    },
    component: () => import(/* webpackChunkName="readme" */ '../views/readme/Readme.vue'),
  },
  {
    path: "/collector_demo",
    name: "AnnotationCollectorDemo",
    meta:{
      title: "Annotation UI Demo"
    },
    component: () => import(/* webpackChunkName="demo" */ '../views/readme/AnnotationCollectorDemo.vue'),
  },



  {
    path: '/w',
    name: 'Worker Interface',
    component: () => import(/* webpackChunkName="worker" */ '../views/work/WorkApp.vue'),
    children: [
      {
        path: 'instruction/:owner/:instruction_id',
        name: 'WorkerInstruction',
        meta:{
          title: "Instruction",
          type: "instruction",
        },

        component: () => import(/* webpackChunkName="worker" */ '../views/work/Instruction.vue')
      },
      {
        path: 'tutorial/:owner/:tutorial_id',
        name: 'WorkerTutorial',
        meta:{
          title: "Tutorial",
          type: "tutorial",
        },
        component: () => import(/* webpackChunkName="worker" */ '../views/work/Tutorial.vue')
      },
      {
        path: 'exam/:owner/:exam_id',
        name: 'WorkerExam',
        meta:{
          title: "Exam",
          type: "exam",
        },
        component: () => import(/* webpackChunkName="worker" */ '../views/work/Exam.vue')

      },
      {
        path: 'task/:owner/:annotation_taskset_id/:annotation_task_id',
        name: 'WorkerAnnotationTask',
        meta:{
          title: "Annotation Task",
          type: "task",
        },
        component: () => import(/* webpackChunkName="worker" */ '../views/work/AnnotationTask.vue')
      },
    ]
  },
  {
    path: "/studio",
    name: "Design Studio",
    meta:{
      title: "Crowdaq - Design Studio"
    },
    component: () => import(/* webpackChunkName="demo" */ '../views/requester/DesignStudio.vue'),
  },
  {
    path: '/requester/:owner',
    name: 'Requester Interface',
    component: () => import(/* webpackChunkName="requester" */ "../views/requester/RequesterApp"),
    children: [
      {
        path: 'instruction',
        name: 'RequesterInstructions',
        meta:{
          title: "Instructions"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/instruction/Instructions.vue')
      },
      {
        path: 'instruction/:instruction_id',
        name: 'RequesterInstruction',
        meta:{
          title: "Instruction"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/instruction/Instruction.vue')
      },


      {
        path: 'tutorial',
        name: 'RequesterTutorials',
        meta:{
          title: "Tutorials"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/tutorial/Tutorials.vue')
      },
      {
        path: 'tutorial/:tutorial_id',
        name: 'RequesterTutorial',
        meta:{
          title: "Tutorial"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/tutorial/Tutorial.vue')
      },
      {
        path: 'exam',
        name: 'RequesterExams',
        meta:{
          title: "Exams"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/Exams.vue')
      },
      {
        path: 'exam/:exam_id',
        name: 'RequesterExam',
        meta:{
          title: "Exam"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/Exam.vue'),
        redirect: 'exam/:exam_id/report',
        children: [
          {
            path: 'report',
            name: 'RequesterExamReport',
            meta:{
              title: "Exams"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/children/Report')
          },
          {
            path: 'assignments',
            name: 'RequesterExamAssignments',
            meta:{
              title: "Exams"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/children/Assignments')
          },
          {
            path: 'questions',
            name: 'RequesterExamQuestions',
            meta:{
              title: "Exams"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/children/Questions')
          },
        ]
      },

      {
        path: 'exam/:exam_id/question/:question_id',
        name: 'RequesterExamQuestion',
        meta:{
          title: "Exams"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/exam/ExamQuestion')
      },


      {
        path: 'feedback',
        name: 'RequesterFeedback',
        meta:{
          title: "Feedback"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/feedback/Feedbacks.vue')
      },

      {
        path: "taskset",
        name: "RequesterTasksetList",
        meta:{
          title: "TaskSet List"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/TaskSetList.vue'),
      },

      {
        path: "taskset/:annotation_taskset_id",
        name: "RequesterTaskSet",
        meta:{
          title: "TaskSet"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/TaskSet.vue'),
        redirect: 'taskset/:annotation_taskset_id/tasks',

        children: [
          {
            path: 'report',
            name: 'RequesterTaskReport',
            meta:{
              title: "TaskReport"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/children/TasksetReport')
          },
          {
            path: 'assignments',
            name: 'RequesterTaskAssignments',
            meta:{
              title: "TaskAssignments"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/children/TaskAssignments')
          },
          {
            path: 'tasks',
            name: 'RequesterAnnotationTasks',
            meta:{
              title: "Tasks"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/children/Tasks')
          },
          {
            path: 'agreement',
            name: 'RequesterAnnotationAgreement',
            meta:{
              title: "Tasks"
            },
            component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/children/TaskAgreements')
          },
        ]
      },

      {
        path: 'taskset/:annotation_taskset_id/task/:annotation_task_id',
        name: 'RequesterTask',
        meta:{
          title: "Task"
        },
        component: () => import(/* webpackChunkName="requester" */ '../views/requester/tasks/Task.vue'),
      },
    ],
    beforeEnter: (to, from, next) => {
      console.log(to.path);
      next()
    }
  },

  {
    path: "*",
    name: "PageNotFound",
    component: PageNotFound,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});


router.afterEach((to, from) => {
  if (to.meta && to.meta.title){
    document.title = "crowdaq - " + to.meta.title;
  }
});


export default router
