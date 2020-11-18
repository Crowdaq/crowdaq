function CrowdaqException(message, code=500) {
    this.code = code;
    this.message = message;
    this.name = 'CrowdaqException';
 }

 module.exports = CrowdaqException;
 