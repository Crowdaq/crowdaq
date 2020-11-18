export default {
    data: () => ({
        progress_tracker: {
            current_progress: 0,
            total_progress: 0
        }
    }),
    methods: {
        increment_progress(inc=1){
            this.progress_tracker.current_progress += inc;
        },
        set_progress(progress){
            this.progress_tracker.current_progress = progress;
        },
    }
};
