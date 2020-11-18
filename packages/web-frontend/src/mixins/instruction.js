const InstructionMixin = {
    data: () => {
        return {
            instruction: {
                data: {
                    document: "",
                    name: ""
                },
                loading: false
            }
        }
    },
    methods: {
        fetch_instruction(owner, name){
            this.$client.get_instruction(owner, name)
                .then(resp => {
                    const data = resp.data;
                    this.instruction.data.document = data.document;
                    this.instruction.loading =false;
                })
                .catch(error => {
                    this.handle_axios_error(this, error)
                })
        }
    }
};

export default InstructionMixin;